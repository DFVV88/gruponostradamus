/* ==================================================
   Grupo Nostradamus - Continuidad financiera
   Sincroniza el último cierre, muestra los saldos protegidos y bloquea
   movimientos operativos que intenten alterar fechas ya cerradas.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
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
const CONTROL_START_DATE = '2026-08-01';
const CLOSURES_COLLECTION = 'finanzas_cierres';
const CONTROL_COLLECTION = 'finanzas_control';
const CONTROL_DOCUMENT = 'cierre_actual';
const ACCOUNTS = [
  ['caja_efectivo','Caja'],
  ['yape','Yape'],
  ['plin','Plin'],
  ['bcp','BCP'],
  ['culqi','Culqi'],
  ['otra','Otra']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let latestClosure = null;
let loading = false;
let observer = null;
let initialized = false;
let bannerSignature = '';

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const moneyCents = value => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format((Number(value) || 0) / 100);

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}

function nextDate(value){
  const date = new Date(`${value}T12:00:00`);
  if(Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function isLockedOperationalDate(value){
  const date = clean(value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if(date < CONTROL_START_DATE) return false;
  return Boolean(latestClosure?.fechaCierre) && date <= latestClosure.fechaCierre;
}

function setFormMessage(id,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = 'msg err';
  element.textContent = text;
}

function lockMessage(value){
  return `La fecha ${dateLabel(value)} pertenece a un periodo cerrado hasta el ${dateLabel(latestClosure?.fechaCierre)}. Registra la corrección mediante anulación o en una fecha operativa abierta.`;
}

function formConfiguration(form){
  const id = form?.id || '';
  if(id === 'finance-form'){
    return {dateId:'finance-form-date',messageId:'finance-form-message'};
  }
  if(id === 'finance-transfer-form'){
    return {dateId:'finance-transfer-date',messageId:'finance-transfer-message'};
  }
  if(id === 'student-installment-payment-form'){
    return {dateId:'student-installment-payment-date',messageId:'student-installment-payment-message'};
  }
  return null;
}

function validateFormDate(form,event){
  const config = formConfiguration(form);
  if(!config) return true;
  const date = clean(document.getElementById(config.dateId)?.value);
  if(!isLockedOperationalDate(date)) return true;
  event?.preventDefault();
  event?.stopImmediatePropagation();
  setFormMessage(config.messageId,lockMessage(date));
  document.getElementById(config.dateId)?.focus();
  return false;
}

function accountValue(accountId){
  return Number(latestClosure?.cuentas?.[accountId]?.saldoRealCentimos || 0);
}

function injectStyles(){
  if(document.getElementById('finance-continuity-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-continuity-styles';
  style.textContent = `
    #finance-continuity-banner{margin:14px 0;padding:15px 17px;border:1px solid rgba(7,140,149,.2);border-radius:18px;background:linear-gradient(135deg,#effbfc,#fff);color:#14323a}
    #finance-continuity-banner .fc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
    #finance-continuity-banner strong{display:block;color:#075b65;font-family:'Baloo 2';font-size:22px;line-height:1.05}
    #finance-continuity-banner p{margin:4px 0 0;color:#5f7079;font-size:11px;line-height:1.45}
    #finance-continuity-banner .fc-status{padding:6px 10px;border-radius:999px;background:#e7f8ef;color:#14754f;font-size:9px;font-weight:950;text-transform:uppercase;white-space:nowrap}
    #finance-continuity-banner .fc-accounts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:12px}
    #finance-continuity-banner .fc-account{padding:9px 10px;border-radius:12px;background:#fff;border:1px solid #e0ecef}
    #finance-continuity-banner .fc-account span{display:block;color:#70808a;font-size:8px;font-weight:950;text-transform:uppercase}
    #finance-continuity-banner .fc-account b{display:block;margin-top:2px;color:#061426;font-size:12px}
    @media(max-width:900px){#finance-continuity-banner .fc-accounts{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:560px){#finance-continuity-banner .fc-head{display:block}#finance-continuity-banner .fc-status{display:inline-block;margin-top:9px}#finance-continuity-banner .fc-accounts{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(style);
}

function renderBanner(){
  const panel = document.getElementById('nostra-finance-panel');
  if(!panel) return false;
  injectStyles();
  let banner = document.getElementById('finance-continuity-banner');
  if(!banner){
    banner = document.createElement('section');
    banner.id = 'finance-continuity-banner';
    const actions = panel.querySelector('.nf-actions');
    actions?.insertAdjacentElement('afterend',banner);
  }

  let signature = 'sin-cierre';
  let html = `
    <div class="fc-head"><div><strong>Continuidad financiera preparada</strong><p>Aún no se encontró un cierre diario. Los movimientos permanecen abiertos desde el 1 de agosto de 2026.</p></div><span class="fc-status">Sin cierre previo</span></div>`;

  if(latestClosure){
    const next = nextDate(latestClosure.fechaCierre);
    signature = [
      latestClosure.fechaCierre,
      ...ACCOUNTS.map(([id]) => accountValue(id))
    ].join('|');
    html = `
      <div class="fc-head">
        <div><strong>Último cierre protegido: ${dateLabel(latestClosure.fechaCierre)}</strong><p>El saldo final de este cierre será la referencia de apertura desde el ${dateLabel(next)}. Las fechas operativas anteriores permanecen bloqueadas.</p></div>
        <span class="fc-status">Cierre confirmado</span>
      </div>
      <div class="fc-accounts">
        ${ACCOUNTS.map(([id,label]) => `<div class="fc-account"><span>${label}</span><b>${moneyCents(accountValue(id))}</b></div>`).join('')}
      </div>`;
  }

  if(signature !== bannerSignature || !banner.innerHTML){
    banner.innerHTML = html;
    bannerSignature = signature;
  }
  return true;
}

async function synchronizeControl(){
  if(!currentUser || !latestClosure?.fechaCierre) return;
  const payload = {
    ultimaFechaCerrada:latestClosure.fechaCierre,
    cierreId:latestClosure.id || latestClosure.fechaCierre,
    cuentas:latestClosure.cuentas || {},
    saldoRealTotalCentimos:Number(latestClosure.saldoRealTotalCentimos || 0),
    cerradoPor:clean(currentUser.email || ADMIN_EMAIL),
    origen:'cierre_diario_admin',
    version:'2026-08-continuidad-1',
    updatedAt:serverTimestamp()
  };
  try{
    await setDoc(doc(db,CONTROL_COLLECTION,CONTROL_DOCUMENT),payload);
  }catch(error){
    console.warn('El estado de continuidad se sincronizará cuando las reglas estén publicadas.',error);
  }
}

async function loadLatestClosure(){
  if(!currentUser || loading) return;
  loading = true;
  try{
    const snapshot = await getDocs(query(
      collection(db,CLOSURES_COLLECTION),
      orderBy('fechaCierre','desc'),
      limit(1)
    ));
    latestClosure = snapshot.empty
      ? null
      : {id:snapshot.docs[0].id,...snapshot.docs[0].data()};
    renderBanner();
    await synchronizeControl();
  }catch(error){
    console.error('No se pudo cargar el último cierre diario.',error);
  }finally{
    loading = false;
  }
}

function bindGuards(){
  document.addEventListener('submit',event => {
    validateFormDate(event.target,event);
  },true);

  document.addEventListener('change',event => {
    const input = event.target;
    if(!input?.matches('#finance-form-date,#finance-transfer-date,#student-installment-payment-date')) return;
    if(!isLockedOperationalDate(input.value)) return;
    const form = input.closest('form');
    const config = formConfiguration(form);
    if(config) setFormMessage(config.messageId,lockMessage(input.value));
  },true);

  document.addEventListener('click',event => {
    if(event.target.closest('#finance-refresh')){
      window.setTimeout(loadLatestClosure,500);
    }
  },true);
}

function initialize(){
  if(initialized){
    loadLatestClosure();
    return;
  }
  initialized = true;
  bindGuards();
  renderBanner();
  observer = new MutationObserver(() => {
    if(!document.getElementById('finance-continuity-banner')) renderBanner();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  loadLatestClosure();
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) initialize();
});
