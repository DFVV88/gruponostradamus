/* ==================================================
   Grupo Nostradamus - Carga histórica financiera 2026
   Permite registrar y consultar movimientos desde enero de 2026.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  doc
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
const MIN_DATE = '2026-01-01';
const CONTROL_START_DATE = '2026-08-01';
const TRANSFER_CATEGORY = 'transferencia_interna';
const MONTH_PREFIX = 'history:';

const CATEGORIES = {
  ingreso:[
    ['matricula','Matrícula'],
    ['pension','Pensión'],
    ['materiales','Materiales'],
    ['simulacro','Simulacro'],
    ['otros_ingresos','Otros ingresos']
  ],
  egreso:[
    ['docentes','Pago a docentes'],
    ['personal_administrativo','Personal administrativo'],
    ['alquiler','Alquiler'],
    ['servicios','Servicios'],
    ['publicidad','Publicidad'],
    ['materiales','Materiales e impresiones'],
    ['mantenimiento','Mantenimiento'],
    ['deudas','Pago de deudas'],
    ['otros_egresos','Otros egresos']
  ]
};

const METHODS = [
  ['efectivo','Efectivo'],
  ['yape','Yape'],
  ['plin','Plin'],
  ['transferencia','Transferencia bancaria'],
  ['culqi','Pasarela Culqi'],
  ['otro','Otro']
];

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
let ready = false;
let busy = false;
let monthData = [];
let rowsObserver = null;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value));
const mapLabel = (list,value) => list.find(item => item[0] === value)?.[1] || value || '-';
const accountLabel = value => mapLabel(ACCOUNTS,value);
const isTransfer = item => item?.categoria === TRANSFER_CATEGORY;
const categoryLabel = item => isTransfer(item) ? 'Transferencia interna' : mapLabel(CATEGORIES[item.tipo] || [],item.categoria);

function todayIso(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}

function createdLabel(value){
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-PE') : '';
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function isHistoricalDate(value){
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= MIN_DATE && value < CONTROL_START_DATE;
}

function isValidDate(value){
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= MIN_DATE && value <= todayIso();
}

function currentMonthValue(){
  const period = document.getElementById('finance-period')?.value || '';
  return period.startsWith(MONTH_PREFIX) ? period.slice(MONTH_PREFIX.length) : '';
}

function monthLabel(value){
  const [year,month] = value.split('-').map(Number);
  if(!year || !month) return value;
  const text = new Date(year,month-1,1).toLocaleDateString('es-PE',{month:'long',year:'numeric'});
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function injectStyles(){
  if(document.getElementById('finance-history-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-history-styles';
  style.textContent = `
    .nf-history-banner{display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid rgba(255,148,30,.28);border-radius:17px;background:#fff8e8;color:#6a4700;font-size:12px;font-weight:800;line-height:1.5}
    .nf-history-banner strong{display:block;color:#5b3c00;font-size:13px;margin-bottom:2px}
    .nf-history-icon{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:#fff;color:#a25b00;font-weight:950}
    .nf-history-hint{grid-column:1/-1;padding:10px 12px;border-radius:12px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:800;line-height:1.45}
    .nf-history-hint.active{background:#fff8e8;color:#6a4700;border:1px solid rgba(255,148,30,.25)}
    .nf-history-badge{display:inline-flex;margin-left:7px;padding:3px 7px;border-radius:999px;background:#fff3df;color:#8a4c00;font-size:9px;font-weight:950;vertical-align:middle;text-transform:uppercase;letter-spacing:.25px}
    .nf-history-registered{display:block;margin-top:3px;color:#87939d;font-size:9px;font-weight:700}
    @media(max-width:720px){.nf-history-banner{font-size:11px}}
  `;
  document.head.appendChild(style);
}

function addMonthOptions(){
  const select = document.getElementById('finance-period');
  if(!select || select.querySelector('optgroup[data-history-months]')) return;
  const group = document.createElement('optgroup');
  group.label = 'Mes específico de 2026';
  group.dataset.historyMonths = '1';
  const now = new Date();
  const lastMonth = now.getFullYear() === 2026 ? now.getMonth() + 1 : 12;
  for(let month=1;month<=lastMonth;month+=1){
    const value = `2026-${String(month).padStart(2,'0')}`;
    const option = document.createElement('option');
    option.value = MONTH_PREFIX + value;
    option.textContent = monthLabel(value);
    group.appendChild(option);
  }
  select.appendChild(group);
}

function updateDateHint(inputId,hintId){
  const input = document.getElementById(inputId);
  const hint = document.getElementById(hintId);
  if(!input || !hint) return;
  const value = clean(input.value);
  const historical = isHistoricalDate(value);
  hint.classList.toggle('active',historical);
  hint.textContent = historical
    ? 'Carga histórica: esta operación corresponde a enero-julio de 2026. Debes escribir una observación o número de operación que permita identificarla.'
    : 'La fecha real de la operación se guardará separada de la fecha y hora en que la ingresas al sistema.';
}

function decorateExistingRows(){
  const rows = document.getElementById('finance-rows');
  if(!rows) return;
  rows.querySelectorAll('tr').forEach(row => {
    if(row.dataset.historyDecorated === '1' || row.cells.length < 3) return;
    const text = clean(row.cells[0]?.textContent);
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if(!match) return;
    const iso = `${match[3]}-${String(match[2]).padStart(2,'0')}-${String(match[1]).padStart(2,'0')}`;
    if(iso < CONTROL_START_DATE){
      const target = row.cells[2].querySelector('b') || row.cells[2];
      target.insertAdjacentHTML('afterend','<span class="nf-history-badge">Histórico</span>');
    }
    row.dataset.historyDecorated = '1';
  });
}

function setupObserver(){
  const rows = document.getElementById('finance-rows');
  if(!rows || rowsObserver) return;
  rowsObserver = new MutationObserver(decorateExistingRows);
  rowsObserver.observe(rows,{childList:true,subtree:true});
  decorateExistingRows();
}

function setup(){
  if(ready) return true;
  const panel = document.getElementById('nostra-finance-panel');
  const form = document.getElementById('finance-form');
  const transferForm = document.getElementById('finance-transfer-form');
  if(!panel || !form || !transferForm) return false;

  injectStyles();

  if(!document.getElementById('finance-history-banner')){
    const banner = document.createElement('div');
    banner.id = 'finance-history-banner';
    banner.className = 'nf-history-banner';
    banner.innerHTML = '<span class="nf-history-icon">2026</span><div><strong>Control ordenado desde agosto de 2026</strong>Puedes reconstruir manualmente operaciones desde el 1 de enero de 2026. Los movimientos de enero a julio quedarán identificados como históricos por su fecha real.</div>';
    panel.querySelector('.nf-actions')?.insertAdjacentElement('afterend',banner);
  }

  const date = document.getElementById('finance-form-date');
  const transferDate = document.getElementById('finance-transfer-date');
  [date,transferDate].forEach(input => {
    if(!input) return;
    input.min = MIN_DATE;
    input.max = todayIso();
  });

  if(!document.getElementById('finance-history-form-hint')){
    const hint = document.createElement('div');
    hint.id = 'finance-history-form-hint';
    hint.className = 'nf-history-hint';
    form.querySelector('.nf-form-grid')?.appendChild(hint);
  }
  if(!document.getElementById('finance-history-transfer-hint')){
    const hint = document.createElement('div');
    hint.id = 'finance-history-transfer-hint';
    hint.className = 'nf-history-hint';
    transferForm.querySelector('.nf-form-grid')?.appendChild(hint);
  }

  addMonthOptions();
  updateDateHint('finance-form-date','finance-history-form-hint');
  updateDateHint('finance-transfer-date','finance-history-transfer-hint');

  date?.addEventListener('change',() => updateDateHint('finance-form-date','finance-history-form-hint'));
  transferDate?.addEventListener('change',() => updateDateHint('finance-transfer-date','finance-history-transfer-hint'));

  form.addEventListener('submit',handleMovementSubmit,true);
  transferForm.addEventListener('submit',handleTransferSubmit,true);

  document.getElementById('finance-period')?.addEventListener('change',handleMonthFilter,true);
  document.getElementById('finance-type-filter')?.addEventListener('change',handleMonthDependentFilter,true);
  document.getElementById('finance-account-filter')?.addEventListener('change',handleMonthDependentFilter,true);
  document.getElementById('finance-search')?.addEventListener('input',handleMonthDependentFilter,true);
  document.getElementById('finance-refresh')?.addEventListener('click',handleMonthRefresh,true);

  setupObserver();
  ready = true;
  return true;
}

function stopEvent(event){
  event.preventDefault();
  event.stopImmediatePropagation();
}

function validateHistoricalReference(operation,note,messageId){
  if(operation.length >= 3 || note.length >= 3) return true;
  setMessage(messageId,'err','Para una carga histórica escribe una observación o número de operación que permita identificarla.');
  return false;
}

async function handleMovementSubmit(event){
  const date = clean(document.getElementById('finance-form-date')?.value);
  if(!isValidDate(date)){
    stopEvent(event);
    setMessage('finance-form-message','err','La fecha debe estar entre el 1 de enero de 2026 y hoy.');
    return;
  }
  if(!isHistoricalDate(date)) return;

  stopEvent(event);
  if(busy || !currentUser) return;

  const type = clean(document.getElementById('finance-form-type')?.value);
  const category = clean(document.getElementById('finance-form-category')?.value);
  const concept = clean(document.getElementById('finance-form-concept')?.value);
  const amount = num(document.getElementById('finance-form-amount')?.value);
  const method = clean(document.getElementById('finance-form-method')?.value);
  const account = clean(document.getElementById('finance-form-account')?.value);
  const operation = clean(document.getElementById('finance-form-operation')?.value);
  const note = clean(document.getElementById('finance-form-note')?.value);

  if(!['ingreso','egreso'].includes(type)) return setMessage('finance-form-message','err','Selecciona un tipo válido.');
  if(!(CATEGORIES[type] || []).some(item => item[0] === category)) return setMessage('finance-form-message','err','Selecciona una categoría válida.');
  if(concept.length < 3 || concept.length > 160) return setMessage('finance-form-message','err','El concepto debe tener entre 3 y 160 caracteres.');
  if(amount <= 0 || amount > 1000000) return setMessage('finance-form-message','err','Ingresa un monto válido.');
  if(!METHODS.some(item => item[0] === method)) return setMessage('finance-form-message','err','Selecciona un método de pago válido.');
  if(!ACCOUNTS.some(item => item[0] === account)) return setMessage('finance-form-message','err','Selecciona una cuenta válida.');
  if(!validateHistoricalReference(operation,note,'finance-form-message')) return;

  const button = document.getElementById('finance-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando histórico...'; }
    setMessage('finance-form-message','info','Guardando la operación histórica con su fecha real...');
    await addDoc(collection(db,COLLECTION),{
      tipo:type,
      fechaOperacion:date,
      categoria:category,
      concepto:concept,
      monto:amount,
      metodoPago:method,
      cuenta:account,
      numeroOperacion:operation,
      observacion:note,
      estado:'activo',
      origen:'manual_admin',
      creadoPor:currentUser.email || ADMIN_EMAIL,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    setMessage('finance-form-message','ok','Movimiento histórico registrado correctamente.');
    selectMonthAndReload(date.slice(0,7));
    setTimeout(() => document.getElementById('finance-modal-back')?.classList.remove('show'),500);
  }catch(error){
    console.error(error);
    setMessage('finance-form-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó el registro histórico. Revisa los permisos publicados.'
      : 'No se pudo guardar el movimiento histórico.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Guardar movimiento'; }
  }
}

async function handleTransferSubmit(event){
  const date = clean(document.getElementById('finance-transfer-date')?.value);
  if(!isValidDate(date)){
    stopEvent(event);
    setMessage('finance-transfer-message','err','La fecha debe estar entre el 1 de enero de 2026 y hoy.');
    return;
  }
  if(!isHistoricalDate(date)) return;

  stopEvent(event);
  if(busy || !currentUser) return;

  const source = clean(document.getElementById('finance-transfer-source')?.value);
  const destination = clean(document.getElementById('finance-transfer-destination')?.value);
  const amount = num(document.getElementById('finance-transfer-amount')?.value);
  const operationInput = clean(document.getElementById('finance-transfer-operation')?.value);
  const note = clean(document.getElementById('finance-transfer-note')?.value);

  if(!ACCOUNTS.some(item => item[0] === source) || !ACCOUNTS.some(item => item[0] === destination)) return setMessage('finance-transfer-message','err','Selecciona cuentas válidas.');
  if(source === destination) return setMessage('finance-transfer-message','err','La cuenta de origen y destino deben ser diferentes.');
  if(amount <= 0 || amount > 1000000) return setMessage('finance-transfer-message','err','Ingresa un monto válido.');
  if(!validateHistoricalReference(operationInput,note,'finance-transfer-message')) return;

  const reference = operationInput || `TR-H-${Date.now().toString(36).toUpperCase()}`;
  const common = {
    fechaOperacion:date,
    categoria:TRANSFER_CATEGORY,
    monto:amount,
    metodoPago:'transferencia',
    numeroOperacion:reference,
    observacion:note,
    estado:'activo',
    origen:'manual_admin',
    creadoPor:currentUser.email || ADMIN_EMAIL,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };

  const button = document.getElementById('finance-transfer-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando histórico...'; }
    setMessage('finance-transfer-message','info','Registrando la transferencia histórica en ambas cuentas...');
    const batch = writeBatch(db);
    batch.set(doc(collection(db,COLLECTION)),{
      ...common,
      tipo:'egreso',
      cuenta:source,
      concepto:`Transferencia a ${accountLabel(destination)}`
    });
    batch.set(doc(collection(db,COLLECTION)),{
      ...common,
      tipo:'ingreso',
      cuenta:destination,
      concepto:`Transferencia desde ${accountLabel(source)}`
    });
    await batch.commit();
    setMessage('finance-transfer-message','ok','Transferencia histórica registrada correctamente.');
    selectMonthAndReload(date.slice(0,7));
    setTimeout(() => document.getElementById('finance-transfer-back')?.classList.remove('show'),600);
  }catch(error){
    console.error(error);
    setMessage('finance-transfer-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó la transferencia histórica.'
      : 'No se pudo registrar la transferencia histórica.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Registrar transferencia'; }
  }
}

function selectMonthAndReload(month){
  const period = document.getElementById('finance-period');
  const optionValue = MONTH_PREFIX + month;
  if(period && Array.from(period.options).some(option => option.value === optionValue)) period.value = optionValue;
  loadMonthData();
}

function handleMonthFilter(event){
  if(!clean(event.target.value).startsWith(MONTH_PREFIX)) return;
  event.stopImmediatePropagation();
  loadMonthData();
}

function handleMonthDependentFilter(event){
  if(!currentMonthValue()) return;
  event.stopImmediatePropagation();
  renderMonthData();
}

function handleMonthRefresh(event){
  if(!currentMonthValue()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  loadMonthData();
}

async function loadMonthData(){
  if(!currentUser || !currentMonthValue()) return;
  const rows = document.getElementById('finance-rows');
  if(rows) rows.innerHTML = '<tr><td colspan="6">Cargando el mes seleccionado...</td></tr>';
  setMessage('finance-message','info','Consultando el historial del mes...');
  try{
    const snapshot = await getDocs(query(collection(db,COLLECTION),orderBy('createdAt','desc'),limit(2000)));
    monthData = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    renderMonthData();
    setMessage('finance-message','ok',`Mostrando ${monthLabel(currentMonthValue())}.`);
  }catch(error){
    console.error(error);
    monthData = [];
    renderMonthData();
    setMessage('finance-message','err','No se pudo consultar el mes seleccionado.');
  }
}

function operationCount(data){
  const regular = data.filter(item => !isTransfer(item)).length;
  const transfers = new Set(data.filter(isTransfer).map(item => clean(item.numeroOperacion) || `${item.fechaOperacion}-${item.monto}-${item.concepto}`));
  return regular + transfers.size;
}

function renderMonthData(){
  const month = currentMonthValue();
  if(!month) return;
  const type = clean(document.getElementById('finance-type-filter')?.value);
  const account = clean(document.getElementById('finance-account-filter')?.value);
  const term = clean(document.getElementById('finance-search')?.value).toLowerCase();

  const data = monthData.filter(item => {
    if((item.estado || 'activo') !== 'activo') return false;
    const monthOk = clean(item.fechaOperacion).startsWith(month);
    const typeOk = !type || item.tipo === type;
    const accountOk = !account || item.cuenta === account;
    const haystack = [item.concepto,categoryLabel(item),mapLabel(METHODS,item.metodoPago),accountLabel(item.cuenta),item.numeroOperacion,item.observacion].map(clean).join(' ').toLowerCase();
    return monthOk && typeOk && accountOk && (!term || haystack.includes(term));
  });

  const operational = data.filter(item => !isTransfer(item));
  const income = operational.filter(item => item.tipo === 'ingreso').reduce((sum,item) => sum + num(item.monto),0);
  const expense = operational.filter(item => item.tipo === 'egreso').reduce((sum,item) => sum + num(item.monto),0);
  const incomeCount = operational.filter(item => item.tipo === 'ingreso').length;
  const expenseCount = operational.filter(item => item.tipo === 'egreso').length;
  const set = (id,value) => { const element = document.getElementById(id); if(element) element.textContent = value; };

  set('finance-income',money(income));
  set('finance-expense',money(expense));
  set('finance-balance',money(income-expense));
  set('finance-count',String(operationCount(data)));
  set('finance-income-count',`${incomeCount} movimiento${incomeCount === 1 ? '' : 's'}`);
  set('finance-expense-count',`${expenseCount} movimiento${expenseCount === 1 ? '' : 's'}`);
  set('finance-period-label',monthLabel(month));

  const rows = document.getElementById('finance-rows');
  if(!rows) return;
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="6">No hay movimientos para ese mes y filtros.</td></tr>';
    return;
  }

  rows.innerHTML = data.map(item => {
    const incomeType = item.tipo === 'ingreso';
    const transfer = isTransfer(item);
    const typeClass = transfer ? 'transfer' : (incomeType ? 'income' : 'expense');
    const typeText = transfer ? 'Transferencia' : (incomeType ? 'Ingreso' : 'Egreso');
    const historical = clean(item.fechaOperacion) < CONTROL_START_DATE;
    const registered = createdLabel(item.createdAt);
    return `<tr data-history-decorated="1">
      <td><b>${esc(dateLabel(item.fechaOperacion))}</b>${registered ? `<small class="nf-history-registered">Registrado: ${esc(registered)}</small>` : ''}</td>
      <td><span class="nf-type ${typeClass}">${typeText}</span></td>
      <td><b>${esc(categoryLabel(item))}</b>${historical ? '<span class="nf-history-badge">Histórico</span>' : ''}<br><small>${esc(item.concepto)}</small>${item.observacion ? `<br><small class="nf-muted">${esc(item.observacion)}</small>` : ''}</td>
      <td>${esc(mapLabel(METHODS,item.metodoPago))}<br><small>${esc(accountLabel(item.cuenta))}</small></td>
      <td>${esc(item.numeroOperacion || '-')}</td>
      <td class="nf-amount ${incomeType ? 'income' : 'expense'}">${incomeType ? '+' : '-'} ${esc(money(item.monto))}</td>
    </tr>`;
  }).join('');
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
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
