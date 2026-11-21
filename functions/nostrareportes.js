'use strict';
/* NostraREPORTES: publicación privada supervisada.
   Las cuentas de alumnos sólo descargan sus propios reportes publicados. */
const {onRequest}=require('firebase-functions/v2/https');
const {getApps,getApp,initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {createHash}=require('node:crypto');
const {MAX_ROWS,MAX_BATCH_BYTES,validBatch,validatedRow,normalizedName,derivedReportId}=require('./lib/nostrapublicador-policy');
const {PublicError,bodyOf,requirePost,send,clean}=require('./lib/common');
const {isStudent,isEnrolled}=require('./lib/nostraportal-policy');
const {
  MAX_PDF,validUid,validReportId,stagePath,privatePath,
  reportMeta,pdfValid,authorizedDoc,safeListing
}=require('./lib/nostrareportes-policy');

const app=getApps().length?getApp():initializeApp();
const auth=getAuth(app),db=getFirestore(app);
const BUCKET='nostrachat-grupo-nostradamus.firebasestorage.app';
const storage=getStorage(app).bucket(BUCKET);
const ADMIN='fernandodaniel8888@gmail.com';
const OPTIONS={
  region:'us-central1',cors:['https://gruponostradamus.edu.pe','https://www.gruponostradamus.edu.pe','http://localhost:5500','http://127.0.0.1:5500'],
  timeoutSeconds:60,memory:'256MiB',maxInstances:3,minInstances:0
};

async function identity(req){
  const m=/^Bearer\s+(\S+)$/i.exec(clean(req.headers.authorization));
  if(!m)throw new PublicError(401,'INICIA_SESION','Debes iniciar sesión para consultar reportes.');
  let token;
  try{token=await auth.verifyIdToken(m[1],true)}
  catch(_){throw new PublicError(401,'SESION_INVALIDA','Inicia sesión nuevamente.')}
  const snap=await db.collection('users').doc(token.uid).get();
  return {uid:token.uid,token,profile:snap.exists?snap.data():null};
}
function requireAdmin(caller){
  if(!caller.token.email_verified||String(caller.token.email||'').toLowerCase()!==ADMIN)
    throw new PublicError(403,'NO_AUTORIZADO','Se requiere una sesión administrativa autorizada.');
}
async function verifiedLink(uid){
  if(!validUid(uid))throw new PublicError(400,'UID_INVALIDO','La cuenta seleccionada no es válida.');
  const [account,link]=await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('nostraportal_vinculos').doc(uid).get()
  ]);
  if(!account.exists||!isStudent(account.data()))
    throw new PublicError(409,'CUENTA_NO_ACTIVA','Solo se publican reportes para alumnos con NostraCUENTA activa.');
  if(!link.exists)throw new PublicError(409,'VINCULO_PENDIENTE','El alumno aún no tiene matrícula vinculada.');
  const id=link.data().preinscripcionId;
  if(typeof id!=='string'||!/^[A-Za-z0-9_-]{8,180}$/.test(id))
    throw new PublicError(409,'VINCULO_INVALIDO','La matrícula vinculada requiere revisión.');
  const [inverse,enrollment]=await Promise.all([
    db.collection('nostraportal_vinculos_inversos').doc(id).get(),
    db.collection('preinscripciones').doc(id).get()
  ]);
  if(!inverse.exists||inverse.data().uid!==uid||!enrollment.exists||!isEnrolled(enrollment.data()))
    throw new PublicError(409,'VINCULO_INVALIDO','La cuenta y su matrícula deben verificarse en NostraADMIN.');
  return {uid,preinscripcionId:id,account:account.data(),enrollment:enrollment.data()};
}
const docRef=(uid,id)=>db.collection('reportes_alumnos').doc(uid).collection('documentos').doc(id);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

