/* NostraPUBLICADOR 1.0 — publicación por lote + subida manual de excepción.
   Sólo usa Firebase Admin vía Functions y Storage staging controlado.
   Los PDF publicados nunca son públicos por URL. */
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getStorage,ref,uploadBytes,deleteObject} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

const cfg={
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};
const app=getApps().length?getApp():initializeApp(cfg),auth=getAuth(app),storage=getStorage(app);
const API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostrareportesApi';
const ADMIN='fernandodaniel8888@gmail.com';
const $=id=>document.getElementById(id);
let user=null,bundle=null,batchPreview=null,recipients=[],manualCheck=null,busy=false;

function status(text,error=false){
  const target=$('status');
  target.textContent=text;
  target.className='np-alert'+(error?' np-alert--error':'');
}
function row(text){const p=document.createElement('p');p.textContent=text;return p}
function selectedRecipient(){return recipients.find(r=>r.uid===$('recipient').value)||null}
function getManualMeta(){
  const r=selectedRecipient();
  if(!r)return null;
  const file=$('manual-pdf').files?.[0];
  return {uid:r.uid,preinscripcionId:r.preinscripcionId,
    titulo:$('manual-title').value.trim(),evaluacion:$('manual-exam').value.trim(),
    fecha:$('manual-date').value,fuente:'NostraREPORTES',
    qaRevisado:$('manual-qa').checked,reportId:manualCheck?.reportId||crypto.randomUUID(),file};
}
function invalidateManual(){
  manualCheck=null;
  $('manual-preview').replaceChildren(row('Selecciona una cuenta y un PDF. Comprueba la identidad antes de publicar.'));
  updateButtons();
}
function updateButtons(){
  $('batch-preview').disabled=!user||!bundle||busy;
  $('batch-publish').disabled=!user||!batchPreview?.resultados?.some(x=>x.estado==='VALIDADO_SIN_PUBLICAR')||busy;
  $('manual-check').disabled=!user||busy;
  $('manual-publish').disabled=!user||!manualCheck?.allowed||busy;
  $('refresh-recipients').disabled=!user||busy;
}
async function api(action,payload={}){
  if(!user)throw Error('Acceso administrativo no disponible.');
  const token=await user.getIdToken();
  const response=await fetch(API,{method:'POST',headers:{
    'Content-Type':'application/json','Authorization':'Bearer '+token
  },body:JSON.stringify({action,...payload})});
  const result=await response.json();
  if(!response.ok||!result.ok)throw Error(result.message||'La operación no pudo completarse.');
  return result.data;
}
async function refreshRecipients(){
  if(!user)return;
  busy=true;updateButtons();
  try{
    const [a,b]=await Promise.all([api('admin_recipients'),api('admin_pilot_status')]);
    recipients=Array.isArray(a?.alumnos)?a.alumnos:[];
    const old=$('recipient').value;
    const select=$('recipient');
    select.replaceChildren(new Option('Selecciona una NostraCUENTA vinculada...',''));
    recipients.forEach(r=>select.add(new Option(r.nombre+' · DNI ••••'+r.dniFinal+' · '+r.ciclo,r.uid)));
    if(recipients.some(r=>r.uid===old))select.value=old;
    $('pilot-status').textContent=b.pilotoHabilitado
      ?'Piloto restringido activo: '+b.cuentasPermitidas+' cuenta(s) autorizada(s).'
      :'Piloto cerrado: no se publicarán informes hasta habilitar una cuenta de prueba.';
    status('Destinatarios académicos vinculados consultados: '+recipients.length+'.');
    invalidateManual();
  }catch(error){status(error.message,true)}
  finally{busy=false;updateButtons()}
}
async function readPdf(file){
  if(!file||file.size<100||file.size>8*1024*1024||!file.name.toLowerCase().endsWith('.pdf'))
    throw Error('Selecciona un PDF válido de hasta 8 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const head=new TextDecoder('latin1').decode(bytes.slice(0,8));
  const tail=new TextDecoder('latin1').decode(bytes.slice(-1024));
  if(!head.startsWith('%PDF-')||!tail.includes('%%EOF'))throw Error('No se reconoce una estructura PDF mínima válida.');
  return bytes;
}
function renderBatchResults(data){
  const target=$('batch-results');target.replaceChildren();
  (data?.resultados||[]).forEach(v=>{
    const tr=document.createElement('tr');
    [v.ficha_id,v.estado,v.detalle||v.reportId||'—'].forEach(value=>{
      const td=document.createElement('td');td.textContent=value;tr.append(td);
    });
    target.append(tr);
  });
  $('batch-summary').textContent=data?
    'Fichas: '+data.total+' · Publicadas: '+data.publicados+
    ' · Verificadas sin publicar: '+data.validados+' · Pendientes: '+data.pendientes:'';
}
async function runBatch(publish){
  if(!user||!bundle||busy)return;
  if(publish&&(!batchPreview||!window.confirm(
    '¿Has revisado los destinatarios y el manifiesto NostraQA? Esta operación SOLO puede publicar en cuentas piloto autorizadas.')))return;
  busy=true;updateButtons();
  try{
    const data=await api(publish?'admin_batch_publish':'admin_batch_preview',
      {bundle,qaRevisado:true,confirmarPublicacion:publish});
    renderBatchResults(data);
    batchPreview=publish?null:data;
    status(publish?'Publicación piloto procesada.':'Validación terminada sin publicar.');
  }catch(error){status(error.message,true)}
  finally{busy=false;updateButtons()}
}

$('batch-file').addEventListener('change',async()=>{
  bundle=null;batchPreview=null;renderBatchResults(null);updateButtons();
  const file=$('batch-file').files?.[0];
  if(!file)return;
  if(file.size>16*1024*1024){status('El paquete JSON excede 16 MB.',true);return}
  try{
    const obj=JSON.parse(await file.text());
    if(obj?.schema_version!=='NOSTRA_PUBLICACION_MANIFEST_V1'
      ||obj?.qa_status!=='PASS'||!Array.isArray(obj.rows)
      ||obj.rows.length<1||obj.rows.length>8)
      throw Error('Se necesita un manifiesto NostraPUBLICADOR con NostraQA PASS y hasta ocho PDF por paquete.');
    bundle=obj;
    status('Manifiesto cargado: '+obj.rows.length+' fichas. Valida antes de publicar.');
  }catch(e){status(e.message,true)}
  updateButtons();
});
$('batch-preview').addEventListener('click',()=>runBatch(false));
$('batch-publish').addEventListener('click',()=>runBatch(true));

for(const id of ['recipient','manual-pdf','manual-title','manual-exam','manual-date','manual-qa']){
  const element=$(id);
  element.addEventListener(id==='recipient'||id==='manual-pdf'?'change':'input',invalidateManual);
  if(id==='manual-qa')element.addEventListener('change',invalidateManual);
}
$('manual-check').addEventListener('click',async()=>{
  if(busy||!user)return;
  const meta=getManualMeta();
  if(!meta||!meta.file)return status('Selecciona una cuenta vinculada y un PDF.',true);
  if(meta.titulo.length<5||meta.evaluacion.length<3||!meta.fecha||!meta.qaRevisado)
    return status('Completa título, evaluación y fecha y confirma la revisión NostraQA.',true);
  busy=true;updateButtons();
  try{
    await readPdf(meta.file);
    const data=await api('admin_manual_preview',{
      uid:meta.uid,preinscripcionId:meta.preinscripcionId,
      reportId:meta.reportId,titulo:meta.titulo,
      evaluacion:meta.evaluacion,fecha:meta.fecha,fuente:meta.fuente,qaRevisado:true
    });
    manualCheck={...meta,allowed:data.listoParaPublicacion};
    const target=$('manual-preview');target.replaceChildren();
    target.append(row('Alumno: '+data.nombre+' · DNI ••••'+data.dniFinal));
    target.append(row('Programa: '+data.ciclo));
    target.append(row('PDF: '+meta.file.name+' · '+(meta.file.size/1024).toFixed(0)+' KB'));
    target.append(row(data.listoParaPublicacion
      ?'Destinatario verificado y cuenta piloto autorizada. Puedes publicar después de la confirmación final.'
      :'Publicación bloqueada: '+data.motivo));
    status(data.listoParaPublicacion?'Documento preparado para publicación piloto.':'Validación sin publicación: cuenta no autorizada como piloto.',!data.listoParaPublicacion);
  }catch(e){manualCheck=null;status(e.message,true)}
  finally{busy=false;updateButtons()}
});
$('manual-publish').addEventListener('click',async()=>{
  const meta=manualCheck;
  if(!meta?.allowed||busy||!user)return;
  if(!window.confirm('PUBLICACIÓN MANUAL: ¿Confirmas que el PDF corresponde a '+
    selectedRecipient()?.nombre+' y que superó NostraQA? No se podrá sobrescribir.'))return;
  busy=true;updateButtons();
  let stageRef=null,uploaded=false;
  try{
    await readPdf(meta.file);
    const path='nostrareportes-staging/'+meta.uid+'/'+meta.reportId+'.pdf';
    stageRef=ref(storage,path);
    status('Subiendo informe privado al área temporal de NostraPUBLICADOR...');
    await uploadBytes(stageRef,meta.file,{
      contentType:'application/pdf',
      customMetadata:{uid:meta.uid,reportId:meta.reportId,subidoPor:user.email}
    });
    uploaded=true;
    status('Validando y publicando el informe en la cuenta piloto...');
    await api('admin_report_publish',{
      uid:meta.uid,preinscripcionId:meta.preinscripcionId,reportId:meta.reportId,
      titulo:meta.titulo,evaluacion:meta.evaluacion,fecha:meta.fecha,
      fuente:'NostraREPORTES',qaRevisado:true
    });
    status('PDF publicado en la cuenta piloto de '+selectedRecipient()?.nombre+'.');
    $('manual-pdf').value='';
    manualCheck=null;
    $('manual-preview').replaceChildren(row('Publicación guardada. Consulta el historial del alumno para verificar.'));
  }catch(e){
    status('No se completó la publicación: '+e.message,true);
    if(uploaded&&stageRef)deleteObject(stageRef).catch(()=>{});
  }finally{busy=false;updateButtons()}
});
$('manual-history').addEventListener('click',async()=>{
  const recipient=selectedRecipient();
  if(!recipient||busy)return status('Selecciona primero un alumno.',true);
  busy=true;updateButtons();
  try{
    const data=await api('admin_report_list',{uid:recipient.uid});
    const target=$('manual-history-list');target.replaceChildren();
    if(!data.reportes?.length)target.append(row('Todavía no hay informes registrados.'));
    else data.reportes.forEach(item=>{
      const line=document.createElement('div');line.className='np-history-row';
      const label=row(item.fecha+' · '+item.titulo+' · '+item.estado);
      line.append(label);
      if(item.estado==='publicado'){
        const btn=document.createElement('button');btn.type='button';btn.className='np-btn-secondary';btn.textContent='Revocar';
        btn.addEventListener('click',async()=>{
          if(!window.confirm('¿Revocar este informe? El alumno dejará de poder descargarlo.'))return;
          btn.disabled=true;
          try{
            await api('admin_report_revoke',{uid:recipient.uid,reportId:item.id});
            status('Informe revocado. No será accesible desde NostraPORTAL.');
            $('manual-history').click();
          }catch(e){status(e.message,true);btn.disabled=false}
        });
        line.append(btn);
      }
      target.append(line);
    });
  }catch(e){status(e.message,true)}
  finally{busy=false;updateButtons()}
});
$('refresh-recipients').addEventListener('click',refreshRecipients);
$('login').addEventListener('click',async()=>{
  try{await signInWithPopup(auth,new GoogleAuthProvider())}
  catch(_){status('No se pudo iniciar sesión con la cuenta administrativa.',true)}
});
$('logout').addEventListener('click',()=>signOut(auth));
onAuthStateChanged(auth,value=>{
  user=value?.email?.toLowerCase()===ADMIN?value:null;
  $('login-panel').hidden=Boolean(user);
  $('content-panel').hidden=!user;
  if(user)refreshRecipients();
  else{bundle=null;batchPreview=null;recipients=[];manualCheck=null;renderBatchResults(null)}
  updateButtons();
});
