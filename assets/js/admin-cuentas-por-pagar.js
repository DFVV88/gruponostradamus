/* ==================================================
   Grupo Nostradamus - Cuentas por pagar
   Etapa 9: obligaciones, vencimientos y pagos integrados con Finanzas.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
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
const OBLIGATION_COLLECTION = 'finanzas_obligaciones';
const PAYMENT_COLLECTION = 'finanzas_pagos_obligaciones';
const MOVEMENT_COLLECTION = 'finanzas_movimientos';
const MAX_RECORDS = 2000;
const CONTROL_START_DATE = '2026-08-01';

const BENEFICIARY_TYPES = [
  ['docente','Docente'],
  ['personal','Personal administrativo'],
  ['arrendador','Alquiler / arrendador'],
  ['proveedor','Proveedor'],
  ['acreedor','Deuda / acreedor'],
  ['otro','Otro']
];

const CATEGORIES = [
  ['docentes','Pago a docentes'],
  ['personal_administrativo','Personal administrativo'],
  ['alquiler','Alquiler'],
  ['servicios','Servicios'],
  ['publicidad','Publicidad'],
  ['materiales','Materiales e impresiones'],
  ['mantenimiento','Mantenimiento'],
  ['deudas','Pago de deudas'],
  ['otros_egresos','Otros egresos']
];

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
let obligations = [];
let payments = [];
let selectedObligationId = '';
let busy = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
}[char]));
const cents = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format((Number(value) || 0) / 100);
const mapLabel = (list,value) => list.find(item => item[0] === value)?.[1] || value || '-';

function localDate(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function addDaysIso(value,days){
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}

function timestampLabel(value){
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})
    : '-';
}

function uid(){
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('finance-payables-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-payables-styles';
  style.textContent = `
    .npay-section{margin:18px 0;padding:19px;border:1px solid rgba(7,140,149,.16);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .npay-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.npay-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:31px;line-height:1}.npay-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.45}.npay-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.npay-actions .btn{padding:9px 13px;font-size:10px;margin:0;white-space:nowrap}
    .npay-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:13px}.npay-stat{padding:13px 14px;border:1px solid #e1ecef;border-radius:16px;background:#fbfdfe}.npay-stat span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.npay-stat strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:24px;line-height:1}.npay-stat.overdue strong{color:#b42318}.npay-stat.upcoming strong{color:#b45309}.npay-stat.count strong{color:#078c95}
    .npay-filters{display:grid;grid-template-columns:minmax(220px,1.3fr) minmax(160px,.7fr) minmax(190px,.8fr) minmax(160px,.7fr) auto;gap:8px;margin-bottom:11px}.npay-filters input,.npay-filters select{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:12px;outline:none}.npay-filters .btn{padding:9px 12px;font-size:10px}
    .npay-table table{min-width:1180px}.npay-table th{font-size:9px}.npay-table td{font-size:11px}.npay-sub{display:block;margin-top:3px;color:#71808c;font-size:9px;line-height:1.4}.npay-money{font-weight:950;white-space:nowrap}.npay-money.pending{color:#b45309}.npay-money.paid{color:#14855a}.npay-money.overdue{color:#b42318}.npay-status{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:950;text-transform:uppercase;white-space:nowrap}.npay-status.vencido{background:#fff0ef;color:#b42318}.npay-status.proximo{background:#fff8e8;color:#8a4c00}.npay-status.pendiente{background:#eef8fa;color:#075b65}.npay-status.parcial{background:#eef8fa;color:#075b65}.npay-status.pagada{background:#eaf9f1;color:#14855a}.npay-row-actions{display:flex;flex-wrap:wrap;gap:5px}.npay-action{border:1px solid #078c95;border-radius:999px;padding:7px 10px;background:#078c95;color:#fff;font:inherit;font-size:9px;font-weight:950;cursor:pointer;white-space:nowrap}.npay-action.secondary{background:#fff;color:#075b65}.npay-action:disabled{opacity:.45;cursor:not-allowed}
    .npay-history{max-height:52vh;overflow:auto;border:1px solid #dce9ed;border-radius:16px}.npay-history table{min-width:850px}.npay-history th{font-size:9px}.npay-history td{font-size:11px}.npay-empty{padding:18px;text-align:center;color:#647482}
    @media(max-width:1050px){.npay-filters{grid-template-columns:1fr 1fr 1fr}.npay-filters .btn{width:100%}}
    @media(max-width:720px){.npay-head{display:block}.npay-actions{display:grid;grid-template-columns:1fr 1fr;margin-top:10px}.npay-actions .btn{width:100%}.npay-stats,.npay-filters{grid-template-columns:1fr}.npay-stat strong{font-size:22px}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  if(document.getElementById('finance-payables-section')) return true;
  const finance = document.getElementById('nostra-finance-panel');
  if(!finance) return false;
  injectStyles();

  const section = document.createElement('section');
  section.id = 'finance-payables-section';
  section.className = 'npay-section';
  section.innerHTML = `
    <div class="npay-head">
      <div><h3>Cuentas por pagar</h3><p>Controla obligaciones con docentes, personal, alquiler, servicios, proveedores y acreedores. Cada pago genera su egreso financiero automáticamente.</p></div>
      <div class="npay-actions">
        <button type="button" class="btn btn-primary" id="finance-payable-new">+ Nueva obligación</button>
        <button type="button" class="btn btn-light" id="finance-payable-refresh">Actualizar</button>
      </div>
    </div>
    <div class="npay-stats">
      <article class="npay-stat"><span>Total por pagar</span><strong id="finance-payable-pending">S/ 0.00</strong></article>
      <article class="npay-stat overdue"><span>Deuda vencida</span><strong id="finance-payable-overdue">S/ 0.00</strong></article>
      <article class="npay-stat upcoming"><span>Vence en 7 días</span><strong id="finance-payable-upcoming">S/ 0.00</strong></article>
      <article class="npay-stat count"><span>Obligaciones abiertas</span><strong id="finance-payable-count">0</strong></article>
    </div>
    <div class="npay-filters">
      <input id="finance-payable-search" placeholder="Buscar beneficiario, concepto o referencia">
      <select id="finance-payable-type"><option value="">Todos los beneficiarios</option>${BENEFICIARY_TYPES.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select>
      <select id="finance-payable-category"><option value="">Todas las categorías</option>${CATEGORIES.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select>
      <select id="finance-payable-status"><option value="">Todos los estados</option><option value="vencido">Vencidas</option><option value="proximo">Próximas a vencer</option><option value="pendiente">Pendientes</option><option value="parcial">Pago parcial</option><option value="pagada">Pagadas</option></select>
      <button type="button" class="btn btn-blue" id="finance-payable-clear">Limpiar</button>
    </div>
    <div class="msg" id="finance-payable-message"></div>
    <div class="table-wrap npay-table"><table><thead><tr><th>Beneficiario</th><th>Concepto</th><th>Vencimiento</th><th>Programado</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="finance-payable-rows"><tr><td colspan="8">Cargando cuentas por pagar...</td></tr></tbody></table></div>`;

  const receivables = document.getElementById('receivables-panel');
  const closeSection = document.getElementById('finance-close-section');
  const movementPanel = finance.querySelector('.nf-panel');
  if(receivables) receivables.insertAdjacentElement('afterend',section);
  else if(closeSection) closeSection.insertAdjacentElement('beforebegin',section);
  else if(movementPanel) movementPanel.insertAdjacentElement('beforebegin',section);
  else finance.appendChild(section);

  buildModals();
  bindEvents();
  ready = true;
  return true;
}

function buildModals(){
  if(!document.getElementById('finance-payable-new-back')){
    const modal = document.createElement('div');
    modal.id = 'finance-payable-new-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="finance-payable-new-title">
        <div class="nf-modal-head"><div><h2 id="finance-payable-new-title">Nueva obligación</h2><p>Registra lo que la empresa debe pagar y su fecha de vencimiento.</p></div><button type="button" class="btn btn-light" id="finance-payable-new-close">Cerrar</button></div>
        <form id="finance-payable-new-form">
          <div class="nf-form-grid">
            <label><span>Tipo de beneficiario</span><select id="finance-payable-new-type" required>${BENEFICIARY_TYPES.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Beneficiario</span><input id="finance-payable-new-beneficiary" minlength="2" maxlength="140" required placeholder="Nombre del docente, proveedor o acreedor"></label>
            <label><span>Categoría</span><select id="finance-payable-new-category" required>${CATEGORIES.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Fecha de vencimiento</span><input id="finance-payable-new-due" type="date" min="${CONTROL_START_DATE}" required></label>
            <label class="wide"><span>Concepto</span><input id="finance-payable-new-concept" minlength="3" maxlength="160" required placeholder="Ej. Honorarios semana 1, alquiler agosto o servicio de internet"></label>
            <label><span>Monto total (S/)</span><input id="finance-payable-new-amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="0.00"></label>
            <label><span>DNI / RUC / referencia</span><input id="finance-payable-new-reference" maxlength="80" placeholder="Opcional"></label>
            <label class="wide"><span>Observación</span><textarea id="finance-payable-new-note" maxlength="1000" rows="3" placeholder="Opcional"></textarea></label>
          </div>
          <div class="nf-form-note">La obligación no genera un egreso hasta que registres un pago. Se permiten pagos parciales.</div>
          <div class="msg" id="finance-payable-new-message"></div>
          <div class="nf-form-actions"><button type="submit" class="btn btn-primary" id="finance-payable-new-save">Guardar obligación</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }

  if(!document.getElementById('finance-payable-payment-back')){
    const modal = document.createElement('div');
    modal.id = 'finance-payable-payment-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="finance-payable-payment-title">
        <div class="nf-modal-head"><div><h2 id="finance-payable-payment-title">Registrar pago</h2><p id="finance-payable-payment-subtitle">El pago actualizará la obligación y creará el egreso financiero.</p></div><button type="button" class="btn btn-light" id="finance-payable-payment-close">Cerrar</button></div>
        <form id="finance-payable-payment-form">
          <div class="nf-form-grid">
            <label><span>Fecha de pago</span><input id="finance-payable-payment-date" type="date" min="${CONTROL_START_DATE}" required></label>
            <label><span>Monto a pagar (S/)</span><input id="finance-payable-payment-amount" type="number" min="0.01" max="1000000" step="0.01" required></label>
            <label><span>Método de pago</span><select id="finance-payable-payment-method" required>${METHODS.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Cuenta de salida</span><select id="finance-payable-payment-account" required>${ACCOUNTS.map(item => `<option value="${esc(item[0])}">${esc(item[1])}</option>`).join('')}</select></label>
            <label><span>Número de operación</span><input id="finance-payable-payment-operation" maxlength="100" placeholder="Opcional"></label>
            <label><span>Comprobante / recibo</span><input id="finance-payable-payment-receipt" maxlength="120" placeholder="N.° de recibo, factura o referencia"></label>
            <label class="wide"><span>Observación</span><textarea id="finance-payable-payment-note" maxlength="1000" rows="3" placeholder="Opcional"></textarea></label>
          </div>
          <div class="nf-form-note">La fecha debe estar abierta en Finanzas. Si el día ya fue cerrado, el pago será rechazado para proteger la conciliación.</div>
          <div class="msg" id="finance-payable-payment-message"></div>
          <div class="nf-form-actions"><button type="submit" class="btn btn-primary" id="finance-payable-payment-save">Registrar pago y egreso</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }

  if(!document.getElementById('finance-payable-history-back')){
    const modal = document.createElement('div');
    modal.id = 'finance-payable-history-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal nf-transfer-modal" role="dialog" aria-modal="true" aria-labelledby="finance-payable-history-title">
        <div class="nf-modal-head"><div><h2 id="finance-payable-history-title">Historial de pagos</h2><p id="finance-payable-history-subtitle"></p></div><button type="button" class="btn btn-light" id="finance-payable-history-close">Cerrar</button></div>
        <div class="npay-history"><table><thead><tr><th>Fecha</th><th>Monto</th><th>Cuenta</th><th>Operación</th><th>Comprobante</th><th>Registrado</th></tr></thead><tbody id="finance-payable-history-rows"></tbody></table></div>
      </div>`;
    document.body.appendChild(modal);
  }
}

function bindEvents(){
  document.getElementById('finance-payable-new')?.addEventListener('click',openNewModal);
  document.getElementById('finance-payable-refresh')?.addEventListener('click',loadData);
  document.getElementById('finance-payable-search')?.addEventListener('input',render);
  document.getElementById('finance-payable-type')?.addEventListener('change',render);
  document.getElementById('finance-payable-category')?.addEventListener('change',render);
  document.getElementById('finance-payable-status')?.addEventListener('change',render);
  document.getElementById('finance-payable-clear')?.addEventListener('click',clearFilters);
  document.getElementById('finance-payable-rows')?.addEventListener('click',event => {
    const pay = event.target.closest('[data-payable-pay]');
    if(pay) openPaymentModal(pay.dataset.payablePay);
    const history = event.target.closest('[data-payable-history]');
    if(history) openHistoryModal(history.dataset.payableHistory);
  });

  document.getElementById('finance-payable-new-close')?.addEventListener('click',closeNewModal);
  document.getElementById('finance-payable-new-back')?.addEventListener('click',event => {
    if(event.target.id === 'finance-payable-new-back') closeNewModal();
  });
  document.getElementById('finance-payable-new-form')?.addEventListener('submit',saveObligation);

  document.getElementById('finance-payable-payment-close')?.addEventListener('click',closePaymentModal);
  document.getElementById('finance-payable-payment-back')?.addEventListener('click',event => {
    if(event.target.id === 'finance-payable-payment-back') closePaymentModal();
  });
  document.getElementById('finance-payable-payment-form')?.addEventListener('submit',savePayment);

  document.getElementById('finance-payable-history-close')?.addEventListener('click',closeHistoryModal);
  document.getElementById('finance-payable-history-back')?.addEventListener('click',event => {
    if(event.target.id === 'finance-payable-history-back') closeHistoryModal();
  });
}

function clearFilters(){
  ['finance-payable-search','finance-payable-type','finance-payable-category','finance-payable-status'].forEach(id => {
    const element = document.getElementById(id);
    if(element) element.value = '';
  });
  render();
}

function derivedStatus(item){
  if(item.estado === 'pagada' || Number(item.saldoPendienteCentimos || 0) <= 0) return 'pagada';
  const today = localDate();
  const due = clean(item.fechaVencimiento);
  if(due && due < today) return 'vencido';
  if(due && due <= addDaysIso(today,7)) return 'proximo';
  if(item.estado === 'parcial' || Number(item.montoPagadoCentimos || 0) > 0) return 'parcial';
  return 'pendiente';
}

function statusLabel(status){
  return ({vencido:'Vencida',proximo:'Próxima a vencer',pendiente:'Pendiente',parcial:'Pago parcial',pagada:'Pagada'})[status] || status;
}

function filteredObligations(){
  const term = clean(document.getElementById('finance-payable-search')?.value).toLowerCase();
  const type = clean(document.getElementById('finance-payable-type')?.value);
  const category = clean(document.getElementById('finance-payable-category')?.value);
  const status = clean(document.getElementById('finance-payable-status')?.value);
  return obligations.filter(item => {
    const haystack = [item.beneficiario,item.concepto,item.numeroDocumento,item.observacion,mapLabel(CATEGORIES,item.categoria)].map(clean).join(' ').toLowerCase();
    return (!term || haystack.includes(term))
      && (!type || item.tipoBeneficiario === type)
      && (!category || item.categoria === category)
      && (!status || derivedStatus(item) === status);
  });
}

function renderSummary(){
  const today = localDate();
  const seven = addDaysIso(today,7);
  const open = obligations.filter(item => Number(item.saldoPendienteCentimos || 0) > 0 && item.estado !== 'pagada');
  const pending = open.reduce((sum,item) => sum + Number(item.saldoPendienteCentimos || 0),0);
  const overdue = open.filter(item => clean(item.fechaVencimiento) < today).reduce((sum,item) => sum + Number(item.saldoPendienteCentimos || 0),0);
  const upcoming = open.filter(item => {
    const due = clean(item.fechaVencimiento);
    return due >= today && due <= seven;
  }).reduce((sum,item) => sum + Number(item.saldoPendienteCentimos || 0),0);
  const set = (id,value) => { const element = document.getElementById(id); if(element) element.textContent = value; };
  set('finance-payable-pending',money(pending));
  set('finance-payable-overdue',money(overdue));
  set('finance-payable-upcoming',money(upcoming));
  set('finance-payable-count',String(open.length));
}

function render(){
  if(!ensurePanel()) return;
  renderSummary();
  const priority = {vencido:0,proximo:1,parcial:2,pendiente:3,pagada:4};
  const data = filteredObligations().sort((a,b) => {
    const sa = derivedStatus(a), sb = derivedStatus(b);
    return (priority[sa] ?? 9) - (priority[sb] ?? 9)
      || clean(a.fechaVencimiento).localeCompare(clean(b.fechaVencimiento))
      || clean(a.beneficiario).localeCompare(clean(b.beneficiario),'es');
  });
  const rows = document.getElementById('finance-payable-rows');
  if(!rows) return;
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="8" class="npay-empty">No hay obligaciones para los filtros seleccionados.</td></tr>';
    return;
  }
  rows.innerHTML = data.map(item => {
    const status = derivedStatus(item);
    const pending = Number(item.saldoPendienteCentimos || 0);
    const paid = Number(item.montoPagadoCentimos || 0);
    const relatedPayments = payments.filter(payment => payment.obligacionId === item.id && payment.estado === 'activo').length;
    return `<tr>
      <td><b>${esc(item.beneficiario)}</b><span class="npay-sub">${esc(mapLabel(BENEFICIARY_TYPES,item.tipoBeneficiario))}${item.numeroDocumento ? ` · ${esc(item.numeroDocumento)}` : ''}</span></td>
      <td><b>${esc(mapLabel(CATEGORIES,item.categoria))}</b><span class="npay-sub">${esc(item.concepto)}${item.observacion ? `<br>${esc(item.observacion)}` : ''}</span></td>
      <td><b>${esc(dateLabel(item.fechaVencimiento))}</b></td>
      <td><span class="npay-money">${esc(money(item.montoProgramadoCentimos))}</span></td>
      <td><span class="npay-money paid">${esc(money(paid))}</span><span class="npay-sub">${relatedPayments} pago${relatedPayments === 1 ? '' : 's'}</span></td>
      <td><span class="npay-money ${status === 'vencido' ? 'overdue' : 'pending'}">${esc(money(pending))}</span></td>
      <td><span class="npay-status ${status}">${esc(statusLabel(status))}</span></td>
      <td><div class="npay-row-actions"><button type="button" class="npay-action" data-payable-pay="${esc(item.id)}" ${pending <= 0 ? 'disabled' : ''}>Registrar pago</button><button type="button" class="npay-action secondary" data-payable-history="${esc(item.id)}">Ver pagos</button></div></td>
    </tr>`;
  }).join('');
}

function openNewModal(){
  if(!currentUser || busy) return;
  const form = document.getElementById('finance-payable-new-form');
  form?.reset();
  const due = document.getElementById('finance-payable-new-due');
  if(due) due.value = localDate();
  setMessage('finance-payable-new-message','info','Registra una obligación antes de realizar el pago.');
  document.getElementById('finance-payable-new-back')?.classList.add('show');
  setTimeout(() => document.getElementById('finance-payable-new-beneficiary')?.focus(),50);
}

function closeNewModal(){
  if(busy) return;
  document.getElementById('finance-payable-new-back')?.classList.remove('show');
}

async function saveObligation(event){
  event.preventDefault();
  if(busy || !currentUser) return;
  const type = clean(document.getElementById('finance-payable-new-type')?.value);
  const beneficiary = clean(document.getElementById('finance-payable-new-beneficiary')?.value);
  const category = clean(document.getElementById('finance-payable-new-category')?.value);
  const due = clean(document.getElementById('finance-payable-new-due')?.value);
  const concept = clean(document.getElementById('finance-payable-new-concept')?.value);
  const amount = cents(document.getElementById('finance-payable-new-amount')?.value);
  const reference = clean(document.getElementById('finance-payable-new-reference')?.value);
  const note = clean(document.getElementById('finance-payable-new-note')?.value);

  if(!BENEFICIARY_TYPES.some(item => item[0] === type)) return setMessage('finance-payable-new-message','err','Selecciona un tipo de beneficiario válido.');
  if(beneficiary.length < 2 || beneficiary.length > 140) return setMessage('finance-payable-new-message','err','Escribe un beneficiario válido.');
  if(!CATEGORIES.some(item => item[0] === category)) return setMessage('finance-payable-new-message','err','Selecciona una categoría válida.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(due) || due < CONTROL_START_DATE) return setMessage('finance-payable-new-message','err','La fecha de vencimiento debe ser desde el 1 de agosto de 2026.');
  if(concept.length < 3 || concept.length > 160) return setMessage('finance-payable-new-message','err','El concepto debe tener entre 3 y 160 caracteres.');
  if(amount <= 0 || amount > 100000000) return setMessage('finance-payable-new-message','err','Ingresa un monto válido.');

  const ref = doc(collection(db,OBLIGATION_COLLECTION));
  const button = document.getElementById('finance-payable-new-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando...'; }
    setMessage('finance-payable-new-message','info','Guardando obligación...');
    await setDoc(ref,{
      obligacionId:ref.id,
      beneficiario:beneficiary,
      tipoBeneficiario:type,
      categoria:category,
      concepto:concept,
      numeroDocumento:reference,
      montoProgramadoCentimos:amount,
      montoPagadoCentimos:0,
      saldoPendienteCentimos:amount,
      fechaVencimiento:due,
      estado:'pendiente',
      observacion:note,
      origen:'cuenta_por_pagar_admin',
      creadoPor:clean(currentUser.email || ADMIN_EMAIL),
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    setMessage('finance-payable-new-message','ok','Obligación registrada correctamente.');
    await loadData();
    setTimeout(closeNewModal,450);
  }catch(error){
    console.error('No se pudo crear la obligación.',error);
    setMessage('finance-payable-new-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó el registro. Publica las nuevas reglas de la Etapa 9.'
      : 'No se pudo guardar la obligación. Inténtalo nuevamente.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Guardar obligación'; }
  }
}

function selectedObligation(){
  return obligations.find(item => item.id === selectedObligationId) || null;
}

function openPaymentModal(id){
  if(!currentUser || busy) return;
  const obligation = obligations.find(item => item.id === id);
  if(!obligation || Number(obligation.saldoPendienteCentimos || 0) <= 0) return;
  selectedObligationId = id;
  document.getElementById('finance-payable-payment-form')?.reset();
  const date = document.getElementById('finance-payable-payment-date');
  const amount = document.getElementById('finance-payable-payment-amount');
  const subtitle = document.getElementById('finance-payable-payment-subtitle');
  if(date) date.value = localDate();
  if(amount){
    amount.max = (Number(obligation.saldoPendienteCentimos || 0) / 100).toFixed(2);
    amount.value = (Number(obligation.saldoPendienteCentimos || 0) / 100).toFixed(2);
  }
  if(subtitle) subtitle.textContent = `${obligation.beneficiario} · ${obligation.concepto} · saldo ${money(obligation.saldoPendienteCentimos)}`;
  setMessage('finance-payable-payment-message','info','Revisa fecha, monto y cuenta antes de confirmar.');
  document.getElementById('finance-payable-payment-back')?.classList.add('show');
}

function closePaymentModal(){
  if(busy) return;
  selectedObligationId = '';
  document.getElementById('finance-payable-payment-back')?.classList.remove('show');
}

async function savePayment(event){
  event.preventDefault();
  if(busy || !currentUser) return;
  const obligation = selectedObligation();
  if(!obligation) return setMessage('finance-payable-payment-message','err','No se encontró la obligación seleccionada.');

  const date = clean(document.getElementById('finance-payable-payment-date')?.value);
  const amount = cents(document.getElementById('finance-payable-payment-amount')?.value);
  const method = clean(document.getElementById('finance-payable-payment-method')?.value);
  const account = clean(document.getElementById('finance-payable-payment-account')?.value);
  const operation = clean(document.getElementById('finance-payable-payment-operation')?.value);
  const receipt = clean(document.getElementById('finance-payable-payment-receipt')?.value);
  const note = clean(document.getElementById('finance-payable-payment-note')?.value);
  const currentPaid = Number(obligation.montoPagadoCentimos || 0);
  const currentPending = Number(obligation.saldoPendienteCentimos || 0);

  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < CONTROL_START_DATE || date > localDate()) return setMessage('finance-payable-payment-message','err','La fecha de pago debe estar entre el 1 de agosto de 2026 y hoy.');
  if(amount <= 0 || amount > currentPending) return setMessage('finance-payable-payment-message','err','El monto debe ser mayor a cero y no superar el saldo pendiente.');
  if(!METHODS.some(item => item[0] === method)) return setMessage('finance-payable-payment-message','err','Selecciona un método de pago válido.');
  if(!ACCOUNTS.some(item => item[0] === account)) return setMessage('finance-payable-payment-message','err','Selecciona una cuenta válida.');

  const paymentId = uid();
  const movementId = `pago_obligacion_${paymentId}`;
  const newPaid = currentPaid + amount;
  const newPending = Number(obligation.montoProgramadoCentimos || 0) - newPaid;
  const newState = newPending === 0 ? 'pagada' : 'parcial';
  const email = clean(currentUser.email || ADMIN_EMAIL);
  const batch = writeBatch(db);
  const obligationRef = doc(db,OBLIGATION_COLLECTION,obligation.id);
  const paymentRef = doc(db,PAYMENT_COLLECTION,paymentId);
  const movementRef = doc(db,MOVEMENT_COLLECTION,movementId);

  batch.update(obligationRef,{
    montoPagadoCentimos:newPaid,
    saldoPendienteCentimos:newPending,
    estado:newState,
    ultimoPagoId:paymentId,
    ultimoPagoAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });
  batch.set(paymentRef,{
    pagoObligacionId:paymentId,
    obligacionId:obligation.id,
    beneficiario:obligation.beneficiario,
    tipoBeneficiario:obligation.tipoBeneficiario,
    categoria:obligation.categoria,
    concepto:obligation.concepto,
    montoCentimos:amount,
    fechaPago:date,
    metodoPago:method,
    cuenta:account,
    numeroOperacion:operation,
    comprobanteReferencia:receipt,
    observacion:note,
    movimientoFinancieroId:movementId,
    estado:'activo',
    origen:'pago_obligacion_admin',
    registradoPor:email,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });
  batch.set(movementRef,{
    tipo:'egreso',
    fechaOperacion:date,
    categoria:obligation.categoria,
    concepto:`Pago a ${clean(obligation.beneficiario).slice(0,145)}`,
    monto:amount / 100,
    metodoPago:method,
    cuenta:account,
    numeroOperacion:operation,
    observacion:note,
    estado:'activo',
    origen:'pago_obligacion_admin',
    creadoPor:email,
    pagoId:movementId,
    obligacionId:obligation.id,
    pagoObligacionId:paymentId,
    beneficiario:obligation.beneficiario,
    tipoBeneficiario:obligation.tipoBeneficiario,
    conceptoObligacion:obligation.concepto,
    comprobanteReferencia:receipt,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });

  const button = document.getElementById('finance-payable-payment-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Registrando...'; }
    setMessage('finance-payable-payment-message','info','Registrando pago y egreso financiero...');
    await batch.commit();
    setMessage('finance-payable-payment-message','ok',newPending === 0
      ? 'Pago registrado. La obligación quedó totalmente pagada.'
      : `Pago registrado. Saldo pendiente: ${money(newPending)}.`);
    await loadData();
    document.getElementById('finance-refresh')?.click();
    setTimeout(closePaymentModal,600);
  }catch(error){
    console.error('No se pudo registrar el pago de la obligación.',error);
    setMessage('finance-payable-payment-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó el pago. Verifica que las reglas de la Etapa 9 estén publicadas y que la fecha no esté cerrada.'
      : 'No se pudo registrar el pago. Ningún cambio parcial fue guardado.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Registrar pago y egreso'; }
  }
}

function openHistoryModal(id){
  const obligation = obligations.find(item => item.id === id);
  if(!obligation) return;
  const data = payments.filter(item => item.obligacionId === id).sort((a,b) => clean(b.fechaPago).localeCompare(clean(a.fechaPago)));
  const subtitle = document.getElementById('finance-payable-history-subtitle');
  const rows = document.getElementById('finance-payable-history-rows');
  if(subtitle) subtitle.textContent = `${obligation.beneficiario} · ${obligation.concepto}`;
  if(rows){
    rows.innerHTML = data.length ? data.map(item => `<tr>
      <td>${esc(dateLabel(item.fechaPago))}</td>
      <td><b>${esc(money(item.montoCentimos))}</b></td>
      <td>${esc(mapLabel(ACCOUNTS,item.cuenta))}<span class="npay-sub">${esc(mapLabel(METHODS,item.metodoPago))}</span></td>
      <td>${esc(item.numeroOperacion || '-')}</td>
      <td>${esc(item.comprobanteReferencia || '-')}</td>
      <td>${esc(timestampLabel(item.createdAt))}<span class="npay-sub">${esc(item.registradoPor || '-')}</span></td>
    </tr>`).join('') : '<tr><td colspan="6" class="npay-empty">Esta obligación todavía no tiene pagos registrados.</td></tr>';
  }
  document.getElementById('finance-payable-history-back')?.classList.add('show');
}

function closeHistoryModal(){
  document.getElementById('finance-payable-history-back')?.classList.remove('show');
}

async function loadData(){
  if(!currentUser || !ensurePanel()) return;
  const rows = document.getElementById('finance-payable-rows');
  if(rows) rows.innerHTML = '<tr><td colspan="8">Cargando cuentas por pagar...</td></tr>';
  setMessage('finance-payable-message','info','Actualizando obligaciones y pagos...');
  try{
    const [obligationSnapshot,paymentSnapshot] = await Promise.all([
      getDocs(query(collection(db,OBLIGATION_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS))),
      getDocs(query(collection(db,PAYMENT_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS)))
    ]);
    obligations = obligationSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    payments = paymentSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    render();
    setMessage('finance-payable-message','ok',obligations.length
      ? `Cuentas por pagar actualizadas: ${obligations.length} obligaciones y ${payments.length} pagos registrados.`
      : 'Todavía no existen obligaciones registradas.');
  }catch(error){
    console.error('No se pudieron cargar las cuentas por pagar.',error);
    obligations = [];
    payments = [];
    render();
    setMessage('finance-payable-message','err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite leer Cuentas por pagar. Publica las reglas de la Etapa 9.'
      : 'No se pudieron actualizar las cuentas por pagar.');
  }
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(ensurePanel()){
      window.clearInterval(timer);
      if(currentUser) loadData();
    }else if(attempts > 80){
      window.clearInterval(timer);
      console.warn('No se encontró el panel financiero para Cuentas por pagar.');
    }
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser){
    initialize();
    if(ready) loadData();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