async function adminPublish(body,caller){
  requireAdmin(caller);
  const uid=body.uid,id=body.reportId,meta=reportMeta(body);
  if(!validUid(uid)||!validReportId(id)||!meta)
    throw new PublicError(400,'DATOS_INVALIDOS','Selecciona alumno, evaluación y fecha válidos, y confirma la revisión del informe.');
  const link=await verifiedLink(uid);
  const stage=storage.file(stagePath(uid,id));
  const [exists]=await stage.exists();
  if(!exists)throw new PublicError(404,'ARCHIVO_NO_SUBIDO','Carga primero el PDF desde el panel administrativo.');
  const [fileMeta]=await stage.getMetadata();
  const custom=fileMeta.metadata||{};
  if(custom.uid!==uid||custom.reportId!==id||custom.subidoPor!==caller.token.email
      ||fileMeta.contentType!=='application/pdf'||Number(fileMeta.size)>MAX_PDF
      ||Number(fileMeta.size)<=100)
    throw new PublicError(400,'ARCHIVO_NO_VALIDO','El archivo no corresponde a esta cuenta o excede el límite permitido.');
  const [buffer]=await stage.download();
  if(!pdfValid(buffer,fileMeta))
    throw new PublicError(400,'PDF_INVALIDO','El PDF no supera la validación técnica básica de estructura y tamaño.');
  const path=privatePath(uid,id),privateFile=storage.file(path),sha256=digest(buffer);
  let uploaded=false;
  try{
    await privateFile.save(buffer,{
      resumable:false,
      preconditionOpts:{ifGenerationMatch:0},
      metadata:{
        contentType:'application/pdf',cacheControl:'private,no-store,max-age=0',
        contentDisposition:'attachment; filename="NostraREPORTES-'+id+'.pdf"',
        metadata:{recipientUid:uid,reportId:id,origen:'NostraREPORTES',sha256}
      }
    });
    uploaded=true;
    await docRef(uid,id).create({
      uid,reportId:id,preinscripcionId:link.preinscripcionId,
      ...meta,estado:'publicado',path,sha256,
      bytes:buffer.length,contentType:'application/pdf',
      qaTecnica:'basica_pdf',qaDeclaracionOperador:true,
      publicadoPor:caller.token.email,publicadoAt:FieldValue.serverTimestamp()
    });
  }catch(error){
    if(uploaded)await privateFile.delete().catch(e=>console.error('No se pudo revertir archivo sin índice',e));
    if(error?.code===6||error?.code===409)
      throw new PublicError(409,'REPORTE_EXISTENTE','Ya existe un reporte con este identificador. No se sobrescribió.');
    throw error;
  }
  await stage.delete().catch(e=>console.warn('Archivo de preparación pendiente de limpieza',e.message));
  return {publicado:true,reportId:id,titulo:meta.titulo,fecha:meta.fecha};
}


/*
 * NostraPUBLICADOR lote protegido:
 * - validación sin escritura siempre disponible para admin;
 * - publicación sólo si una lista de UID permitidos está habilitada en Firebase.
 * Por defecto el sistema falla cerrado y NO alcanza alumnos reales.
 */
