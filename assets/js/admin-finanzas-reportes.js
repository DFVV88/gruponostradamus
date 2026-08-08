/* ==================================================
   Grupo Nostradamus - Reportes financieros
   Etapa 10: resumen mensual, comparación y vista gerencial.
   Solo lectura: no modifica movimientos, cuotas ni obligaciones.
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
const CONTROL_START_DATE = '2026-08-01';
const MOVEMENTS_COLLECTION = 'finanzas_movimientos';
const INSTALLMENTS_COLLECTION = 'alumno_cuotas';
const OBLIGATIONS_COLLECTION = 'finanzas_obligaciones';
const CLOSURES_COLLECTION = 'finanzas_cierres';
const MAX_RECORDS = 5000;

const ACCOUNTS = [
  ['caja_efectivo','Caja en efectivo'],
  ['yape','Yape'],
  ['plin','Plin'],
  ['bcp','Cuenta BCP'],
  ['culqi','Pasarela Culqi'],
  ['otra','Otra cuenta']
];

const CATEGORY_LABELS = {
  matricula:'Matrículas',
  pension:'Pensiones',
  materiales:'Materiales e impresiones',
  simulacro:'Simulacros',
  otros_ingresos:'Otros ingresos',
  docentes:'Pago a docentes',
  personal_administrativo:'Personal administrativo',
  alquiler:'Alquiler',
  servicios:'Servicios',
  publicidad:'Publicidad',
  mantenimiento:'Mantenimiento',
  deudas:'Pago de deudas',
  otros_egresos:'Otros egresos',
  transferencia_interna:'Transferencia interna'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let movements = [];
let installments = [];
let obligations = [];
let closures = [];
let loading = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'\"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'
}[char]));
const num = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format(num(value));
const moneyCents = value => money(num(value) / 100);
const categoryLabel = value => CATEGORY_LABELS[value] || clean(value) || 'Sin categoría';
const accountLabel = value => ACCOUNTS.find(item => item[0] === value)?.[1] || clean(value) || 'Otra cuenta';

function localDate(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function currentMonth(){
  return localDate().slice(0,7);
}

function validMonth(value){
  return /^\d{4}-\d{2}$/.test(value) && value >= '2026-08' && value <= currentMonth();
}

function monthBounds(value){
  if(!validMonth(value)) value = currentMonth();
  const [year,month] = value.split('-').map(Number);
  const lastDay = new Date(year,month,0).getDate();
  return {
    month:value,
    start:`${value}-01`,
    end:`${value}-${String(lastDay).padStart(2,'0')}`,
    days:lastDay
  };
}

function previousMonth(value){
  const [year,month] = value.split('-').map(Number);
  const date = new Date(year,month-2,1);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}

function monthLabel(value){
  const [year,month] = value.split('-').map(Number);
  const date = new Date(year,month-1,1);
  return date.toLocaleDateString('es-PE',{month:'long',year:'numeric'}).replace(/^./,char => char.toUpperCase());
}

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}

function isActive(item){
  return clean(item?.estado || 'activo') === 'activo';
}

function isTransfer(item){
  return clean(item?.categoria) === 'transferencia_interna';
}

function inMonth(item,month){
  return clean(item?.fechaOperacion).slice(0,7) === month;
}

function businessMovements(month){
  return movements.filter(item => isActive(item) && inMonth(item,month) && !isTransfer(item));
}

function accountMovements(month){
  return movements.filter(item => isActive(item) && inMonth(item,month));
}

function accumulatedMovements(monthEnd){
  return movements.filter(item => {
    const date = clean(item.fechaOperacion);
    return isActive(item) && date >= CONTROL_START_DATE && date <= monthEnd;
  });
}

function sumByType(data,type){
  return data.filter(item => item.tipo === type).reduce((sum,item) => sum + num(item.monto),0);
}

function reportTotals(month){
  const data = businessMovements(month);
  const income = sumByType(data,'ingreso');
  const expense = sumByType(data,'egreso');
  return {income,expense,result:income-expense,operations:data.length};
}

function percentChange(current,previous){
  if(Math.abs(previous) < .005){
    if(Math.abs(current) < .005) return {text:'Sin variación',value:0,hasBase:true};
    return {text:'Sin base previa',value:null,hasBase:false};
  }
  const value = ((current-previous) / Math.abs(previous)) * 100;
  const prefix = value > 0 ? '+' : '';
  return {text:`${prefix}${value.toFixed(1)} %`,value,hasBase:true};
}

function setMessage(type,text){
  const element = document.getElementById('finance-report-message');
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('finance-report-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-report-styles';
  style.textContent = `
    .nrep-section{margin:18px 0;padding:19px;border:1px solid rgba(7,140,149,.16);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .nrep-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px}.nrep-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:31px;line-height:1}.nrep-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.5}.nrep-controls{display:flex;align-items:end;gap:8px;flex-wrap:wrap}.nrep-controls label span{display:block;margin-bottom:4px;color:#061426;font-size:9px;font-weight:950;text-transform:uppercase}.nrep-controls input{border:1px solid #dce9ed;border-radius:12px;padding:9px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:12px}.nrep-controls .btn{margin:0;padding:9px 13px;font-size:10px;white-space:nowrap}
    .nrep-titlebar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:3px 0 10px}.nrep-titlebar strong{color:#061426;font-family:'Baloo 2';font-size:21px}.nrep-titlebar small{color:#71808c;font-size:9px;font-weight:850}
    .nrep-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:10px}.nrep-kpi{padding:14px;border:1px solid #e1ecef;border-radius:16px;background:#fbfdfe}.nrep-kpi span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.nrep-kpi strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:25px;line-height:1}.nrep-kpi.income strong{color:#14855a}.nrep-kpi.expense strong{color:#c73931}.nrep-kpi.result.positive strong{color:#14855a}.nrep-kpi.result.negative strong{color:#c73931}.nrep-kpi small{display:block;margin-top:5px;color:#71808c;font-size:9px;line-height:1.35}
    .nrep-compare{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}.nrep-compare article{padding:10px 12px;border:1px solid #e1ecef;border-radius:14px;background:#fff}.nrep-compare span{display:block;color:#71808c;font-size:8px;font-weight:950;text-transform:uppercase}.nrep-compare strong{display:block;margin-top:3px;color:#061426;font-size:13px}.nrep-compare small{display:block;margin-top:3px;color:#647482;font-size:9px}.nrep-change.up{color:#14855a!important}.nrep-change.down{color:#c73931!important}
    .nrep-manager{display:grid;grid-template-columns:1.35fr .85fr;gap:10px;margin-bottom:12px}.nrep-card{border:1px solid #dce9ed;border-radius:17px;background:#fbfdfe;padding:14px}.nrep-card h4{margin:0 0 10px;color:#061426;font-family:'Baloo 2';font-size:20px}.nrep-position{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.nrep-position div{padding:10px;border-radius:12px;background:#fff;border:1px solid #e5eef0}.nrep-position span{display:block;color:#71808c;font-size:8px;font-weight:950;text-transform:uppercase}.nrep-position strong{display:block;margin-top:4px;color:#061426;font-size:14px}.nrep-position .warn strong{color:#b42318}.nrep-position .good strong{color:#14855a}.nrep-footnote{margin:9px 0 0;color:#7d8992;font-size:9px;line-height:1.45}.nrep-reconcile{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nrep-reconcile div{padding:10px;border-radius:12px;background:#fff;border:1px solid #e5eef0}.nrep-reconcile span{display:block;color:#71808c;font-size:8px;font-weight:950;text-transform:uppercase}.nrep-reconcile strong{display:block;margin-top:4px;color:#061426;font-size:14px}
    .nrep-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.nrep-panel{border:1px solid #dce9ed;border-radius:17px;background:#fff;padding:14px}.nrep-panel h4{margin:0 0 10px;color:#061426;font-family:'Baloo 2';font-size:20px}.nrep-bar-row{display:grid;grid-template-columns:minmax(120px,1.2fr) 2fr auto;gap:8px;align-items:center;margin:8px 0}.nrep-bar-label{color:#526170;font-size:10px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nrep-bar-track{height:8px;border-radius:999px;background:#eef3f5;overflow:hidden}.nrep-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#078c95,#14a9af)}.nrep-bar-row.expense .nrep-bar-fill{background:linear-gradient(90deg,#d92d20,#f06b5e)}.nrep-bar-value{color:#061426;font-size:10px;font-weight:950;white-space:nowrap}.nrep-empty{padding:14px;text-align:center;color:#71808c;font-size:10px}
    .nrep-account-table table{min-width:720px}.nrep-account-table th{font-size:9px}.nrep-account-table td{font-size:10px}.nrep-account-table td b{white-space:nowrap}.nrep-pos{color:#14855a;font-weight:950}.nrep-neg{color:#c73931;font-weight:950}
    .nrep-chart-wrap{overflow:auto;padding-bottom:3px}.nrep-day-chart{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(22px,1fr);gap:3px;min-width:760px;height:150px;align-items:end;border-bottom:1px solid #dce9ed;padding:8px 4px 20px}.nrep-day{height:120px;display:grid;grid-template-rows:1fr 16px;align-items:end;position:relative}.nrep-day-bars{height:100px;display:flex;align-items:end;justify-content:center;gap:2px}.nrep-day-bar{width:7px;min-height:1px;border-radius:4px 4px 1px 1px;background:#14855a}.nrep-day-bar.expense{background:#d92d20}.nrep-day label{text-align:center;color:#87939d;font-size:7px;font-weight:850}.nrep-chart-legend{display:flex;gap:14px;margin-top:8px;color:#647482;font-size:9px}.nrep-dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:4px;background:#14855a}.nrep-dot.expense{background:#d92d20}
    @media(max-width:980px){.nrep-manager,.nrep-grid{grid-template-columns:1fr}.nrep-position{grid-template-columns:1fr 1fr}}
    @media(max-width:720px){.nrep-head{display:block}.nrep-controls{display:grid;grid-template-columns:1fr 1fr;margin-top:10px}.nrep-controls label,.nrep-controls input,.nrep-controls .btn{width:100%}.nrep-kpis{grid-template-columns:1fr 1fr}.nrep-compare{grid-template-columns:1fr}.nrep-position{grid-template-columns:1fr 1fr}.nrep-kpi strong{font-size:22px}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  if(document.getElementById('finance-reports-section')) return true;
  const finance = document.getElementById('nostra-finance-panel');
  if(!finance) return false;
  injectStyles();

  const section = document.createElement('section');
  section.id = 'finance-reports-section';
  section.className = 'nrep-section';
  section.innerHTML = `
    <div class="nrep-head">
      <div><h3>Reportes financieros</h3><p>Resumen mensual y gerencial de ingresos, egresos, resultado, cuentas, cobranza, obligaciones y cierres. Las transferencias internas no inflan el resultado del negocio.</p></div>
      <div class="nrep-controls">
        <label><span>Mes del reporte</span><input id="finance-report-month" type="month" min="2026-08"></label>
        <button type="button" class="btn btn-light" id="finance-report-refresh">Actualizar reporte</button>
      </div>
    </div>
    <div class="msg" id="finance-report-message"></div>
    <div class="nrep-titlebar"><strong id="finance-report-title">Reporte mensual</strong><small>Control financiero desde 01/08/2026</small></div>
    <div class="nrep-kpis">
      <article class="nrep-kpi income"><span>Ingresos del mes</span><strong id="finance-report-income">S/ 0.00</strong><small id="finance-report-income-note">0 operaciones</small></article>
      <article class="nrep-kpi expense"><span>Egresos del mes</span><strong id="finance-report-expense">S/ 0.00</strong><small id="finance-report-expense-note">0 operaciones</small></article>
      <article class="nrep-kpi result" id="finance-report-result-card"><span>Resultado operativo</span><strong id="finance-report-result">S/ 0.00</strong><small>Ingresos menos egresos del mes</small></article>
      <article class="nrep-kpi"><span>Operaciones del negocio</span><strong id="finance-report-operations">0</strong><small>Transferencias internas excluidas</small></article>
    </div>
    <div class="nrep-compare" id="finance-report-comparison"></div>
    <div class="nrep-manager">
      <article class="nrep-card">
        <h4>Resumen gerencial</h4>
        <div class="nrep-position">
          <div><span>Saldo acumulado al corte</span><strong id="finance-report-balance">S/ 0.00</strong></div>
          <div class="good"><span>Por cobrar actual</span><strong id="finance-report-receivable">S/ 0.00</strong></div>
          <div class="warn"><span>Por pagar actual</span><strong id="finance-report-payable">S/ 0.00</strong></div>
          <div><span>Posición operativa referencial</span><strong id="finance-report-position">S/ 0.00</strong></div>
        </div>
        <p class="nrep-footnote" id="finance-report-position-note">La posición referencial suma saldo financiero + cuentas por cobrar - cuentas por pagar. No reemplaza la utilidad contable ni tributaria.</p>
      </article>
      <article class="nrep-card">
        <h4>Conciliación del mes</h4>
        <div class="nrep-reconcile">
          <div><span>Cierres realizados</span><strong id="finance-report-closures">0</strong></div>
          <div><span>Último cierre</span><strong id="finance-report-last-close">-</strong></div>
          <div><span>Diferencia último cierre</span><strong id="finance-report-close-diff">S/ 0.00</strong></div>
          <div><span>Estado</span><strong id="finance-report-close-state">Sin cierres</strong></div>
        </div>
      </article>
    </div>
    <div class="nrep-grid">
      <article class="nrep-panel"><h4>Ingresos por categoría</h4><div id="finance-report-income-categories"></div></article>
      <article class="nrep-panel"><h4>Egresos por categoría</h4><div id="finance-report-expense-categories"></div></article>
    </div>
    <article class="nrep-panel" style="margin-bottom:10px"><h4>Movimiento por cuenta</h4><div class="table-wrap nrep-account-table"><table><thead><tr><th>Cuenta</th><th>Entradas</th><th>Salidas</th><th>Neto del mes</th><th>Operaciones</th></tr></thead><tbody id="finance-report-account-rows"></tbody></table></div></article>
    <article class="nrep-panel"><h4>Flujo diario del mes</h4><div class="nrep-chart-wrap"><div class="nrep-day-chart" id="finance-report-daily-chart"></div></div><div class="nrep-chart-legend"><span><i class="nrep-dot"></i>Ingresos</span><span><i class="nrep-dot expense"></i>Egresos</span></div></article>`;

  const monthInput = section.querySelector('#finance-report-month');
  if(monthInput){
    monthInput.max = currentMonth();
    monthInput.value = currentMonth();
  }

  const payables = document.getElementById('finance-payables-section');
  const payablesAccordion = document.getElementById('finance-accordion-payables');
  const receivables = document.getElementById('receivables-panel');
  const receivablesAccordion = document.getElementById('finance-accordion-receivables');
  const closeSection = document.getElementById('finance-close-section');

  if(payables?.parentElement === finance) payables.insertAdjacentElement('afterend',section);
  else if(payablesAccordion?.parentElement === finance) payablesAccordion.insertAdjacentElement('afterend',section);
  else if(receivables?.parentElement === finance) receivables.insertAdjacentElement('afterend',section);
  else if(receivablesAccordion?.parentElement === finance) receivablesAccordion.insertAdjacentElement('afterend',section);
  else if(closeSection?.parentElement === finance) closeSection.insertAdjacentElement('beforebegin',section);
  else finance.appendChild(section);

  bindEvents();
  ready = true;
  return true;
}

function selectedMonth(){
  const input = document.getElementById('finance-report-month');
  const value = clean(input?.value);
  return validMonth(value) ? value : currentMonth();
}

function categorySummary(data,type){
  const map = new Map();
  data.filter(item => item.tipo === type).forEach(item => {
    const key = clean(item.categoria) || 'sin_categoria';
    map.set(key,(map.get(key) || 0) + num(item.monto));
  });
  return Array.from(map.entries()).map(([key,value]) => ({key,label:categoryLabel(key),value})).sort((a,b) => b.value-a.value);
}

function renderCategoryBars(containerId,data,type){
  const container = document.getElementById(containerId);
  if(!container) return;
  const rows = categorySummary(data,type);
  if(!rows.length){
    container.innerHTML = '<div class="nrep-empty">No existen movimientos en esta categoría durante el mes.</div>';
    return;
  }
  const max = Math.max(...rows.map(item => item.value),1);
  container.innerHTML = rows.map(item => {
    const width = Math.max(2,(item.value/max)*100);
    return `<div class="nrep-bar-row ${type === 'egreso' ? 'expense' : ''}"><span class="nrep-bar-label" title="${esc(item.label)}">${esc(item.label)}</span><span class="nrep-bar-track"><span class="nrep-bar-fill" style="width:${width.toFixed(2)}%"></span></span><span class="nrep-bar-value">${esc(money(item.value))}</span></div>`;
  }).join('');
}

function renderAccounts(month){
  const data = accountMovements(month);
  const rows = document.getElementById('finance-report-account-rows');
  if(!rows) return;
  rows.innerHTML = ACCOUNTS.map(([id,label]) => {
    const accountData = data.filter(item => clean(item.cuenta) === id);
    const incoming = sumByType(accountData,'ingreso');
    const outgoing = sumByType(accountData,'egreso');
    const net = incoming-outgoing;
    return `<tr><td><b>${esc(label)}</b></td><td class="nrep-pos">${esc(money(incoming))}</td><td class="nrep-neg">${esc(money(outgoing))}</td><td class="${net < 0 ? 'nrep-neg' : net > 0 ? 'nrep-pos' : ''}"><b>${esc(money(net))}</b></td><td>${accountData.length}</td></tr>`;
  }).join('');
}

function renderDailyChart(month){
  const bounds = monthBounds(month);
  const data = businessMovements(month);
  const cutDay = month === currentMonth() ? Number(localDate().slice(8,10)) : bounds.days;
  const daily = Array.from({length:cutDay},(_,index) => ({day:index+1,income:0,expense:0}));
  data.forEach(item => {
    const day = Number(clean(item.fechaOperacion).slice(8,10));
    const target = daily[day-1];
    if(!target) return;
    if(item.tipo === 'ingreso') target.income += num(item.monto);
    else if(item.tipo === 'egreso') target.expense += num(item.monto);
  });
  const max = Math.max(...daily.flatMap(item => [item.income,item.expense]),1);
  const chart = document.getElementById('finance-report-daily-chart');
  if(!chart) return;
  chart.innerHTML = daily.map(item => {
    const incomeHeight = item.income > 0 ? Math.max(2,(item.income/max)*96) : 1;
    const expenseHeight = item.expense > 0 ? Math.max(2,(item.expense/max)*96) : 1;
    return `<div class="nrep-day" title="Día ${item.day}: ingresos ${esc(money(item.income))}, egresos ${esc(money(item.expense))}"><div class="nrep-day-bars"><i class="nrep-day-bar" style="height:${incomeHeight.toFixed(1)}px"></i><i class="nrep-day-bar expense" style="height:${expenseHeight.toFixed(1)}px"></i></div><label>${item.day}</label></div>`;
  }).join('');
}

function currentPortfolio(){
  const today = localDate();
  let receivable = 0;
  let receivableOverdue = 0;
  installments.forEach(item => {
    const state = clean(item.estado || 'pendiente');
    if(state === 'anulada') return;
    const pending = Math.max(0,num(item.saldoPendienteCentimos));
    if(pending <= 0) return;
    receivable += pending;
    const due = clean(item.fechaVencimiento);
    if(/^\d{4}-\d{2}-\d{2}$/.test(due) && due < today) receivableOverdue += pending;
  });

  let payable = 0;
  let payableOverdue = 0;
  obligations.forEach(item => {
    const pending = Math.max(0,num(item.saldoPendienteCentimos));
    if(pending <= 0 || clean(item.estado) === 'pagada') return;
    payable += pending;
    const due = clean(item.fechaVencimiento);
    if(/^\d{4}-\d{2}-\d{2}$/.test(due) && due < today) payableOverdue += pending;
  });
  return {receivable,receivableOverdue,payable,payableOverdue};
}

function renderComparison(month,current){
  const previous = previousMonth(month);
  const previousTotals = previous < '2026-08' ? {income:0,expense:0,result:0,operations:0} : reportTotals(previous);
  const incomeChange = percentChange(current.income,previousTotals.income);
  const expenseChange = percentChange(current.expense,previousTotals.expense);
  const resultChange = percentChange(current.result,previousTotals.result);
  const container = document.getElementById('finance-report-comparison');
  if(!container) return;

  const changeClass = change => change.value == null || change.value === 0 ? '' : change.value > 0 ? 'up' : 'down';
  container.innerHTML = `
    <article><span>Ingresos vs ${esc(monthLabel(previous))}</span><strong>${esc(money(previousTotals.income))} → ${esc(money(current.income))}</strong><small class="nrep-change ${changeClass(incomeChange)}">${esc(incomeChange.text)}</small></article>
    <article><span>Egresos vs ${esc(monthLabel(previous))}</span><strong>${esc(money(previousTotals.expense))} → ${esc(money(current.expense))}</strong><small class="nrep-change ${changeClass(expenseChange)}">${esc(expenseChange.text)}</small></article>
    <article><span>Resultado vs ${esc(monthLabel(previous))}</span><strong>${esc(money(previousTotals.result))} → ${esc(money(current.result))}</strong><small class="nrep-change ${changeClass(resultChange)}">${esc(resultChange.text)}</small></article>`;
}

function renderClosures(month){
  const data = closures.filter(item => clean(item.fechaCierre).slice(0,7) === month).sort((a,b) => clean(a.fechaCierre).localeCompare(clean(b.fechaCierre)));
  const last = data[data.length-1] || null;
  const count = document.getElementById('finance-report-closures');
  const lastNode = document.getElementById('finance-report-last-close');
  const diffNode = document.getElementById('finance-report-close-diff');
  const stateNode = document.getElementById('finance-report-close-state');
  if(count) count.textContent = String(data.length);
  if(lastNode) lastNode.textContent = last ? dateLabel(last.fechaCierre) : '-';
  const diff = last ? num(last.diferenciaTotalCentimos) / 100 : 0;
  if(diffNode){
    diffNode.textContent = money(diff);
    diffNode.className = diff === 0 ? 'nrep-pos' : 'nrep-neg';
  }
  if(stateNode){
    stateNode.textContent = !last ? 'Sin cierres' : diff === 0 ? 'Conciliado' : 'Con diferencia';
    stateNode.className = !last ? '' : diff === 0 ? 'nrep-pos' : 'nrep-neg';
  }
}

function render(){
  if(!ensurePanel()) return;
  const month = selectedMonth();
  const bounds = monthBounds(month);
  const totals = reportTotals(month);
  const data = businessMovements(month);
  const portfolio = currentPortfolio();
  const accumulated = accumulatedMovements(bounds.end);
  const accumulatedBalance = sumByType(accumulated,'ingreso') - sumByType(accumulated,'egreso');
  const position = accumulatedBalance + portfolio.receivable/100 - portfolio.payable/100;
  const incomeCount = data.filter(item => item.tipo === 'ingreso').length;
  const expenseCount = data.filter(item => item.tipo === 'egreso').length;

  const set = (id,value) => { const node = document.getElementById(id); if(node) node.textContent = value; };
  set('finance-report-title',monthLabel(month));
  set('finance-report-income',money(totals.income));
  set('finance-report-expense',money(totals.expense));
  set('finance-report-result',money(totals.result));
  set('finance-report-operations',String(totals.operations));
  set('finance-report-income-note',`${incomeCount} ingreso${incomeCount === 1 ? '' : 's'} registrado${incomeCount === 1 ? '' : 's'}`);
  set('finance-report-expense-note',`${expenseCount} egreso${expenseCount === 1 ? '' : 's'} registrado${expenseCount === 1 ? '' : 's'}`);
  set('finance-report-balance',money(accumulatedBalance));
  set('finance-report-receivable',moneyCents(portfolio.receivable));
  set('finance-report-payable',moneyCents(portfolio.payable));
  set('finance-report-position',money(position));
  set('finance-report-position-note',`Cartera actual: ${moneyCents(portfolio.receivableOverdue)} vencido por cobrar y ${moneyCents(portfolio.payableOverdue)} vencido por pagar. La posición referencial no reemplaza la utilidad contable ni tributaria.`);

  const resultCard = document.getElementById('finance-report-result-card');
  resultCard?.classList.toggle('positive',totals.result > 0);
  resultCard?.classList.toggle('negative',totals.result < 0);

  renderComparison(month,totals);
  renderCategoryBars('finance-report-income-categories',data,'ingreso');
  renderCategoryBars('finance-report-expense-categories',data,'egreso');
  renderAccounts(month);
  renderDailyChart(month);
  renderClosures(month);
}

function bindEvents(){
  document.getElementById('finance-report-month')?.addEventListener('change',render);
  document.getElementById('finance-report-refresh')?.addEventListener('click',loadData);

  document.addEventListener('submit',event => {
    if(event.target.matches('#finance-form,#finance-transfer-form,#student-installment-payment-form,#finance-payable-payment-form')){
      window.setTimeout(loadData,1500);
    }
  },true);

  document.addEventListener('click',event => {
    if(event.target.closest('#finance-refresh,#receivables-refresh,#finance-payable-refresh')){
      window.setTimeout(loadData,900);
    }
  });
}

async function loadData(){
  if(!currentUser || loading || !ensurePanel()) return;
  loading = true;
  const button = document.getElementById('finance-report-refresh');
  if(button){ button.disabled = true; button.textContent = 'Actualizando...'; }
  setMessage('info','Calculando el reporte financiero...');
  try{
    const [movementSnapshot,installmentSnapshot,obligationSnapshot,closureSnapshot] = await Promise.all([
      getDocs(query(collection(db,MOVEMENTS_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS))),
      getDocs(query(collection(db,INSTALLMENTS_COLLECTION),limit(MAX_RECORDS))),
      getDocs(query(collection(db,OBLIGATIONS_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS))),
      getDocs(query(collection(db,CLOSURES_COLLECTION),orderBy('fechaCierre','desc'),limit(1000)))
    ]);
    movements = movementSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    installments = installmentSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    obligations = obligationSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    closures = closureSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    render();
    setMessage('ok',`Reporte actualizado: ${movements.length} movimientos, ${installments.length} cuotas, ${obligations.length} obligaciones y ${closures.length} cierres analizados.`);
  }catch(error){
    console.error('No se pudo generar el reporte financiero.',error);
    setMessage('err',error?.code === 'permission-denied'
      ? 'Firebase rechazó una lectura necesaria para el reporte. Revisa las reglas publicadas.'
      : 'No se pudo actualizar el reporte financiero. Revisa la conexión e inténtalo nuevamente.');
  }finally{
    loading = false;
    if(button){ button.disabled = false; button.textContent = 'Actualizar reporte'; }
  }
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(ensurePanel()){
      window.clearInterval(timer);
      if(currentUser) loadData();
    }else if(attempts > 100){
      window.clearInterval(timer);
      console.warn('No se encontró el panel financiero para Reportes financieros.');
    }
  },180);
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