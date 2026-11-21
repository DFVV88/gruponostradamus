'use strict';

/* NostraPORTAL phase 2: servidor dedicado, sin acceso del cliente a colecciones
   administrativas. No modifica registros originales, pagos, cuotas o asistencias. */
const {onRequest}=require('firebase-functions/v2/https');
const {getApps,initializeApp,getApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {PublicError,bodyOf,requirePost,send,clean}=require('./lib/common');
const {
  DNI,RECORD,UID,isStudent,isEnrolled,isValidLinkRequest,canLink,
  safeEnrollment,safeAttendance,safeQuota,safePublishedReport
}=require('./lib/nostraportal-policy');

const app=getApps().length?getApp():initializeApp();
const auth=getAuth(app),db=getFirestore(app);
const ADMIN_EMAIL='fernandodaniel8888@gmail.com';
const OPTIONS={
  region:'us-central1',
  cors:['https://gruponostradamus.edu.pe','https://www.gruponostradamus.edu.pe','https://dfvv88.github.io','http://localhost:5500','http://127.0.0.1:5500'],
  timeoutSeconds:45,memory:'256MiB',maxInstances:3,minInstances:0
};
function fail(res,error,context){
  if(error instanceof PublicError)return send(res,error.status,{error:error.code,message:error.message});
  console.error(context,error);
  return send(res,500,{error:'ERROR_INTERNO',message:'No se pudo consultar el portal.'});
}
async function identity(req){
  const header=clean(req.headers.authorization);
  const match=/^Bearer\s+(\S+)$/i.exec(header);
  if(!match)throw new PublicError(401,'INICIA_SESION','Debes iniciar sesión en NostraCUENTA.');
  let token;
  try{token=await auth.verifyIdToken(match[1],true)}
  catch(_){throw new PublicError(401,'SESION_INVALIDA','Inicia sesión nuevamente.')}
  const profileSnap=await db.collection('users').doc(token.uid).get();
  const profile=profileSnap.exists?profileSnap.data():null;
  return {uid:token.uid,token,profile};
}
async function adminLink(body,caller){
  if(!caller.token.email_verified||String(caller.token.email||'').toLowerCase()!==ADMIN_EMAIL)
    throw new PublicError(403,'NO_AUTORIZADO','Se requiere sesión administrativa.');
  if(!isValidLinkRequest(body))
    throw new PublicError(400,'DATOS_INVALIDOS','Verifica los identificadores, el DNI y el correo institucional.');
  const uid=body.uid.trim(),id=body.preinscripcionId.trim();
  const userRef=db.collection('users').doc(uid);
  const recordRef=db.collection('preinscripciones').doc(id);
  const directRef=db.collection('nostraportal_vinculos').doc(uid);
  const inverseRef=db.collection('nostraportal_vinculos_inversos').doc(id);
  await db.runTransaction(async tx=>{
    const [user,record,linked,inverse]=await Promise.all([
      tx.get(userRef),tx.get(recordRef),tx.get(directRef),tx.get(inverseRef)]);
    if(!user.exists||!record.exists)
      throw new PublicError(404,'FICHA_NO_ENCONTRADA','No existe esa cuenta o ficha de matrícula.');
    if(!canLink(user.data(),record.data(),body.confirmedDni,body.confirmedEmail))
      throw new PublicError(409,'IDENTIDAD_NO_CONFIRMADA','Revisa el DNI y el correo institucional. Sólo se vinculan alumnos con matrícula oficial.');
    if(linked.exists&&linked.data().preinscripcionId!==id)
      throw new PublicError(409,'CUENTA_YA_VINCULADA','Esta cuenta ya está asociada con otra matrícula.');
    if(inverse.exists&&inverse.data().uid!==uid)
      throw new PublicError(409,'MATRICULA_YA_VINCULADA','Esta matrícula ya pertenece a otra cuenta.');
    if(linked.exists&&inverse.exists)return;
    const stamp=FieldValue.serverTimestamp();
    if(!linked.exists)tx.create(directRef,{uid,preinscripcionId:id,creadoPor:caller.token.email,createdAt:stamp});
    if(!inverse.exists)tx.create(inverseRef,{uid,preinscripcionId:id,creadoPor:caller.token.email,createdAt:stamp});
  });
  return {vinculado:true,uid,preinscripcionId:id};
}
async function ownLink(caller){
  if(!isStudent(caller.profile))throw new PublicError(403,'CUENTA_INACTIVA','Tu NostraCUENTA de alumno no está activa.');
  const link=await db.collection('nostraportal_vinculos').doc(caller.uid).get();
  if(!link.exists)return null;
  const preId=link.data().preinscripcionId;
  if(!RECORD.test(String(preId||'')))throw new PublicError(409,'VINCULO_INVALIDO','Solicita la revisión de tu matrícula.');
  const [inverse,record]=await Promise.all([
    db.collection('nostraportal_vinculos_inversos').doc(preId).get(),
    db.collection('preinscripciones').doc(preId).get()
  ]);
  if(!inverse.exists||inverse.data().uid!==caller.uid||!record.exists||!isEnrolled(record.data()))
    throw new PublicError(409,'VINCULO_INVALIDO','Coordinación debe revisar la vinculación de tu matrícula.');
  return {id:preId,record:record.data()};
}
async function studentState(caller){
  const linked=await ownLink(caller);
  if(!linked)return {vinculado:false,matricula:null,asistencias:[],cuotas:[],reportes:[]};
  const dni=String(linked.record.dni||'');
  if(!DNI.test(dni))throw new PublicError(409,'DNI_PENDIENTE','Coordinación debe confirmar el documento de identidad.');
  const [attendance,quotas,reports]=await Promise.all([
    db.collection('asistencia_registros').where('dni','==',dni).limit(300).get(),
    db.collection('alumno_cuotas').where('preinscripcionId','==',linked.id).limit(150).get(),
    db.collection('reportes_alumnos').doc(caller.uid).collection('documentos').limit(150).get()
  ]);
  const attendRows=attendance.docs.map(x=>safeAttendance(x.data()))
    .filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.fecha))
    .sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,120);
  const dues=quotas.docs.map(x=>safeQuota(x.data()))
    .sort((a,b)=>a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  const docs=reports.docs.map(x=>safePublishedReport(x.data(),x.id))
    .filter(Boolean).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return {vinculado:true,matricula:safeEnrollment(linked.record),asistencias:attendRows,cuotas:dues,reportes:docs};
}
exports.nostraportalApi=onRequest(OPTIONS,async(req,res)=>{
  try{
    requirePost(req);
    const caller=await identity(req),body=bodyOf(req);
    const action=clean(body.action);
    if(action==='admin_link')return send(res,200,{data:await adminLink(body,caller)});
    if(action==='student_state')return send(res,200,{data:await studentState(caller)});
    throw new PublicError(400,'ACCION_INVALIDA','Operación no permitida.');
  }catch(error){return fail(res,error,'NostraPORTAL API')}
});