async function adminBatch(body,caller,doPublish){
  requireAdmin(caller);
  const bundle=body?.bundle;
  if(!validBatch(bundle))throw new PublicError(400,'LOTE_INVALIDO','Revisa el manifiesto de publicación y NostraQA.');
  if(Buffer.byteLength(JSON.stringify(bundle),'utf8')>MAX_BATCH_BYTES)
    throw new PublicError(413,'LOTE_GRANDE','Divide el lote en paquetes de hasta 16 MB.');
  if(doPublish&&(body.qaRevisado!==true||body.confirmarPublicacion!==true))
    throw new PublicError(400,'CONFIRMACION_PENDIENTE','Confirma la revisión NostraQA y los destinatarios del lote.');
  const control=doPublish?(await db.collection('nostrapublicador_config').doc('publicacion').get()):null;
  const allow=new Set(control?.exists&&control.data().enabled===true&&Array.isArray(control.data().permitidos)
    ?control.data().permitidos.filter(validUid):[]);
  const output=[];
  let totalBytes=0;
  for(const row of bundle.rows){
    const receipt={ficha_id:String(row.ficha_id).slice(0,100),estado:'REQUIERE_REVISION'};
    try{
      const ready=validatedRow(row);
      if(!ready){receipt.detalle='Identidad o PDF no superó las verificaciones del lote.';output.push(receipt);continue}
      totalBytes+=ready.bytes.length;
      if(totalBytes>MAX_BATCH_BYTES)throw new PublicError(413,'LOTE_GRANDE','Se superó el máximo de datos PDF del lote.');
      const link=await verifiedLink(ready.uid);
      if(link.preinscripcionId!==ready.preinscripcionId
        ||normalizedName(link.enrollment.nombre)!==ready.name){
        receipt.detalle='La identidad del informe no coincide con la matrícula oficial.';
        output.push(receipt);continue;
      }
      const reportId=derivedReportId(ready.uid,bundle.evaluacion_id);
      const ref=docRef(ready.uid,reportId);
      const previous=await ref.get();
      if(previous.exists){
        const data=previous.data();
        if(data.estado==='publicado'&&data.sha256===row.pdf_sha256
          &&data.preinscripcionId===ready.preinscripcionId
          &&data.evaluacionId===bundle.evaluacion_id){
          receipt.estado='YA_PUBLICADO';receipt.reportId=reportId;
        }else{receipt.detalle='Existe un informe anterior o revocado. Se requiere revisión; no se sobrescribe.'}
        output.push(receipt);continue;
      }
      if(!doPublish){receipt.estado='VALIDADO_SIN_PUBLICAR';output.push(receipt);continue}
      if(!allow.has(ready.uid)){
        receipt.estado='NO_AUTORIZADO_PARA_PRUEBA';
        receipt.detalle='Publicación restringida a UID expresamente autorizados por NostraADMIN.';
        output.push(receipt);continue;
      }
      const path=privatePath(ready.uid,reportId),file=storage.file(path);
      let stored=false;
      try{
        await file.save(ready.bytes,{
          resumable:false,preconditionOpts:{ifGenerationMatch:0},
          metadata:{contentType:'application/pdf',cacheControl:'private,no-store,max-age=0',
            contentDisposition:'attachment; filename="NostraREPORTES-'+reportId+'.pdf"',
            metadata:{recipientUid:ready.uid,reportId,sha256:row.pdf_sha256,origen:'NostraPUBLICADOR'}}
        });
        stored=true;
        await ref.create({
          uid:ready.uid,preinscripcionId:ready.preinscripcionId,reportId,
          evaluacionId:bundle.evaluacion_id,loteId:bundle.lote_id,
          titulo:String(bundle.evaluacion_titulo||'Informe académico').slice(0,110),
          evaluacion:String(bundle.evaluacion_titulo||'Evaluación').slice(0,100),
          fecha:String(bundle.evaluacion_fecha||'').slice(0,10),
          fuente:'NostraREPORTES',estado:'publicado',path,
          sha256:row.pdf_sha256,bytes:ready.bytes.length,contentType:'application/pdf',
          qaManifestSha256:bundle.qa_manifest_sha256,qaTecnica:'basica_pdf',
          qaDeclaracionOperador:true,publicadoPor:caller.token.email,
          publicadoAt:FieldValue.serverTimestamp()
        });
        receipt.estado='PUBLICADO_VERIFICADO';receipt.reportId=reportId;
      }catch(error){
        if(stored)await file.delete().catch(e=>console.error('NostraPUBLICADOR: error en limpieza de archivo huérfano',e));
        receipt.estado='ERROR_PUBLICACION';
        receipt.detalle='No se guardó el documento; revisa permisos o duplicados.';
      }
    }catch(error){
      receipt.estado='REQUIERE_REVISION';
      receipt.detalle=error instanceof PublicError?error.message:'No se pudo validar la identidad de esta ficha.';
    }
    output.push(receipt);
  }
  return {loteId:bundle.lote_id,modo:doPublish?'publicacion_restringida':'validacion_sin_escritura',
    total:output.length,publicados:output.filter(x=>x.estado==='PUBLICADO_VERIFICADO').length,
    validados:output.filter(x=>x.estado==='VALIDADO_SIN_PUBLICAR').length,
    pendientes:output.filter(x=>!['PUBLICADO_VERIFICADO','YA_PUBLICADO','VALIDADO_SIN_PUBLICAR'].includes(x.estado)).length,
    resultados:output};
}

