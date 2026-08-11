import './admin-alumnos-manuales-editor.js?v=2026-08-11-1';

/* ==================================================
   Grupo Nostradamus - Ubicación y contactos de alumnos manuales
   Mantiene el alta manual dentro de Preinscripciones, permite teléfonos opcionales
   y muestra por separado los contactos del alumno y del apoderado.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
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
let observer = null;
let queued = false;
let manualBusy = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
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

function programName(id){
  return PROGRAMS.find(item => item[0] === id)?.[1] || id;
}

function manualMessage(type,text){
  const box = document.getElementById('manual-student-message');
  if(!box) return;
  box.className = `msg ${type}`;
  box.innerHTML = text;
}

function injectStyles(){
  if(document.getElementById('manual-student-layout-styles')) return;
  const style = document.createElement('style');
  style.id = 'manual-student-layout-styles';
  style.textContent = `
    .manual-student-entrybar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 14px;padding:13px 14px;border:1px solid rgba(7,140,149,.17);border-radius:17px;background:linear-gradient(135deg,#f7fdfe,#eef8fa)}
    .manual-student-entrybar-copy strong{display:block;color:#061426;font-size:13px;font-weight:950}.manual-student-entrybar-copy small{display:block;margin-top:3px;color:#647482;font-size:10px;line-height:1.4}
    .manual-student-entrybar #manual-student-open{margin:0;min-width:230px;white-space:nowrap}
    .manual-contact-help{display:block;margin-top:4px;color:#71808c;font-size:9px;font-weight:700;text-transform:none}
    @media(max-width:720px){.manual-student-entrybar{display:block}.manual-student-entrybar #manual-student-open{width:100%;margin-top:10px;min-width:0}}
  `;
  document.head.appendChild(style);
}

function preinscriptionPanel(){
  const view = document.getElementById('admin-view-preinscripciones');
  if(view){
    return Array.from(view.children).find(node => node.classList && node.classList.contains('panel')) || view.querySelector('.panel');
  }
  return Array.from(document.querySelectorAll('#admin-panel > .panel')).find(panel =>
    panel.id !== 'nostra-accounts-panel' && panel.querySelector('#search-input,#rows')
  ) || null;
}

function ensureEntryBar(panel){
  if(!panel) return null;
  let bar = panel.querySelector(':scope > .manual-student-entrybar');
  if(bar) return bar;
  bar = document.createElement('div');
  bar.className = 'manual-student-entrybar';
  bar.innerHTML = '<div class="manual-student-entrybar-copy"><strong>Registro administrativo de alumnos</strong><small>Incorpora alumnos directamente para matrícula, cronograma y control financiero, sin crear una NostraCUENTA.</small></div>';
  const toolbar = panel.querySelector(':scope > .toolbar') || panel.querySelector('.toolbar');
  if(toolbar) toolbar.insertAdjacentElement('beforebegin',bar);
  else panel.insertAdjacentElement('afterbegin',bar);
  return bar;
}

function positionButton(){
  injectStyles();
  const button = document.getElementById('manual-student-open');
  const panel = preinscriptionPanel();
  if(!button || !panel) return false;
  const bar = ensureEntryBar(panel);
  if(!bar) return false;
  button.textContent = '+ Registrar alumno manualmente';
  button.setAttribute('aria-label','Registrar alumno manualmente');
  if(button.parentElement !== bar) bar.appendChild(button);
  return !(document.getElementById('nostra-accounts-panel')?.contains(button));
}

function ensureManualContactFields(){
  const form = document.getElementById('manual-student-form');
  if(!form) return false;

  const phone = document.getElementById('manual-student-phone');
  if(phone){
    phone.required = false;
    phone.removeAttribute('required');
    phone.removeAttribute('minlength');
    phone.placeholder = 'Opcional · puede completarlo después';
    const label = phone.closest('label');
    const title = label?.querySelector(':scope > span');
    if(title) title.innerHTML = 'Celular del alumno <small class="manual-contact-help">Opcional. El DNI identifica la ficha.</small>';
  }

  if(!document.getElementById('manual-student-guardian')){
    const emailLabel = document.getElementById('manual-student-email')?.closest('label');
    if(emailLabel){
      const guardian = document.createElement('label');
      guardian.innerHTML = '<span>Nombre del apoderado <small class="manual-contact-help">Opcional</small></span><input id="manual-student-guardian" maxlength="100" placeholder="Puede completarlo después">';
      emailLabel.insertAdjacentElement('beforebegin',guardian);
    }
  }

  if(!document.getElementById('manual-student-guardian-phone')){
    const emailLabel = document.getElementById('manual-student-email')?.closest('label');
    if(emailLabel){
      const guardianPhone = document.createElement('label');
      guardianPhone.innerHTML = '<span>Celular del apoderado <small class="manual-contact-help">Opcional</small></span><input id="manual-student-guardian-phone" inputmode="tel" maxlength="20" placeholder="Puede completarlo después">';
      emailLabel.insertAdjacentElement('beforebegin',guardianPhone);
    }
  }

  if(form.dataset.optionalContactHandler !== '1'){
    form.dataset.optionalContactHandler = '1';
    form.addEventListener('submit',saveManualStudentOptionalContacts,true);
  }
  return true;
}

async function existingByDni(dni){
  const snapshot = await getDocs(query(collection(db,PRE_COLLECTION),where('dni','==',dni),limit(1)));
  return snapshot.empty ? null : {id:snapshot.docs[0].id,...snapshot.docs[0].data()};
}

async function saveManualStudentOptionalContacts(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  if(manualBusy || !currentUser) return;

  const nombre = clean(document.getElementById('manual-student-name')?.value);
  const dni = dniDigits(document.getElementById('manual-student-dni')?.value);
  const celular = clean(document.getElementById('manual-student-phone')?.value);
  const apoderado = clean(document.getElementById('manual-student-guardian')?.value);
  const celularApoderado = clean(document.getElementById('manual-student-guardian-phone')?.value);
  const correo = clean(document.getElementById('manual-student-email')?.value).toLowerCase();
  const programaId = clean(document.getElementById('manual-student-program')?.value);
  const ciclo = programName(programaId);
  const turno = clean(document.getElementById('manual-student-turn')?.value) || 'Por confirmar';
  const plan = clean(document.getElementById('manual-student-plan')?.value);
  const grupoId = clean(document.getElementById('manual-student-group')?.value);
  const pension = num(document.getElementById('manual-student-price')?.value);
  const asesor = clean(document.getElementById('manual-student-advisor')?.value);
  const note = clean(document.getElementById('manual-student-note')?.value);

  if(nombre.length < 5 || nombre.length > 100) return manualMessage('err','Escribe los nombres y apellidos completos.');
  if(dni.length < 8 || dni.length > 12) return manualMessage('err','Escribe un DNI válido.');
  if(celular && (celular.length < 9 || celular.length > 20)) return manualMessage('err','El celular del alumno debe tener al menos 9 caracteres o dejarse vacío.');
  if(celularApoderado && (celularApoderado.length < 9 || celularApoderado.length > 20)) return manualMessage('err','El celular del apoderado debe tener al menos 9 caracteres o dejarse vacío.');
  if(apoderado.length > 100) return manualMessage('err','El nombre del apoderado es demasiado extenso.');
  if(correo && (!correo.includes('@') || correo.length > 100)) return manualMessage('err','Revisa el correo personal.');
  if(!PROGRAMS.some(item => item[0] === programaId)) return manualMessage('err','Selecciona un programa válido.');
  if(note.length > 1000) return manualMessage('err','La observación es demasiado extensa.');

  const button = document.getElementById('manual-student-save');
  try{
    manualBusy = true;
    if(button){ button.disabled = true; button.textContent = 'Comprobando DNI...'; }
    manualMessage('info','Verificando el DNI para evitar alumnos duplicados...');

    const existing = await existingByDni(dni);
    if(existing){
      manualMessage('err',`Ya existe una ficha con el DNI <b>${esc(dni)}</b> a nombre de <b>${esc(existing.nombre || 'alumno registrado')}</b>.<br><small>ID: ${esc(existing.id)}. No se creó ningún duplicado.</small>`);
      return;
    }

    const hash = await sha256(dni);
    const recordId = `manual_${hash.slice(0,24)}`;
    const emailAdmin = clean(currentUser.email || ADMIN_EMAIL);
    const batch = writeBatch(db);

    if(button) button.textContent = 'Registrando alumno...';
    manualMessage('info','Creando la ficha única del alumno...');

    batch.set(doc(db,PRE_COLLECTION,recordId),{
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
      apoderado,
      celularApoderado,
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

    batch.set(doc(db,DNI_REGISTRY_COLLECTION,hash),{
      dniHash:hash,
      registroId:recordId,
      tipo:'registro_manual_admin',
      activo:true,
      creadoPor:emailAdmin,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    await batch.commit();
    manualMessage('ok',`Alumno <b>${esc(nombre)}</b> registrado correctamente.<br><small>El DNI quedó como identificador principal. Los teléfonos pueden completarse después.</small>`);
    document.getElementById('refresh-btn')?.click();
    window.setTimeout(() => document.getElementById('manual-student-back')?.classList.remove('show'),1200);
  }catch(error){
    console.error('No se pudo registrar el alumno manual.',error);
    manualMessage('err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite este registro. Deben publicarse las reglas actualizadas.'
      : 'No se pudo registrar el alumno. No se guardó una ficha parcial.');
  }finally{
    manualBusy = false;
    if(button){ button.disabled = false; button.textContent = 'Registrar alumno'; }
  }
}

function createDetail(label,value,key){
  const item = document.createElement('div');
  item.className = 'detail';
  if(key) item.dataset.contactDetail = key;
  const title = document.createElement('b');
  title.textContent = label;
  const text = document.createElement('span');
  text.textContent = clean(value) || '-';
  item.append(title,text);
  return item;
}

async function enrichStudentFicha(id){
  if(!id || !currentUser) return;
  try{
    const snapshot = await getDoc(doc(db,PRE_COLLECTION,id));
    if(!snapshot.exists()) return;
    const data = snapshot.data() || {};
    const grid = document.getElementById('detail-grid');
    if(!grid) return;

    Array.from(grid.querySelectorAll('.detail')).forEach(item => {
      const title = item.querySelector('b');
      if(clean(title?.textContent).toLowerCase() === 'celular') title.textContent = 'Celular del alumno';
    });

    let guardian = grid.querySelector('[data-contact-detail="guardian"]');
    if(!guardian){ guardian = createDetail('Apoderado',data.apoderado,'guardian'); grid.appendChild(guardian); }
    else guardian.querySelector('span').textContent = clean(data.apoderado) || '-';

    let guardianPhone = grid.querySelector('[data-contact-detail="guardian-phone"]');
    if(!guardianPhone){ guardianPhone = createDetail('Celular del apoderado',data.celularApoderado,'guardian-phone'); grid.appendChild(guardianPhone); }
    else guardianPhone.querySelector('span').textContent = clean(data.celularApoderado) || '-';
  }catch(error){
    console.warn('No se pudieron completar los contactos de la ficha:',error);
  }
}

function queue(){
  if(queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    positionButton();
    ensureManualContactFields();
  });
}

function start(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    const positioned = positionButton();
    const enhanced = ensureManualContactFields();
    if((positioned && enhanced) || attempts > 100) clearInterval(timer);
  },150);

  observer = new MutationObserver(queue);
  observer.observe(document.getElementById('admin-panel') || document.body,{childList:true,subtree:true});

  document.addEventListener('click',event => {
    const button = event.target.closest('[data-open],[data-pay]');
    if(!button) return;
    const id = button.dataset.open || button.dataset.pay;
    window.setTimeout(() => enrichStudentFicha(id),60);
  });
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
else start();
