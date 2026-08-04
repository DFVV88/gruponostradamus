/* ==================================================
   Grupo Nostradamus - Cuentas por cobrar
   Consolida cuotas, vencimientos y morosidad por alumno y salón.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs
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
const INSTALLMENT_COLLECTION = 'alumno_cuotas';
const PRE_COLLECTION = 'preinscripciones';
const GROUP_COLLECTION = 'grupos_academicos';
const MAX_INSTALLMENTS = 3000;
const MAX_STUDENTS = 1000;
const MAX_GROUPS = 500;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let students = [];
let installments = [];
let preinscriptions = [];
let groups = [];
let loading = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'\"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'
}[char]));
const number = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};
const moneyCents = value => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format(number(value) / 100);

function todayIso(){
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

function daysBetween(from,to){
  if(!from || !to) return 0;
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0,Math.floor((end-start)/86400000));
}

function normalize(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function isMatriculated(record){
  return record?.matriculaAprobada === true || clean(record?.estado) === 'matriculado';
}

function statusLabel(status){
  return ({
    vencido:'Vencido',
    proximo:'Próximo a vencer',
    parcial:'Pago parcial',
    al_dia:'Al día',
    pagado:'Pagado',
    sin_cronograma:'Sin cronograma'
  })[status] || status;
}

function setMessage(type,text){
  const element = document.getElementById('receivables-message');
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('receivables-styles')) return;
  const style = document.createElement('style');
  style.id = 'receivables-styles';
  style.textContent = `
    .rc-section{margin:18px 0;padding:19px;border:1px solid rgba(7,140,149,.16);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .rc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.rc-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:31px;line-height:1}.rc-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.5}.rc-head .btn{padding:9px 13px;font-size:11px;white-space:nowrap}
    .rc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:14px}.rc-stat{padding:13px 14px;border:1px solid #e1ecef;border-radius:16px;background:#fbfdfe}.rc-stat span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.rc-stat strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:24px;line-height:1}.rc-stat.overdue strong{color:#b42318}.rc-stat.upcoming strong{color:#b45309}.rc-stat.students strong{color:#078c95}
    .rc-group-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 8px}.rc-group-title strong{color:#061426;font-size:13px}.rc-group-title small{color:#71808c;font-size:10px}.rc-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}.rc-group{padding:12px;border:1px solid #dce9ed;border-radius:15px;background:linear-gradient(180deg,#fff,#f9fcfd);text-align:left;cursor:pointer;font:inherit}.rc-group:hover,.rc-group.active{border-color:#078c95;background:#eef9fa}.rc-group strong{display:block;color:#061426;font-size:12px}.rc-group small{display:block;margin-top:3px;color:#71808c;font-size:9px}.rc-group span{display:flex;justify-content:space-between;gap:8px;margin-top:8px;color:#526170;font-size:9px;font-weight:850}.rc-group b{color:#b42318}
    .rc-filters{display:grid;grid-template-columns:minmax(220px,1.35fr) minmax(165px,.7fr) minmax(175px,.75fr) minmax(145px,.6fr) minmax(145px,.6fr) auto;gap:8px;margin-bottom:12px}.rc-filters input,.rc-filters select{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:12px;outline:none}.rc-filters .btn{padding:9px 12px;font-size:10px}
    .rc-table table{min-width:1160px}.rc-table th{font-size:9px}.rc-table td{font-size:11px}.rc-money{font-weight:950;white-space:nowrap}.rc-money.pending{color:#b45309}.rc-money.overdue{color:#b42318}.rc-money.paid{color:#14855a}.rc-status{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:950;text-transform:uppercase;white-space:nowrap}.rc-status.vencido{background:#fff0ef;color:#b42318}.rc-status.proximo{background:#fff8e8;color:#8a4c00}.rc-status.parcial{background:#eef8fa;color:#075b65}.rc-status.al_dia{background:#edfbea;color:#17672a}.rc-status.pagado{background:#eaf9f1;color:#14855a}.rc-status.sin_cronograma{background:#f2f4f7;color:#475467}.rc-sub{display:block;margin-top:3px;color:#71808c;font-size:9px;line-height:1.35}.rc-action{border:1px solid #078c95;border-radius:999px;padding:7px 10px;background:#078c95;color:#fff;font:inherit;font-size:9px;font-weight:950;cursor:pointer;white-space:nowrap}.rc-action.secondary{background:#fff;color:#075b65}.rc-empty{padding:18px;text-align:center;color:#647482}
    @media(max-width:1120px){.rc-groups{grid-template-columns:1fr 1fr}.rc-filters{grid-template-columns:1fr 1fr 1fr}.rc-filters .btn{width:100%}}
    @media(max-width:720px){.rc-head{display:block}.rc-head .btn{width:100%;margin-top:10px}.rc-stats,.rc-groups,.rc-filters{grid-template-columns:1fr}.rc-stat strong{font-size:22px}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  if(document.getElementById('receivables-panel')) return true;
  const finance = document.getElementById('nostra-finance-panel');
  if(!finance) return false;
  injectStyles();

  const section = document.createElement('section');
  section.id = 'receivables-panel';
  section.className = 'rc-section';
  section.innerHTML = `
    <div class="rc-head">
      <div><h3>Cuentas por cobrar de alumnos</h3><p>Controla cuotas, saldos, vencimientos y morosidad por alumno y salón. Los pagos se registran desde la ficha del alumno para mantener la auditoría financiera.</p></div>
      <button type="button" class="btn btn-light" id="receivables-refresh">Actualizar cobranza</button>
    </div>
    <div class="rc-stats">
      <article class="rc-stat"><span>Total programado</span><strong id="receivables-programmed">S/ 0.00</strong></article>
      <article class="rc-stat overdue"><span>Deuda vencida</span><strong id="receivables-overdue">S/ 0.00</strong></article>
      <article class="rc-stat upcoming"><span>Vence en 7 días</span><strong id="receivables-upcoming">S/ 0.00</strong></article>
      <article class="rc-stat students"><span>Alumnos con deuda</span><strong id="receivables-students">0</strong></article>
    </div>
    <div class="rc-group-title"><strong>Deuda por salón</strong><small>Selecciona un salón para filtrar</small></div>
    <div class="rc-groups" id="receivables-groups"></div>
    <div class="rc-filters">
      <input id="receivables-search" placeholder="Buscar alumno, DNI, ciclo o salón">
      <select id="receivables-status"><option value="">Todos los estados</option><option value="vencido">Vencidos</option><option value="proximo">Próximos a vencer</option><option value="parcial">Pago parcial</option><option value="al_dia">Al día</option><option value="pagado">Pagados</option><option value="sin_cronograma">Sin cronograma</option></select>
      <select id="receivables-group"><option value="">Todos los salones</option></select>
      <select id="receivables-modality"><option value="">Todas las modalidades</option></select>
      <select id="receivables-turn"><option value="">Todos los turnos</option></select>
      <button type="button" class="btn btn-blue" id="receivables-clear">Limpiar</button>
    </div>
    <div class="msg" id="receivables-message"></div>
    <div class="table-wrap rc-table"><table><thead><tr><th>Alumno</th><th>Salón</th><th>Programado</th><th>Pagado</th><th>Saldo</th><th>Vencido / próxima cuota</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="receivables-rows"><tr><td colspan="8">Cargando cuentas por cobrar...</td></tr></tbody></table></div>`;

  const accountSection = finance.querySelector('.nf-account-section');
  const movementsPanel = finance.querySelector('.nf-panel');
  if(accountSection) accountSection.insertAdjacentElement('afterend',section);
  else if(movementsPanel) movementsPanel.insertAdjacentElement('beforebegin',section);
  else finance.appendChild(section);

  bindEvents();
  ready = true;
  return true;
}

function bindEvents(){
  document.getElementById('receivables-refresh')?.addEventListener('click',loadData);
  document.getElementById('receivables-search')?.addEventListener('input',render);
  document.getElementById('receivables-status')?.addEventListener('change',render);
  document.getElementById('receivables-group')?.addEventListener('change',render);
  document.getElementById('receivables-modality')?.addEventListener('change',render);
  document.getElementById('receivables-turn')?.addEventListener('change',render);
  document.getElementById('receivables-clear')?.addEventListener('click',clearFilters);
  document.getElementById('receivables-groups')?.addEventListener('click',event => {
    const button = event.target.closest('[data-receivables-group]');
    if(!button) return;
    const select = document.getElementById('receivables-group');
    if(select) select.value = button.dataset.receivablesGroup || '';
    render();
  });
  document.getElementById('receivables-rows')?.addEventListener('click',event => {
    const button = event.target.closest('[data-receivables-open]');
    if(button) openStudentRecord(button.dataset.receivablesOpen);
  });

  document.addEventListener('submit',event => {
    if(event.target.matches('#student-installment-payment-form,#student-installment-form')){
      window.setTimeout(loadData,1400);
    }
  },true);
}

function clearFilters(){
  ['receivables-search','receivables-status','receivables-group','receivables-modality','receivables-turn'].forEach(id => {
    const element = document.getElementById(id);
    if(element) element.value = '';
  });
  render();
}

function groupInfo(groupId,record,groupMap){
  const group = groupMap.get(groupId) || {};
  const program = clean(group.programaNombre || record?.ciclo || record?.programaNombre || 'Programa');
  const plan = clean(group.planNombre || record?.planAsignado || record?.planNombre || 'Plan general');
  const modality = clean(group.modalidad || record?.modalidad || 'Por confirmar');
  const turn = clean(group.turno || record?.turno || 'Por confirmar');
  const room = clean(group.salonNombre || group.nombre || record?.salonNombre || `${program} · ${turn}`);
  return {program,plan,modality,turn,room};
}

function buildStudents(){
  const preMap = new Map(preinscriptions.map(item => [item.id,item]));
  const groupMap = new Map(groups.map(item => [item.grupoId || item.id,item]));
  const map = new Map();
  const today = todayIso();
  const sevenDays = addDaysIso(today,7);

  preinscriptions.filter(isMatriculated).forEach(record => {
    const groupId = clean(record.grupoId) || 'grupo-por-confirmar';
    const info = groupInfo(groupId,record,groupMap);
    map.set(record.id,{
      id:record.id,
      name:clean(record.nombre) || 'Alumno sin nombre',
      dni:clean(record.dni),
      phone:clean(record.celular),
      groupId,
      ...info,
      programmed:0,
      paid:0,
      pending:0,
      overdue:0,
      upcoming:0,
      installments:0,
      partialCount:0,
      paidCount:0,
      overdueCount:0,
      nextDue:'',
      oldestOverdue:'',
      maxDaysLate:0
    });
  });

  installments.forEach(item => {
    const state = clean(item.estado || 'pendiente');
    if(state === 'anulada') return;
    const id = clean(item.preinscripcionId || item.registroAlumnoId || item.matriculaId);
    if(!id) return;
    const record = preMap.get(id) || {};
    const groupId = clean(item.grupoId || record.grupoId) || 'grupo-por-confirmar';
    const info = groupInfo(groupId,record,groupMap);
    if(!map.has(id)){
      map.set(id,{
        id,
        name:clean(item.alumnoNombre || record.nombre) || 'Alumno sin nombre',
        dni:clean(item.alumnoDni || record.dni),
        phone:clean(record.celular),
        groupId,
        ...info,
        programmed:0,
        paid:0,
        pending:0,
        overdue:0,
        upcoming:0,
        installments:0,
        partialCount:0,
        paidCount:0,
        overdueCount:0,
        nextDue:'',
        oldestOverdue:'',
        maxDaysLate:0
      });
    }
    const student = map.get(id);
    const programmed = number(item.montoProgramadoCentimos);
    const paid = number(item.montoPagadoCentimos);
    const pending = Math.max(0,number(item.saldoPendienteCentimos));
    const due = clean(item.fechaVencimiento);

    student.programmed += programmed;
    student.paid += paid;
    student.pending += pending;
    student.installments += 1;
    if(state === 'parcial') student.partialCount += 1;
    if(pending === 0 || state === 'pagada') student.paidCount += 1;

    if(pending > 0 && /^\d{4}-\d{2}-\d{2}$/.test(due)){
      if(!student.nextDue || due < student.nextDue) student.nextDue = due;
      if(due < today){
        student.overdue += pending;
        student.overdueCount += 1;
        if(!student.oldestOverdue || due < student.oldestOverdue) student.oldestOverdue = due;
        student.maxDaysLate = Math.max(student.maxDaysLate,daysBetween(due,today));
      }else if(due <= sevenDays){
        student.upcoming += pending;
      }
    }
  });

  students = Array.from(map.values()).map(student => {
    let status = 'sin_cronograma';
    if(student.installments > 0){
      if(student.overdue > 0) status = 'vencido';
      else if(student.pending === 0) status = 'pagado';
      else if(student.partialCount > 0) status = 'parcial';
      else if(student.upcoming > 0) status = 'proximo';
      else status = 'al_dia';
    }
    return {...student,status};
  });
}

function fillSelect(id,items,placeholder){
  const element = document.getElementById(id);
  if(!element) return;
  const current = element.value;
  const options = Array.from(items).filter(Boolean).sort((a,b) => a.label.localeCompare(b.label,'es'));
  element.innerHTML = `<option value="">${esc(placeholder)}</option>` + options.map(item => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
  if(options.some(item => item.value === current)) element.value = current;
}

function populateFilters(){
  const groupOptions = new Map();
  const modalityOptions = new Set();
  const turnOptions = new Set();
  students.forEach(student => {
    groupOptions.set(student.groupId,{value:student.groupId,label:student.room});
    modalityOptions.add(student.modality);
    turnOptions.add(student.turn);
  });
  fillSelect('receivables-group',groupOptions.values(),'Todos los salones');
  fillSelect('receivables-modality',Array.from(modalityOptions).map(value => ({value,label:value})),'Todas las modalidades');
  fillSelect('receivables-turn',Array.from(turnOptions).map(value => ({value,label:value})),'Todos los turnos');
}

function filteredStudents(){
  const term = normalize(document.getElementById('receivables-search')?.value);
  const status = clean(document.getElementById('receivables-status')?.value);
  const group = clean(document.getElementById('receivables-group')?.value);
  const modality = clean(document.getElementById('receivables-modality')?.value);
  const turn = clean(document.getElementById('receivables-turn')?.value);

  return students.filter(student => {
    const haystack = normalize([
      student.name,student.dni,student.phone,student.room,student.program,
      student.plan,student.modality,student.turn
    ].join(' '));
    return (!term || haystack.includes(term))
      && (!status || student.status === status)
      && (!group || student.groupId === group)
      && (!modality || student.modality === modality)
      && (!turn || student.turn === turn);
  });
}

function renderGroupCards(data){
  const container = document.getElementById('receivables-groups');
  if(!container) return;
  const selected = clean(document.getElementById('receivables-group')?.value);
  const groupMap = new Map();
  students.forEach(student => {
    if(!groupMap.has(student.groupId)){
      groupMap.set(student.groupId,{id:student.groupId,label:student.room,students:0,debtors:0,pending:0,overdue:0});
    }
    const group = groupMap.get(student.groupId);
    group.students += 1;
    if(student.pending > 0) group.debtors += 1;
    group.pending += student.pending;
    group.overdue += student.overdue;
  });
  const groupsData = Array.from(groupMap.values()).sort((a,b) => b.pending-a.pending || a.label.localeCompare(b.label,'es'));
  if(!groupsData.length){
    container.innerHTML = '<div class="rc-empty">Aún no existen alumnos matriculados o cuotas programadas.</div>';
    return;
  }
  container.innerHTML = groupsData.map(group => `
    <button type="button" class="rc-group ${selected === group.id ? 'active' : ''}" data-receivables-group="${esc(group.id)}">
      <strong>${esc(group.label)}</strong>
      <small>${group.students} alumno${group.students === 1 ? '' : 's'} · ${group.debtors} con deuda</small>
      <span><span>Por cobrar ${moneyCents(group.pending)}</span><b>Vencido ${moneyCents(group.overdue)}</b></span>
    </button>`).join('');
}

function renderSummary(data){
  const programmed = data.reduce((sum,item) => sum + item.programmed,0);
  const overdue = data.reduce((sum,item) => sum + item.overdue,0);
  const upcoming = data.reduce((sum,item) => sum + item.upcoming,0);
  const debtors = data.filter(item => item.pending > 0).length;
  const set = (id,value) => { const element = document.getElementById(id); if(element) element.textContent = value; };
  set('receivables-programmed',moneyCents(programmed));
  set('receivables-overdue',moneyCents(overdue));
  set('receivables-upcoming',moneyCents(upcoming));
  set('receivables-students',String(debtors));
}

function statusDetail(student){
  if(student.status === 'vencido'){
    return `${student.overdueCount} cuota${student.overdueCount === 1 ? '' : 's'} · ${student.maxDaysLate} día${student.maxDaysLate === 1 ? '' : 's'} de atraso`;
  }
  if(student.status === 'proximo') return `Vence ${dateLabel(student.nextDue)}`;
  if(student.status === 'parcial') return `${student.partialCount} cuota${student.partialCount === 1 ? '' : 's'} con abono`;
  if(student.status === 'pagado') return `${student.paidCount} cuota${student.paidCount === 1 ? '' : 's'} pagada${student.paidCount === 1 ? '' : 's'}`;
  if(student.status === 'sin_cronograma') return 'Programa sus cuotas desde la ficha';
  return student.nextDue ? `Próxima cuota: ${dateLabel(student.nextDue)}` : 'Sin vencimiento próximo';
}

function render(){
  if(!ensurePanel()) return;
  const data = filteredStudents().sort((a,b) => {
    const priority = {vencido:0,proximo:1,parcial:2,al_dia:3,sin_cronograma:4,pagado:5};
    return (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
      || b.overdue - a.overdue
      || b.pending - a.pending
      || a.name.localeCompare(b.name,'es');
  });
  renderSummary(data);
  renderGroupCards(data);

  const rows = document.getElementById('receivables-rows');
  if(!rows) return;
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="8" class="rc-empty">No hay alumnos para los filtros seleccionados.</td></tr>';
    return;
  }
  rows.innerHTML = data.map(student => {
    const dueText = student.overdue > 0
      ? `<span class="rc-money overdue">${moneyCents(student.overdue)}</span><span class="rc-sub">Desde ${dateLabel(student.oldestOverdue)} · ${student.maxDaysLate} días</span>`
      : student.nextDue
        ? `<b>${dateLabel(student.nextDue)}</b><span class="rc-sub">${student.upcoming > 0 ? 'Dentro de los próximos 7 días' : 'Próximo vencimiento'}</span>`
        : '<span class="rc-sub">Sin cuota pendiente</span>';
    return `<tr>
      <td><b>${esc(student.name)}</b><span class="rc-sub">DNI: ${esc(student.dni || '-')}</span></td>
      <td><b>${esc(student.room)}</b><span class="rc-sub">${esc(student.modality)} · ${esc(student.turn)}<br>${esc(student.program)} · ${esc(student.plan)}</span></td>
      <td><span class="rc-money">${moneyCents(student.programmed)}</span><span class="rc-sub">${student.installments} cuota${student.installments === 1 ? '' : 's'}</span></td>
      <td><span class="rc-money paid">${moneyCents(student.paid)}</span></td>
      <td><span class="rc-money pending">${moneyCents(student.pending)}</span></td>
      <td>${dueText}</td>
      <td><span class="rc-status ${student.status}">${esc(statusLabel(student.status))}</span><span class="rc-sub">${esc(statusDetail(student))}</span></td>
      <td><button type="button" class="rc-action" data-receivables-open="${esc(student.id)}">Ver ficha y cobrar</button></td>
    </tr>`;
  }).join('');
}

function openStudentRecord(id){
  const student = students.find(item => item.id === id);
  const nav = document.querySelector('.admin-pro-nav [data-admin-view="preinscripciones"]') || document.querySelector('[data-admin-view="preinscripciones"]');
  nav?.click();

  const statusFilter = document.getElementById('estado-filter');
  const paymentFilter = document.getElementById('pago-filter');
  const search = document.getElementById('search-input');
  if(statusFilter) statusFilter.value = '';
  if(paymentFilter) paymentFilter.value = '';
  if(search){
    search.value = student?.dni || student?.name || '';
    search.dispatchEvent(new Event('input',{bubbles:true}));
  }

  window.setTimeout(() => {
    const button = Array.from(document.querySelectorAll('[data-open]')).find(item => item.dataset.open === id);
    if(button){
      button.click();
      return;
    }
    setMessage('info','Se abrió Preinscripciones y se aplicó la búsqueda. Abre manualmente la ficha del alumno para registrar el cobro.');
  },320);
}

async function loadData(){
  if(!currentUser || loading || !ensurePanel()) return;
  loading = true;
  const button = document.getElementById('receivables-refresh');
  if(button){ button.disabled = true; button.textContent = 'Actualizando...'; }
  setMessage('info','Actualizando cuotas, alumnos y salones...');
  try{
    const [installmentSnapshot,preSnapshot,groupSnapshot] = await Promise.all([
      getDocs(query(collection(db,INSTALLMENT_COLLECTION),limit(MAX_INSTALLMENTS))),
      getDocs(query(collection(db,PRE_COLLECTION),orderBy('createdAt','desc'),limit(MAX_STUDENTS))),
      getDocs(query(collection(db,GROUP_COLLECTION),limit(MAX_GROUPS)))
    ]);
    installments = installmentSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    preinscriptions = preSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    groups = groupSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    buildStudents();
    populateFilters();
    render();
    const overdueStudents = students.filter(item => item.overdue > 0).length;
    setMessage('ok',`Cobranza actualizada: ${students.length} alumnos, ${installments.length} cuotas y ${overdueStudents} alumnos con deuda vencida.`);
  }catch(error){
    console.error('No se pudo cargar cuentas por cobrar.',error);
    students = [];
    render();
    setMessage('err',error?.code === 'permission-denied'
      ? 'Firebase rechazó la lectura de cuotas o salones. Revisa las reglas publicadas.'
      : 'No se pudo actualizar cuentas por cobrar. Revisa la conexión e inténtalo nuevamente.');
  }finally{
    loading = false;
    if(button){ button.disabled = false; button.textContent = 'Actualizar cobranza'; }
  }
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(ensurePanel()){
      window.clearInterval(timer);
      if(currentUser) loadData();
    }else if(attempts > 70){
      window.clearInterval(timer);
      console.warn('No se encontró el panel financiero para cuentas por cobrar.');
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
