/* NostraPORTAL — vinculación administrativa de cuentas y matrículas.
   Nunca modifica alumnos, cuotas ni ingresos. */
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getFirestore,collection,getDocs,limit,query,orderBy} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig={
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);
const API='https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraportalApi';
const ADMIN_EMAIL='fernandodaniel8888@gmail.com';
const $=id=>document.getElementById(id);
let user=null, accounts=[],enrollments=[],busy=false;
function message(text,isError=false){
  const target=$('msg');target.textContent=text;target.className='alert '+(isError?'error':'ok');
}
function options(select,data,map){
  select.replaceChildren(new Option('Selecciona una ficha...',''));
  data.forEach(item=>{
    const v=map(item);
    select.add(new Option(v,item.id));
  });
}
function clean(value){return String(value??'').replace(/\s+/g,' ').trim();}
function labelAccount(a){return [a.name||a.username,a.institutionalEmail||'',a.status].filter(Boolean).join(' · ').slice(0,160)}
function labelEnrollment(a){return [a.nombre,a.dni,a.ciclo||a.programaNombre].filter(Boolean).join(' · ').slice(0,160)}
function fillDetails(){
  const uid=$('uid').value.trim(),pre=$('preid').value.trim();
  const u=accounts.find(x=>x.id===uid),r=enrollments.find(x=>x.id===pre);
  $('account-preview').textContent=u?'Cuenta: '+labelAccount(u):'Cuenta no encontrada en la lista reciente. Revisa manualmente el UID.';
  $('student-preview').textContent=r?'Matrícula: '+labelEnrollment(r)+' · '+(r.matriculaAprobada===true||r.estado==='matriculado'?'Oficial':'Sin aprobación'):'La matrícula debe ser oficial y estar verificada en NostraADMIN.';
}
async function refresh(){
  if(!user)return;
  message('Leyendo cuentas y preinscripciones autorizadas...');
  try{
    const [users,pre]=await Promise.all([
      getDocs(query(collection(db,'users'),limit(500))),
      getDocs(query(collection(db,'preinscripciones'),limit(500)))
    ]);
    accounts=users.docs.map(x=>({id:x.id,...x.data()})).filter(x=>x.role==='student').sort((a,b)=>labelAccount(a).localeCompare(labelAccount(b),'es'));
    enrollments=pre.docs.map(x=>({id:x.id,...x.data()})).filter(x=>x.matriculaAprobada===true||x.estado==='matriculado').sort((a,b)=>labelEnrollment(a).localeCompare(labelEnrollment(b),'es'));
    options($('account-select'),accounts,labelAccount);options($('enrollment-select'),enrollments,labelEnrollment);
    const requestedUid=new URLSearchParams(location.search).get('uid') || '';
    if(/^[A-Za-z0-9_-]{12,150}$/.test(requestedUid)){
      const account=accounts.find(x=>x.id===requestedUid);
      if(account){
        $('account-select').value=requestedUid;
        $('uid').value=requestedUid;
        $('confirmed-email').value=clean(account.institutionalEmail).toLowerCase();
      }
    }
    fillDetails();
    message('Listas actualizadas. Confirma la matrícula y el DNI antes de vincular. El acceso al portal ya está activo.');
  }catch(e){message('No se pudieron cargar las listas administrativas. Comprueba los permisos de Firebase.',true)}
}
function authState(value){
  user=value&&clean(value.email).toLowerCase()===ADMIN_EMAIL?value:null;
  $('auth-card').hidden=!!user;
  $('admin-card').hidden=!user;
  if(user)refresh();
  else{accounts=[];enrollments=[]}
}
$('login').addEventListener('click',async()=>{
  try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){message('No se pudo iniciar sesión administrativa.',true)}
});
$('logout').addEventListener('click',()=>signOut(auth));
$('refresh').addEventListener('click',refresh);
for(const [select,input]of [['account-select','uid'],['enrollment-select','preid']]){
  $(select).addEventListener('change',()=>{$(input).value=$(select).value;fillDetails()});
  $(input).addEventListener('input',fillDetails);
}
$('link-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(!user||busy)return;
  if(!$('accept').checked)return message('Verifica las dos identidades y confirma antes de guardar.',true);
  const uid=clean($('uid').value),preinscripcionId=clean($('preid').value);
  const confirmedDni=clean($('confirmed-dni').value);
  const confirmedEmail=clean($('confirmed-email').value).toLowerCase();
  const a=accounts.find(x=>x.id===uid),e=enrollments.find(x=>x.id===preinscripcionId);
  if(a && (a.institutionalEmail||'').toLowerCase()!==confirmedEmail)return message('El correo escrito no coincide con la cuenta seleccionada.',true);
  if(e && clean(e.dni)!==confirmedDni)return message('El DNI escrito no coincide con la ficha seleccionada.',true);
  if(!window.confirm('¿Confirmas que la cuenta '+(a?.name||uid)+' pertenece a la matrícula '+(e?.nombre||preinscripcionId)+'? Esta operación no cambia pagos ni notas.'))return;
  busy=true;$('save').disabled=true;message('Vinculando identidad en Firebase...');
  try{
    const token=await user.getIdToken();
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'admin_link',uid,preinscripcionId,confirmedDni,confirmedEmail})});
    const payload=await response.json();
    if(!response.ok||!payload.ok)throw new Error(payload.message||'No se pudo vincular.');
    message('Vinculación guardada. La alumna podrá consultar únicamente sus propios datos.');
    $('accept').checked=false;
  }catch(e){message(e.message||'No se pudo completar la operación.',true)}
  finally{busy=false;$('save').disabled=false}
});
onAuthStateChanged(auth,authState);
