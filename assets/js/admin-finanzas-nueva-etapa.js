/* ==================================================
   Grupo Nostradamus - Nueva etapa financiera
   Los saldos operativos parten de cero el 01/08/2026.
   Los registros anteriores permanecen como historial opcional.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit
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
const COLLECTION = 'finanzas_movimientos';
const CONTROL_START_DATE = '2026-08-01';
const ACCOUNTS = [
  ['caja_efectivo','Caja en efectivo'],
  ['yape','Yape'],
  ['plin','Plin'],
  ['bcp','Cuenta BCP'],
  ['culqi','Pasarela Culqi'],
  ['otra','Otra cuenta']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let movements = [];
let gridObserver = null;
let applying = false;
let refreshTimer = null;
let ready = false;

const clean = value => String(value == null ? '' : value).trim();
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value));

function activeStageMovements(){
  return movements.filter(item =>
    (item.estado || 'activo') === 'activo' &&
    clean(item.fechaOperacion) >= CONTROL_START_DATE
  );
}

function updateExplanations(){
  const panel = document.getElementById('nostra-finance-panel');
  if(!panel) return;

  const banner = document.getElementById('finance-history-banner');
  if(banner){
    banner.innerHTML = '<span class="nf-history-icon">0</span><div><strong>Nueva etapa financiera desde el 1 de agosto de 2026</strong>Caja, Yape, Plin, BCP, Culqi y otras cuentas parten de S/ 0.00. La carga de enero a julio es opcional y se conserva únicamente como historial; no altera los saldos operativos de esta nueva etapa.</div>';
  }

  const accountHead = panel.querySelector('.nf-account-head');
  const accountDescription = accountHead?.querySelector('div span');
  const accountHint = accountHead?.querySelector(':scope > small');
  if(accountDescription) accountDescription.textContent = 'Saldos operativos calculados únicamente desde el 1 de agosto de 2026.';
  if(accountHint) accountHint.textContent = 'Inicio oficial: 01/08/2026';

  const note = panel.querySelector('.nf-account-note');
  if(note){
    note.textContent = 'Todas las cuentas comenzaron en S/ 0.00 el 1 de agosto de 2026. Los movimientos históricos de enero a julio pueden consultarse por mes, pero no se suman a estos saldos de la nueva etapa.';
  }
}

function applyStageBalances(){
  const grid = document.getElementById('finance-account-grid');
  if(!grid || applying) return;

  applying = true;
  if(gridObserver) gridObserver.disconnect();

  const stage = activeStageMovements();
  ACCOUNTS.forEach(([id]) => {
    const card = grid.querySelector(`[data-finance-account="${id}"]`);
    if(!card) return;

    const data = stage.filter(item => item.cuenta === id);
    const income = data
      .filter(item => item.tipo === 'ingreso')
      .reduce((sum,item) => sum + num(item.monto),0);
    const expense = data
      .filter(item => item.tipo === 'egreso')
      .reduce((sum,item) => sum + num(item.monto),0);
    const balance = income - expense;

    const subtitle = card.querySelector('.nf-account-top small');
    const balanceNode = card.querySelector(':scope > b');
    const flows = card.querySelectorAll('.nf-account-flow span');

    if(subtitle) subtitle.textContent = 'Saldo nueva etapa';
    if(balanceNode){
      balanceNode.textContent = money(balance);
      balanceNode.classList.toggle('positive',balance > 0);
      balanceNode.classList.toggle('negative',balance < 0);
    }
    if(flows[0]) flows[0].textContent = `Entradas ${money(income)}`;
    if(flows[1]) flows[1].textContent = `Salidas ${money(expense)}`;
  });

  applying = false;
  observeGrid();
}

function observeGrid(){
  const grid = document.getElementById('finance-account-grid');
  if(!grid) return;
  if(!gridObserver){
    gridObserver = new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(applyStageBalances,50);
    });
  }
  gridObserver.observe(grid,{childList:true,subtree:true});
}

async function loadStageBalances(){
  if(!currentUser) return;
  try{
    const snapshot = await getDocs(query(
      collection(db,COLLECTION),
      orderBy('createdAt','desc'),
      limit(2000)
    ));
    movements = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    updateExplanations();
    applyStageBalances();
  }catch(error){
    console.error('No se pudieron calcular los saldos de la nueva etapa.',error);
  }
}

function bindRefreshes(){
  document.addEventListener('click',event => {
    if(event.target.closest('#finance-refresh')){
      setTimeout(loadStageBalances,600);
    }
  });

  document.addEventListener('submit',event => {
    if(event.target.matches('#finance-form,#finance-transfer-form')){
      setTimeout(loadStageBalances,1200);
    }
  },true);
}

function setup(){
  if(ready) return true;
  const panel = document.getElementById('nostra-finance-panel');
  const grid = document.getElementById('finance-account-grid');
  if(!panel || !grid) return false;

  ready = true;
  updateExplanations();
  observeGrid();
  bindRefreshes();
  if(currentUser) loadStageBalances();
  return true;
}

function initialize(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if(setup() || attempts > 60) clearInterval(timer);
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser){
    setup();
    loadStageBalances();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();

import('./admin-finanzas-auditoria.js?v=2026-08-02-1').catch(error => {
  console.error('No se pudo cargar la auditoría financiera.',error);
});

import('./admin-finanzas-cierres.js?v=2026-08-02-1').catch(error => {
  console.error('No se pudo cargar el cierre diario financiero.',error);
});

import('./admin-vouchers.js?v=2026-08-02-1').catch(error => {
  console.error('No se pudo cargar el módulo de vouchers.',error);
});

import('./admin-correcciones-pagos-cuotas.js?v=2026-08-02-2').catch(error => {
  console.error('No se pudieron cargar las correcciones de pagos y cuotas.',error);
});
