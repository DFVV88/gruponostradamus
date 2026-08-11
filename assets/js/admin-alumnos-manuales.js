/* ==================================================
   Grupo Nostradamus - Registro manual de alumnos
   Crea una sola ficha operativa por DNI y la deja lista para cronograma/pagos.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  writeBatch,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const PRE_COLLECTION = 'preinscripciones';
const DNI_REGISTRY_COLLECTION = 'alumnos_registro_dni';
const PROGRAMS = [
  ['nostra-360-uni','Nostra 360 UNI'],
  ['nostra-power-uni','Nostra Power UNI'],
  ['nostra-elite-uni','Nostra Élite UNI'],
  ['nostra-prime-uni','Nostra Prime UNI'],
  ['nostra-talentum-uni','Nostra Talentum UNI'],
  ['ciclo-ien','IEN UNI'],
  ['proyecto-escolar','Proyecto Escolar'],
  ['paralelo-cepre-uni','Paralelo CEPRE UNI'],
  ['ciclo-verano-uni','Ciclo Verano UNI']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let busy = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
}[char]));
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
};
const dniDigits = value => clean(value).replace(/\D/g,'').slice(0,12);

async function sha256(value){
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('');
}

function message(type,text){
  const box = document.getElementById('manual-student-message');
  if(!box) return;
  box.className = `msg ${type}`;
  box.innerHTML = text;
}

function ensurePaymentOptions(){
  const edit = document.getElementById('edit-estado-pago');
  if(edit && !edit.querySelector('option[value="sin_pago_registrado"]')){
    const option = document.createElement('option');
    option.value = 'sin_pago_registrado';
    option.textContent = 'Sin pago registrado';
    edit.prepend(option);
  }
  const filter = document.getElementById('pago-filter');
  if(filter && !filter.querySelector('option[value="sin_pago_registrado"]')){
    const option = document.createElement('option');
    option.value = 'sin_pago_registrado';
    option.textContent = 'Sin pago registrado';
    filter.appendChild(option);
  }
}

function decorateManualRows(){
  document.querySelectorAll('#rows tr').forEach(row => {
    row.querySelectorAll('.badge').forEach(badge => {
      if(clean(badge.textContent) === 'sin_pago_registrado'){
        badge.textContent = 'Sin pago registrado';
        badge.classList.add('orange');
      }
    });
    const paymentCell = row.cells?.[3];
    if(paymentCell && clean(paymentCell.textContent).includes('Registro manual administrativo') && !paymentCell.querySelector('.manual-origin-tag')){
      const tag = document.createElement('small');
      tag.className = 'manual-origin-tag';
      tag.textContent = ' · Alumno ingresado por administración';
      tag.style.cssText = 'display:block;margin-top:4px;color:#075b65;font-weight:850';
      paymentCell.appendChild(tag);
    }
  });
}

function injectStyles(){
  if(document.getElementById('manual-student-styles')) return;
  const style = document.createElement('style');
  style.id = 'manual-student-styles';
  style.textContent = `
    .manual-student-back{position:fixed;inset:0;z-index:11000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,7,13,.72)}
    .manual-student-back.show{display:flex}.manual-student-modal{width:min(900px,97vw);max-height:94vh;overflow:auto;background:#fff;border-radius:26px;padding:24px;box-shadow:0 30px 90px rgba(2,7,13,.38)}
    .manual-student-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.manual-student-head h2{font-family:'Baloo 2';font-size:36px;line-height:1;color:#061426;margin:0}.manual-student-head p{margin:6px 0 0;color:#647482;font-size:13px;line-height:1.45}
    .manual-student-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:16px}.manual-student-grid .wide{grid-column:1/-1}.manual-student-grid label span{display:block;margin-bottom:5px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase}.manual-student-grid input,.manual-student-grid select,.manual-student-grid textarea{width:100%;border:1px solid #dce9ed;border-radius:13px;padding:11px 12px;background:#fbfdfe;font:inherit}.manual-student-grid textarea{min-height:76px;resize:vertical}
    .manual-student-note{margin-top:13px;padding:12px 13px;border:1px solid rgba(7,140,149,.18);border-radius:15px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:800;line-height:1.5}.manual-student-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.manual-student-actions .btn{min-width:190px}
    @media(max-width:720px){.manual-student-head{display:block}.manual-student-grid{grid-template-columns:1fr}.manual-student-grid .wide{grid-column:auto}.manual-student-actions{display:grid;grid-template-columns:1fr}.manual-student-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
}

function ensureUi(){
  if(ready) return true;
  const toolbar = document.querySelector('#admin-panel > .panel .toolbar');
  if(!toolbar) return false;
  injectStyles();
  ensurePaymentOptions();

  if(!document.getElementById('manual-student-open')){
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'manual-student-open';
    button.className = 'btn btn-green';
    button.textContent = '+ Alumno manual';
    toolbar.appendChild(button);
  }

  if(!document.getElementById('manual-student-back')){
    const back = document.createElement('div');
    back.id = 'manual-student-back';
    back.className = 'manual-student-back';
    back.innerHTML = `
      <section class="manual-student-modal" role="dialog" aria-modal="true" aria-labelledby="manual-student-title">
        <div class="manual-student-head">
          <div><h2 id="manual-student-title">Registrar alumno manualmente</h2><p>Crea la ficha única del alumno para empezar su control académico y económico. Si después completa el formulario web, sus datos se vincularán a esta misma ficha.</p></div>
          <button type="button" class="btn btn-light" id="manual-student-close">Cerrar</button>
        </div>
        <form id="manual-student-form">
          <div class="manual-student-grid">
            <label><span>Nombres y apellidos *</span><input id="manual-student-name" minlength="5" maxlength="100" required></label>
            <label><span>DNI *</span><input id="manual-student-dni" inputmode="numeric" minlength="8" maxlength="12" required></label>
            <label><span>Celular del alumno *</span><input id="manual-student-phone" inputmode="tel" minlength="9" maxlength="20" required></label>
            <label><span>Correo personal</span><input id="manual-student-email" type="email" maxlength="100" placeholder="Puede completarlo después"></label>
            <label><span>Programa *</span><select id="manual-student-program" required>${PROGRAMS.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Turno</span><select id="manual-student-turn"><option value="Por confirmar">Por confirmar</option><option>Mañana</option><option>Tarde</option><option>Noche</option><option>FULL</option></select></label>
            <label><span>Plan asignado</span><input id="manual-student-plan" maxlength="100" placeholder="Ej. Presencial FULL"></label>
            <label><span>Salón / grupo</span><input id="manual-student-group" maxlength="100" placeholder="Ej. POWER-A"></label>
            <label><span>Pensión mensual acordada (S/)</span><input id="manual-student-price" type="number" min="0" max="1000000" step="0.01" placeholder="0.00"></label>
            <label><span>Asesor / responsable</span><input id="manual-student-advisor" maxlength="100" placeholder="Opcional"></label>
            <label class="wide"><span>Condición económica / observación</span><textarea id="manual-student-note" maxlength="1000" placeholder="Ej. precio acordado, beca parcial, alumno antiguo o pendiente de completar formulario"></textarea></label>
          </div>
          <div class="manual-student-note">Crear la ficha no registra dinero automáticamente. Para que un cobro aparezca en Finanzas, abre después la ficha del alumno, agrega su cronograma y registra el pago realmente recibido.</div>
          <div class="manual-student-actions"><button type="button" class="btn btn-light" id="manual-student-cancel">Cancelar</button><button type="submit" class="btn btn-green" id="manual-student-save">Registrar alumno</button></div>
          <div class="msg" id="manual-student-message"></div>
        </form>
      </section>`;
    document.body.appendChild(back);
  }

  bindEvents();
  const observer = new MutationObserver(() => {
    ensurePaymentOptions();
    decorateManualRows();
  });
  observer.observe(document.getElementById('admin-panel'),{childList:true,subtree:true,characterData:true});
  ready = true;
  return true;
}

function openModal(){
  if(!currentUser || busy) return;
  const form = document.getElementById('manual-student-form');
  form?.reset();
  if(document.getElementById('manual-student-program')) document.getElementById('manual-student-program').value = PROGRAMS[0][0];
  if(document.getElementById('manual-student-turn')) document.getElementById('manual-student-turn').value = 'Por confirmar';
  message('info','El DNI se comprobará antes de crear la ficha para evitar alumnos duplicados.');
  document.getElementById('manual-student-back')?.classList.add('show');
}

function closeModal(){
  if(busy) return;
  document.getElementById('manual-student-back')?.classList.remove('show');
}

function programName(id){
  return PROGRAMS.find(item => item[0] === id)?.[1] || id;
}

async function existingByDni(dni){
  const snapshot = await getDocs(query(collection(db,PRE_COLLECTION),where('dni','==',dni),limit(1)));
  return snapshot.empty ? null : {id:snapshot.docs[0].id,...snapshot.docs[0].data()};
}

async function saveStudent(event){
  event.preventDefault();
  if(busy || !currentUser) return;

  const nombre = clean(document.getElementById('manual-student-name')?.value);
  const dni = dniDigits(document.getElementById('manual-student-dni')?.value);
  const celular = clean(document.getElementById('manual-student-phone')?.value);
  const correo = clean(document.getElementById('manual-student-email')?.value).toLowerCase();
  const programaId = clean(document.getElementById('manual-student-program')?.value);
  const ciclo = programName(programaId);
  const turno = clean(document.getElementById('manual-student-turn')?.value) || 'Por confirmar';
  const plan = clean(document.getElementById('manual-student-plan')?.value);
  const grupoId = clean(document.getElementById('manual-student-group')?.value);
  const pension = num(document.getElementById('manual-student-price')?.value);
  const asesor = clean(document.getElementById('manual-student-advisor')?.value);
  const note = clean(document.getElementById('manual-student-note')?.value);

  if(nombre.length < 5 || nombre.length > 100) return message('err','Escribe los nombres y apellidos completos.');
  if(dni.length < 8 || dni.length > 12) return message('err','Escribe un DNI válido.');
  if(celular.length < 9 || celular.length > 20) return message('err','Escribe un celular válido. Este número permitirá vincular el formulario web posteriormente.');
  if(correo && (!correo.includes('@') || correo.length > 100)) return message('err','Revisa el correo personal.');
  if(!PROGRAMS.some(item => item[0] === programaId)) return message('err','Selecciona un programa válido.');
  if(note.length > 1000) return message('err','La observación es demasiado extensa.');

  const button = document.getElementById('manual-student-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Comprobando DNI...'; }
    message('info','Verificando que el alumno no exista en registros anteriores...');

    const existing = await existingByDni(dni);
    if(existing){
      message('err',`Ya existe una ficha con el DNI <b>${esc(dni)}</b> a nombre de <b>${esc(existing.nombre || 'alumno registrado')}</b>.<br><small>ID: ${esc(existing.id)}. No se creó ningún duplicado.</small>`);
      return;
    }

    const hash = await sha256(dni);
    const recordId = `manual_${hash.slice(0,24)}`;
    const emailAdmin = clean(currentUser.email || ADMIN_EMAIL);
    const recordRef = doc(db,PRE_COLLECTION,recordId);
    const registryRef = doc(db,DNI_REGISTRY_COLLECTION,hash);
    const batch = writeBatch(db);

    if(button) button.textContent = 'Registrando alumno...';
    message('info','Creando ficha administrativa única...');

    batch.set(recordRef,{
      nombre,
      dni,
      celular,
      correo,
      colegio:'',
      situacion:'',
      programaId,
      ciclo,
      planId:'registro-manual',
      planNombre:plan,
      planAsignado:plan,
      turno,
      grupoId,
      pensionAcordada:pension,
      apoderado:'',
      celularApoderado:'',
      comentario:note,
      confirmacion:'Registro administrativo realizado por personal autorizado.',
      metodoPagoPreferido:'registro_manual',
      metodoPagoLabel:'Registro manual administrativo',
      estadoPago:'sin_pago_registrado',
      pagoValidado:false,
      pagoObservacion:'Sin pago registrado al crear la ficha manual.',
      asesorAsignado:asesor,
      estado:'matriculado',
      origen:'registro_manual_admin',
      origenRegistro:'registro_manual_admin',
      tipo:'alumno_manual_admin',
      lineaAcademica:'Nostra UNI Premium',
      correoInstitucionalAsignado:false,
      matriculaAprobada:true,
      formularioWebCompletado:false,
      ajustePagoMotivo:note,
      registradoManualmentePor:emailAdmin,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    batch.set(registryRef,{
      dniHash:hash,
      registroId:recordId,
      tipo:'registro_manual_admin',
      activo:true,
      creadoPor:emailAdmin,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    await batch.commit();
    message('ok',`Alumno <b>${esc(nombre)}</b> registrado sin duplicar preinscripciones.<br><small>ID de ficha: ${esc(recordId)}. Ya puedes abrir su ficha y crear el cronograma de pagos.</small>`);
    document.getElementById('refresh-btn')?.click();
    window.setTimeout(closeModal,1200);
  }catch(error){
    console.error('No se pudo registrar el alumno manual.',error);
    message('err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite crear alumnos manuales. Deben publicarse las reglas nuevas.'
      : 'No se pudo registrar el alumno. No se guardó una ficha parcial.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Registrar alumno'; }
  }
}

function bindEvents(){
  document.getElementById('manual-student-open')?.addEventListener('click',openModal);
  document.getElementById('manual-student-close')?.addEventListener('click',closeModal);
  document.getElementById('manual-student-cancel')?.addEventListener('click',closeModal);
  document.getElementById('manual-student-back')?.addEventListener('click',event => {
    if(event.target.id === 'manual-student-back') closeModal();
  });
  document.getElementById('manual-student-form')?.addEventListener('submit',saveStudent);
  document.getElementById('manual-student-dni')?.addEventListener('input',event => {
    event.target.value = dniDigits(event.target.value);
  });
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(ensureUi() || attempts > 100) window.clearInterval(timer);
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) ensureUi();
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
