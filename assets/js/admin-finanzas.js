/* ==================================================
   Grupo Nostradamus - Finanzas administrativas
   Registro básico de ingresos y egresos en Firestore.
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
const COLLECTION = 'finanzas_movimientos';

const CATEGORIES = {
  ingreso: [
    ['matricula','Matrícula'],
    ['pension','Pensión'],
    ['materiales','Materiales'],
    ['simulacro','Simulacro'],
    ['otros_ingresos','Otros ingresos']
  ],
  egreso: [
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
let movements = [];
let busy = false;
let panelReady = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value));
const localDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2,'0');
  const day = String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
};
const dateLabel = value => {
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
};
const mapLabel = (list,value) => list.find(item => item[0] === value)?.[1] || value || '-';
const categoryLabel = item => mapLabel(CATEGORIES[item.tipo] || [],item.categoria);

function message(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function ensurePanel(){
  if(panelReady && document.getElementById('nostra-finance-panel')) return true;
  const view = document.getElementById('admin-view-finanzas');
  if(!view) return false;

  document.getElementById('admin-finance-placeholder')?.remove();
  if(!document.getElementById('nostra-finance-panel')){
    const panel = document.createElement('div');
    panel.id = 'nostra-finance-panel';
    panel.innerHTML = `
      <div class="nf-actions">
        <div>
          <strong>Control financiero</strong>
          <span>Movimientos registrados manualmente y almacenados en Firebase.</span>
        </div>
        <div class="nf-action-buttons">
          <button class="btn btn-green" type="button" data-finance-new="ingreso">+ Registrar ingreso</button>
          <button class="btn btn-red" type="button" data-finance-new="egreso">+ Registrar egreso</button>
          <button class="btn btn-light" type="button" id="finance-refresh">Actualizar</button>
        </div>
      </div>

      <div class="nf-stats">
        <article class="nf-stat income"><span>Ingresos</span><strong id="finance-income">S/ 0.00</strong><small id="finance-income-count">0 movimientos</small></article>
        <article class="nf-stat expense"><span>Egresos</span><strong id="finance-expense">S/ 0.00</strong><small id="finance-expense-count">0 movimientos</small></article>
        <article class="nf-stat balance"><span>Saldo del periodo</span><strong id="finance-balance">S/ 0.00</strong><small>Ingresos menos egresos</small></article>
        <article class="nf-stat movements"><span>Movimientos</span><strong id="finance-count">0</strong><small id="finance-period-label">Hoy</small></article>
      </div>

      <section class="nf-panel">
        <div class="nf-filters">
          <label><span>Periodo</span><select id="finance-period"><option value="today">Hoy</option><option value="month">Este mes</option><option value="year">Este año</option><option value="all">Todo</option></select></label>
          <label><span>Tipo</span><select id="finance-type-filter"><option value="">Ingresos y egresos</option><option value="ingreso">Solo ingresos</option><option value="egreso">Solo egresos</option></select></label>
          <label class="wide"><span>Buscar</span><input id="finance-search" placeholder="Concepto, categoría, cuenta u operación"></label>
        </div>
        <div class="msg" id="finance-message"></div>
        <div class="table-wrap nf-table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría y concepto</th><th>Método / cuenta</th><th>Operación</th><th>Monto</th></tr></thead>
            <tbody id="finance-rows"><tr><td colspan="6">Cargando movimientos...</td></tr></tbody>
          </table>
        </div>
      </section>`;
    view.appendChild(panel);

    const modal = document.createElement('div');
    modal.id = 'finance-modal-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="finance-modal-title">
        <div class="nf-modal-head"><div><h2 id="finance-modal-title">Registrar movimiento</h2><p id="finance-modal-subtitle">Completa la información de la operación.</p></div><button type="button" class="btn btn-light" id="finance-modal-close">Cerrar</button></div>
        <form id="finance-form">
          <div class="nf-form-grid">
            <label><span>Tipo</span><select id="finance-form-type" required><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></label>
            <label><span>Fecha</span><input id="finance-form-date" type="date" required></label>
            <label><span>Categoría</span><select id="finance-form-category" required></select></label>
            <label><span>Monto (S/)</span><input id="finance-form-amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="0.00"></label>
            <label class="wide"><span>Concepto</span><input id="finance-form-concept" minlength="3" maxlength="160" required placeholder="Ej. Pago de pensión agosto"></label>
            <label><span>Método de pago</span><select id="finance-form-method" required></select></label>
            <label><span>Cuenta o caja</span><select id="finance-form-account" required></select></label>
            <label><span>Número de operación</span><input id="finance-form-operation" maxlength="100" placeholder="Opcional"></label>
            <label class="wide"><span>Observación</span><textarea id="finance-form-note" maxlength="1000" rows="3" placeholder="Opcional"></textarea></label>
          </div>
          <div class="nf-form-note">En esta etapa los movimientos guardados no pueden editarse ni eliminarse. Las anulaciones con historial se incorporarán en una etapa posterior.</div>
          <div class="msg" id="finance-form-message"></div>
          <div class="nf-form-actions"><button class="btn btn-primary" id="finance-save" type="submit">Guardar movimiento</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    bindEvents();
  }

  panelReady = true;
  return true;
}

function fillSelect(id,list){
  const element = document.getElementById(id);
  if(!element) return;
  element.innerHTML = list.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('');
}

function refreshCategoryOptions(){
  const type = document.getElementById('finance-form-type')?.value || 'ingreso';
  fillSelect('finance-form-category',CATEGORIES[type] || []);
}

function bindEvents(){
  document.addEventListener('click',event => {
    const createButton = event.target.closest('[data-finance-new]');
    if(createButton) openModal(createButton.dataset.financeNew);
  });
  document.getElementById('finance-refresh')?.addEventListener('click',loadMovements);
  document.getElementById('finance-period')?.addEventListener('change',render);
  document.getElementById('finance-type-filter')?.addEventListener('change',render);
  document.getElementById('finance-search')?.addEventListener('input',render);
  document.getElementById('finance-modal-close')?.addEventListener('click',closeModal);
  document.getElementById('finance-modal-back')?.addEventListener('click',event => { if(event.target.id === 'finance-modal-back') closeModal(); });
  document.getElementById('finance-form-type')?.addEventListener('change',refreshCategoryOptions);
  document.getElementById('finance-form')?.addEventListener('submit',saveMovement);
  fillSelect('finance-form-method',METHODS);
  fillSelect('finance-form-account',ACCOUNTS);
  refreshCategoryOptions();
}

function openModal(type='ingreso'){
  if(!currentUser) return;
  const form = document.getElementById('finance-form');
  form?.reset();
  document.getElementById('finance-form-type').value = type === 'egreso' ? 'egreso' : 'ingreso';
  document.getElementById('finance-form-date').value = localDate();
  refreshCategoryOptions();
  document.getElementById('finance-modal-title').textContent = type === 'egreso' ? 'Registrar egreso' : 'Registrar ingreso';
  document.getElementById('finance-modal-subtitle').textContent = type === 'egreso' ? 'Registra una salida de dinero.' : 'Registra una entrada de dinero.';
  message('finance-form-message','info','Revisa los datos antes de guardar.');
  document.getElementById('finance-modal-back')?.classList.add('show');
  setTimeout(() => document.getElementById('finance-form-concept')?.focus(),50);
}

function closeModal(){
  if(busy) return;
  document.getElementById('finance-modal-back')?.classList.remove('show');
}

async function loadMovements(){
  if(!currentUser || !ensurePanel()) return;
  const rows = document.getElementById('finance-rows');
  if(rows) rows.innerHTML = '<tr><td colspan="6">Cargando movimientos...</td></tr>';
  message('finance-message','info','Actualizando información financiera...');
  try{
    const snapshot = await getDocs(query(collection(db,COLLECTION),orderBy('createdAt','desc'),limit(1000)));
    movements = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    render();
    message('finance-message','ok',movements.length ? 'Información financiera actualizada.' : 'Aún no existen movimientos. Registra el primer ingreso o egreso.');
  }catch(error){
    console.error(error);
    movements = [];
    render();
    const denied = error?.code === 'permission-denied';
    message('finance-message','err',denied
      ? 'Firebase todavía no autorizó la colección financiera. Deben publicarse las reglas de Firestore antes de registrar movimientos.'
      : 'No se pudo cargar Finanzas. Revisa la conexión e inténtalo nuevamente.');
  }
}

function filteredMovements(){
  const period = document.getElementById('finance-period')?.value || 'today';
  const type = document.getElementById('finance-type-filter')?.value || '';
  const term = clean(document.getElementById('finance-search')?.value).toLowerCase();
  const today = localDate();
  const month = today.slice(0,7);
  const year = today.slice(0,4);

  return movements.filter(item => {
    if((item.estado || 'activo') !== 'activo') return false;
    const date = clean(item.fechaOperacion);
    const periodOk = period === 'all' ||
      (period === 'today' && date === today) ||
      (period === 'month' && date.startsWith(month)) ||
      (period === 'year' && date.startsWith(year));
    const typeOk = !type || item.tipo === type;
    const haystack = [item.concepto,categoryLabel(item),mapLabel(METHODS,item.metodoPago),mapLabel(ACCOUNTS,item.cuenta),item.numeroOperacion,item.observacion].map(clean).join(' ').toLowerCase();
    return periodOk && typeOk && (!term || haystack.includes(term));
  });
}

function render(){
  const data = filteredMovements();
  const income = data.filter(item => item.tipo === 'ingreso').reduce((sum,item) => sum + num(item.monto),0);
  const expense = data.filter(item => item.tipo === 'egreso').reduce((sum,item) => sum + num(item.monto),0);
  const incomeCount = data.filter(item => item.tipo === 'ingreso').length;
  const expenseCount = data.filter(item => item.tipo === 'egreso').length;

  const set = (id,value) => { const element = document.getElementById(id); if(element) element.textContent = value; };
  set('finance-income',money(income));
  set('finance-expense',money(expense));
  set('finance-balance',money(income - expense));
  set('finance-count',String(data.length));
  set('finance-income-count',`${incomeCount} movimiento${incomeCount === 1 ? '' : 's'}`);
  set('finance-expense-count',`${expenseCount} movimiento${expenseCount === 1 ? '' : 's'}`);
  const period = document.getElementById('finance-period')?.value || 'today';
  set('finance-period-label',({today:'Hoy',month:'Este mes',year:'Este año',all:'Todo el historial'})[period] || 'Periodo');

  const rows = document.getElementById('finance-rows');
  if(!rows) return;
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="6">No hay movimientos para los filtros seleccionados.</td></tr>';
    return;
  }
  rows.innerHTML = data.map(item => {
    const isIncome = item.tipo === 'ingreso';
    return `<tr>
      <td><b>${esc(dateLabel(item.fechaOperacion))}</b></td>
      <td><span class="nf-type ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Ingreso' : 'Egreso'}</span></td>
      <td><b>${esc(categoryLabel(item))}</b><br><small>${esc(item.concepto)}</small>${item.observacion ? `<br><small class="nf-muted">${esc(item.observacion)}</small>` : ''}</td>
      <td>${esc(mapLabel(METHODS,item.metodoPago))}<br><small>${esc(mapLabel(ACCOUNTS,item.cuenta))}</small></td>
      <td>${esc(item.numeroOperacion || '-')}</td>
      <td class="nf-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'} ${esc(money(item.monto))}</td>
    </tr>`;
  }).join('');
}

async function saveMovement(event){
  event.preventDefault();
  if(busy || !currentUser) return;

  const type = clean(document.getElementById('finance-form-type')?.value);
  const date = clean(document.getElementById('finance-form-date')?.value);
  const category = clean(document.getElementById('finance-form-category')?.value);
  const concept = clean(document.getElementById('finance-form-concept')?.value);
  const amount = num(document.getElementById('finance-form-amount')?.value);
  const method = clean(document.getElementById('finance-form-method')?.value);
  const account = clean(document.getElementById('finance-form-account')?.value);
  const operation = clean(document.getElementById('finance-form-operation')?.value);
  const note = clean(document.getElementById('finance-form-note')?.value);

  if(!['ingreso','egreso'].includes(type)) return message('finance-form-message','err','Selecciona un tipo de movimiento válido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) return message('finance-form-message','err','Selecciona una fecha válida.');
  if(!(CATEGORIES[type] || []).some(item => item[0] === category)) return message('finance-form-message','err','Selecciona una categoría válida.');
  if(concept.length < 3 || concept.length > 160) return message('finance-form-message','err','El concepto debe tener entre 3 y 160 caracteres.');
  if(amount <= 0 || amount > 1000000) return message('finance-form-message','err','Ingresa un monto mayor que cero y menor o igual a S/ 1,000,000.');
  if(!METHODS.some(item => item[0] === method)) return message('finance-form-message','err','Selecciona un método de pago válido.');
  if(!ACCOUNTS.some(item => item[0] === account)) return message('finance-form-message','err','Selecciona una cuenta válida.');

  try{
    busy = true;
    const saveButton = document.getElementById('finance-save');
    if(saveButton){ saveButton.disabled = true; saveButton.textContent = 'Guardando...'; }
    message('finance-form-message','info','Guardando movimiento en Firebase...');
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
    message('finance-form-message','ok','Movimiento registrado correctamente.');
    await loadMovements();
    setTimeout(closeModal,450);
  }catch(error){
    console.error(error);
    const denied = error?.code === 'permission-denied';
    message('finance-form-message','err',denied
      ? 'Firebase rechazó el registro. Las reglas financieras todavía no están publicadas.'
      : 'No se pudo guardar el movimiento. Inténtalo nuevamente.');
  }finally{
    busy = false;
    const saveButton = document.getElementById('finance-save');
    if(saveButton){ saveButton.disabled = false; saveButton.textContent = 'Guardar movimiento'; }
  }
}

function initializeWhenReady(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if(ensurePanel()){
      clearInterval(timer);
      if(currentUser) loadMovements();
    }else if(attempts > 50){
      clearInterval(timer);
      console.warn('No se encontró la vista financiera del panel.');
    }
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser){
    ensurePanel();
    loadMovements();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initializeWhenReady);
else initializeWhenReady();