async function adminList(body,caller){
  requireAdmin(caller);
  const {uid}=body;
  const link=await verifiedLink(uid);
  const snap=await db.collection('reportes_alumnos').doc(uid).collection('documentos').limit(100).get();
  const docs=snap.docs.filter(d=>d.data().preinscripcionId===link.preinscripcionId)
    .map(d=>safeListing(d.data(),d.id)).filter(Boolean)
    .sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return {reportes:docs};
}

async function adminRevoke(body,caller){
  requireAdmin(caller);
  const {uid,reportId}=body;
  if(!validUid(uid)||!validReportId(reportId))
    throw new PublicError(400,'DATOS_INVALIDOS','Identificador de informe inválido.');
  const link=await verifiedLink(uid);
  const ref=docRef(uid,reportId);
  await db.runTransaction(async tx=>{
    const doc=await tx.get(ref);
    if(!doc.exists||!authorizedDoc(doc.data(),uid,link.preinscripcionId,reportId))
      throw new PublicError(404,'REPORTE_NO_DISPONIBLE','Este informe no está publicado para el alumno.');
    tx.update(ref,{estado:'revocado',revocadoPor:caller.token.email,revocadoAt:FieldValue.serverTimestamp()});
  });
  return {revocado:true,reportId};
}
async function studentDownload(body,caller,res){
  if(!isStudent(caller.profile))
    throw new PublicError(403,'CUENTA_INACTIVA','Tu cuenta no está activa.');
  const id=body.reportId;
  if(!validReportId(id))
    throw new PublicError(400,'ID_INVALIDO','Selecciona un informe válido.');
  const link=await verifiedLink(caller.uid);
  const report=await docRef(caller.uid,id).get();
  if(!report.exists||!authorizedDoc(report.data(),caller.uid,link.preinscripcionId,id))
    throw new PublicError(404,'REPORTE_NO_DISPONIBLE','No se encontró un informe publicado para tu cuenta.');
  const [exists]=await storage.file(privatePath(caller.uid,id)).exists();
  if(!exists)throw new PublicError(404,'ARCHIVO_NO_DISPONIBLE','El informe no está disponible para descarga.');
  const [buffer]=await storage.file(privatePath(caller.uid,id)).download();
  if(buffer.length>MAX_PDF||digest(buffer)!==report.data().sha256)
    throw new PublicError(409,'INTEGRIDAD_NO_VALIDA','No se pudo verificar la integridad del informe.');
  res.set({
    'Content-Type':'application/pdf',
    'Content-Disposition':'attachment; filename="NostraREPORTES-'+id+'.pdf"',
    'Cache-Control':'private, no-store, max-age=0',
    'X-Content-Type-Options':'nosniff',
    'Content-Security-Policy':'sandbox'
  });
  res.status(200).send(buffer);
}

exports.nostrareportesApi=onRequest(OPTIONS,async(req,res)=>{
  try{
    requirePost(req);
    const caller=await identity(req),body=bodyOf(req);
    const action=clean(body.action);
    if(action==='admin_report_publish')return send(res,200,{data:await adminPublish(body,caller)});
    if(action==='admin_batch_preview')return send(res,200,{data:await adminBatch(body,caller,false)});
    if(action==='admin_batch_publish')return send(res,200,{data:await adminBatch(body,caller,true)});
    if(action==='admin_report_list')return send(res,200,{data:await adminList(body,caller)});
    if(action==='admin_report_revoke')return send(res,200,{data:await adminRevoke(body,caller)});
    if(action==='student_report_download')return await studentDownload(body,caller,res);
    throw new PublicError(400,'ACCION_INVALIDA','Operación no permitida.');
  }catch(error){
    if(error instanceof PublicError)return send(res,error.status,{error:error.code,message:error.message});
    console.error('NostraREPORTES API',error);
    return send(res,500,{error:'ERROR_INTERNO',message:'No se pudo completar la operación con NostraREPORTES.'});
  }
});
