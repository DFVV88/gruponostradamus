/* ==================================================
   Grupo Nostradamus - Pagos, matrículas y grupos
   Integra validación manual, Finanzas y registro académico.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  doc,
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
const FINANCE_COLLECTION = 'finanzas_movimientos';
const STUDENT_COLLECTION = 'registros_alumnos';
const ENROLLMENT_COLLECTION = 'matriculas';
const GROUP_COLLECTION = 'grupos_academicos';

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
let preinscriptions = [];
let groups = [];
let studentRecords = [];
let selectedRecordId = '';
let paymentRecord = null;
let busy = false;
let ready = false;
let syncing = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value));
const todayIso = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
const dateLabel = value => {
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
};

function normalize(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function slug(value){
  return normalize(value)
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,55);
}

function accountLabel(value){
  return ACCOUNTS.find(item => item[0] === value)?.[1] || value || '-';
}

function paymentMethodForAccount(account){
  return ({
    caja_efectivo:'efectivo',
    yape:'yape',
    plin:'plin',
    bcp:'transferencia',
    culqi:'culqi',
    otra:'otro'
  })[account] || 'otro';
}

function paymentAmount(record){
  return num(record?.montoPagoValidado || record?.montoPagoInicial || record?.totalInicial || record?.precioReferencia || 0);
}

function studentStatus(record){
  if(record?.estado === 'rechazado' || record?.estado === 'observado' || record?.estadoPago === 'pago_observado') return 'observado';
  if(record?.matriculaAprobada === true || record?.estado === 'matriculado') return 'matriculado';
  if(record?.pagoValidado === true || record?.estadoPago === 'pago_validado') return 'pago_validado';
  return 'preinscrito';
}

function statusLabel(status){
  return ({
    preinscrito:'Preinscrito',
    pago_validado:'Pago validado',
    matriculado:'Matriculado',
    observado:'Observado'
  })[status] || status;
}

function groupFor(record){
  const parts = [
    record?.programaId || record?.ciclo || 'programa',
    record?.modalidad || 'presencial',
    record?.turno || record?.planNombre || 'general',
    record?.planId || record?.planNombre || 'plan'
  ];
  const id = parts.map(slug).filter(Boolean).join('__').slice(0,190) || `grupo-${slug(record?.ciclo || 'general')}`;
  const existing = groups.find(item => item.id === id || item.grupoId === id) || {};
  const program = clean(record?.ciclo || existing.programaNombre || 'Programa');
  const turn = clean(record?.turno || existing.turno || 'Turno por confirmar');
  const plan = clean(record?.planNombre || existing.planNombre || 'Plan general');
  const modality = clean(record?.modalidad || existing.modalidad || 'Presencial');
  return {
    id,
    grupoId:id,
    nombre:clean(existing.nombre) || `${program} · ${plan} · ${turn}`,
    salonNombre:clean(existing.salonNombre) || `${program} · ${turn}`,
    programaId:clean(record?.programaId || existing.programaId),
    programaNombre:program,
    planId:clean(record?.planId || existing.planId),
    planNombre:plan,
    modalidad:modality,
    turno:turn,
    capacidad:Number(existing.capacidad || 0),
    estado:clean(existing.estado) || 'activo'
  };
}

function categoryFor(record,selected){
  if(['matricula','pension','otros_ingresos'].includes(selected)) return selected;
  const text = normalize(record?.conceptoPagoInicial || '');
  if(text.includes('matricula')) return 'matricula';
  if(text.includes('pension') || text.includes('cuota')) return 'pension';
  return 'otros_ingresos';
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('admin-payments-enrollments-styles')) return;
  const style = document.createElement('style');
  style.id = 'admin-payments-enrollments-styles';
  style.textContent = `
    .npm-section{margin-top:18px;padding:19px;border:1px solid rgba(7,140,149,.14);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .npm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:14px}.npm-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:30px;line-height:1}.npm-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.5}.npm-head .btn{padding:9px 13px;font-size:11px;white-space:nowrap}
    .npm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:13px}.npm-stats article{padding:13px 14px;border:1px solid #e1ecef;border-radius:15px;background:#fbfdfe}.npm-stats span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.npm-stats strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:24px;line-height:1}.npm-stats .validated strong{color:#078c95}.npm-stats .enrolled strong{color:#14855a}
    .npm-groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:13px}.npm-group{padding:13px;border:1px solid #dce9ed;border-radius:16px;background:linear-gradient(180deg,#fff,#f9fcfd);text-align:left;cursor:pointer;font:inherit}.npm-group:hover{border-color:rgba(7,140,149,.45);box-shadow:0 10px 22px rgba(6,20,38,.06)}.npm-group strong{display:block;color:#061426;font-size:13px}.npm-group small{display:block;margin-top:3px;color:#71808c;font-size:10px}.npm-group span{display:flex;gap:9px;margin-top:9px;color:#526170;font-size:9px;font-weight:850}.npm-group.active{border-color:#078c95;background:#eef9fa}
    .npm-filters{display:grid;grid-template-columns:minmax(240px,1.4fr) minmax(170px,.65fr) minmax(210px,.85fr) auto;gap:9px;margin-bottom:12px}.npm-filters input,.npm-filters select{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:13px;outline:none}.npm-filters .btn{padding:9px 13px;font-size:11px}.npm-table table{min-width:1080px}.npm-table th{font-size:10px}.npm-status{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:9px;font-weight:950;text-transform:uppercase}.npm-status.preinscrito{background:#fff8e8;color:#8a4c00}.npm-status.pago_validado{background:#eaf8f9;color:#075b65}.npm-status.matriculado{background:#eaf9f1;color:#14855a}.npm-status.observado{background:#fff0ef;color:#b42318}.npm-finance-ok{color:#14855a;font-weight:900}.npm-finance-pending{color:#b45309;font-weight:900}.npm-mini{border:1px solid #dce9ed;border-radius:999px;padding:7px 10px;background:#fff;color:#075b65;font:inherit;font-size:10px;font-weight:950;cursor:pointer}.npm-mini.primary{border-color:#078c95;background:#078c95;color:#fff}.npm-mini.warning{border-color:#f4c278;background:#fff8e8;color:#8a4c00}
    .npm-modal-back{position:fixed;inset:0;z-index:10120;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,7,13,.68)}.npm-modal-back.show{display:flex}.npm-modal{width:min(820px,96vw);max-height:92vh;overflow:auto;padding:23px;border-radius:24px;background:#fff;box-shadow:0 28px 80px rgba(2,7,13,.3)}.npm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.npm-modal-head h2{margin:0;color:#061426;font-family:'Baloo 2';font-size:34px;line-height:1}.npm-modal-head p{margin:5px 0 0;color:#647482;font-size:12px}.npm-modal-head .btn{padding:8px 12px;font-size:11px}.npm-target{margin-bottom:12px;padding:13px;border:1px solid #dce9ed;border-radius:15px;background:#f7fcfd;color:#526170;font-size:12px;line-height:1.5}.npm-target strong{color:#061426}.npm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.npm-grid label span{display:block;margin-bottom:5px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.npm-grid input,.npm-grid select,.npm-grid textarea{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:13px;outline:none}.npm-grid textarea{resize:vertical;min-height:78px}.npm-grid .wide{grid-column:1/-1}.npm-note{margin-top:12px;padding:11px 13px;border:1px solid rgba(255,148,30,.25);border-radius:14px;background:#fff8e8;color:#6a4700;font-size:11px;font-weight:800;line-height:1.45}.npm-actions{display:flex;justify-content:flex-end;margin-top:13px}.npm-actions .btn{min-width:210px}
    @media(max-width:1050px){.npm-groups{grid-template-columns:1fr 1fr}.npm-filters{grid-template-columns:1fr 1fr}.npm-filters .btn{width:100%}}
    @media(max-width:700px){.npm-head{display:block}.npm-head .btn{width:100%;margin-top:10px}.npm-stats,.npm-groups,.npm-filters,.npm-grid{grid-template-columns:1fr}.npm-grid .wide{grid-column:auto}.npm-modal{padding:18px}.npm-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
}

function buildPanel(){
  if(document.getElementById('admin-payments-enrollments')) return;
  const view = document.getElementById('admin-view-preinscripciones');
  if(!view) return;
  const section = document.createElement('section');
  section.id = 'admin-payments-enrollments';
  section.className = 'npm-section';
  section.innerHTML = `
    <div class="npm-head"><div><h3>Alumnos, pagos y salones</h3><p>Cada preinscripción queda vinculada a un grupo académico. Al validar el pago se genera el ingreso financiero y, al aprobar la matrícula, se crea el registro oficial.</p></div><button type="button" class="btn btn-light" id="npm-refresh">Actualizar registros</button></div>
    <div class="npm-stats">
      <article><span>Total preinscritos</span><strong id="npm-total">0</strong></article>
      <article><span>Pagos pendientes</span><strong id="npm-pending">0</strong></article>
      <article class="validated"><span>Pagos validados</span><strong id="npm-validated">0</strong></article>
      <article class="enrolled"><span>Matriculados</span><strong id="npm-enrolled">0</strong></article>
    </div>
    <div class="npm-groups" id="npm-groups"></div>
    <div class="npm-filters">
      <input id="npm-search" placeholder="Buscar alumno, DNI, celular, ciclo o salón">
      <select id="npm-status"><option value="">Todos los estados</option><option value="preinscrito">Preinscritos</option><option value="pago_validado">Pago validado</option><option value="matriculado">Matriculados</option><option value="observado">Observados</option></select>
      <select id="npm-group"><option value="">Todos los grupos y salones</option></select>
      <button type="button" class="btn btn-blue" id="npm-clear">Limpiar filtros</button>
    </div>
    <div class="msg" id="npm-message"></div>
    <div class="table-wrap npm-table"><table><thead><tr><th>Alumno</th><th>Grupo / salón</th><th>Estado académico</th><th>Pago</th><th>Ingreso financiero</th><th>Fecha</th><th>Acción</th></tr></thead><tbody id="npm-rows"><tr><td colspan="7">Cargando alumnos...</td></tr></tbody></table></div>`;
  view.appendChild(section);

  const modal = document.createElement('div');
  modal.id = 'npm-payment-back';
  modal.className = 'npm-modal-back';
  modal.innerHTML = `
    <div class="npm-modal" role="dialog" aria-modal="true" aria-labelledby="npm-payment-title">
      <div class="npm-modal-head"><div><h2 id="npm-payment-title">Validar pago e integrar ingreso</h2><p>El pago y el movimiento financiero se guardarán juntos para evitar duplicidades.</p></div><button type="button" class="btn btn-light" id="npm-payment-close">Cerrar</button></div>
      <form id="npm-payment-form">
        <div class="npm-target" id="npm-payment-target"></div>
        <div class="npm-grid">
          <label><span>Monto recibido (S/)</span><input id="npm-payment-amount" type="number" min="0.01" max="1000000" step="0.01" required></label>
          <label><span>Fecha del pago</span><input id="npm-payment-date" type="date" min="2026-01-01" required></label>
          <label><span>Clasificación</span><select id="npm-payment-category"><option value="matricula">Matrícula o pago inicial</option><option value="pension">Pensión o cuota</option><option value="otros_ingresos">Otro ingreso del alumno</option></select></label>
          <label><span>Cuenta receptora</span><select id="npm-payment-account" required>${ACCOUNTS.map(item => `<option value="${item[0]}">${item[1]}</option>`).join('')}</select></label>
          <label class="wide"><span>Concepto</span><input id="npm-payment-concept" minlength="3" maxlength="150" required></label>
          <label class="wide"><span>Número de operación o referencia</span><input id="npm-payment-operation" minlength="3" maxlength="100" required placeholder="Código de Yape, Plin, transferencia o recibo de caja"></label>
          <label class="wide"><span>Observación</span><textarea id="npm-payment-note" maxlength="700" rows="3" placeholder="Opcional"></textarea></label>
        </div>
        <div class="npm-note">El mismo pago no podrá registrarse dos veces. El ingreso quedará vinculado al alumno, su preinscripción, matrícula futura y grupo académico.</div>
        <div class="msg" id="npm-payment-message"></div>
        <div class="npm-actions"><button type="submit" class="btn btn-green" id="npm-payment-save">Confirmar pago e ingreso</button></div>
      </form>
    </div>`;
  document.body.appendChild(modal);
}

function bindEvents(){
  document.getElementById('npm-refresh')?.addEventListener('click',loadAll);
  document.getElementById('npm-search')?.addEventListener('input',renderPanel);
  document.getElementById('npm-status')?.addEventListener('change',renderPanel);
  document.getElementById('npm-group')?.addEventListener('change',renderPanel);
  document.getElementById('npm-clear')?.addEventListener('click',() => {
    const search = document.getElementById('npm-search');
    const status = document.getElementById('npm-status');
    const group = document.getElementById('npm-group');
    if(search) search.value = '';
    if(status) status.value = '';
    if(group) group.value = '';
    renderPanel();
  });
  document.getElementById('npm-groups')?.addEventListener('click',event => {
    const card = event.target.closest('[data-npm-group]');
    if(!card) return;
    const select = document.getElementById('npm-group');
    if(select) select.value = card.dataset.npmGroup;
    renderPanel();
  });
  document.getElementById('npm-rows')?.addEventListener('click',event => {
    const payment = event.target.closest('[data-npm-payment]');
    const ficha = event.target.closest('[data-npm-open]');
    if(payment) openPaymentModal(payment.dataset.npmPayment);
    if(ficha) openOriginalFicha(ficha.dataset.npmOpen);
  });
  document.getElementById('npm-payment-close')?.addEventListener('click',closePaymentModal);
  document.getElementById('npm-payment-back')?.addEventListener('click',event => {
    if(event.target.id === 'npm-payment-back') closePaymentModal();
  });
  document.getElementById('npm-payment-form')?.addEventListener('submit',savePayment);

  document.addEventListener('click',captureAdminActions,true);
}

async function captureAdminActions(event){
  const payButton = event.target.closest('[data-pay]');
  const openButton = event.target.closest('[data-open]');
  if(openButton) selectedRecordId = clean(openButton.dataset.open);

  if(payButton){
    event.preventDefault();
    event.stopPropagation();
    selectedRecordId = clean(payButton.dataset.pay);
    openPaymentModal(selectedRecordId);
    return;
  }

  const save = event.target.closest('#save-btn');
  if(save && selectedRecordId && document.getElementById('edit-estado-pago')?.value === 'pago_validado'){
    const snapshot = await getDoc(doc(db,PRE_COLLECTION,selectedRecordId));
    const record = snapshot.exists() ? {id:snapshot.id,...snapshot.data()} : null;
    if(record && !clean(record.ingresoFinancieroId)){
      event.preventDefault();
      event.stopPropagation();
      openPaymentModal(selectedRecordId);
      return;
    }
  }

  const approve = event.target.closest('#approve-btn');
  if(approve && selectedRecordId){
    event.preventDefault();
    event.stopPropagation();
    approveEnrollment(selectedRecordId);
  }
}

function setup(){
  if(ready) return true;
  const view = document.getElementById('admin-view-preinscripciones');
  if(!view) return false;
  injectStyles();
  buildPanel();
  bindEvents();
  ready = true;
  if(currentUser) loadAll();
  return true;
}

async function loadAll(){
  if(!currentUser || !setup() || syncing) return;
  setMessage('npm-message','info','Actualizando alumnos, grupos y estados de pago...');
  try{
    const [preSnapshot,groupSnapshot,studentSnapshot] = await Promise.all([
      getDocs(query(collection(db,PRE_COLLECTION),orderBy('createdAt','desc'),limit(300))),
      getDocs(query(collection(db,GROUP_COLLECTION),limit(300))),
      getDocs(query(collection(db,STUDENT_COLLECTION),limit(500)))
    ]);
    preinscriptions = preSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    groups = groupSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    studentRecords = studentSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    await syncAcademicRecords();
    renderPanel();
    const missing = preinscriptions.filter(item => studentStatus(item) === 'pago_validado' && !clean(item.ingresoFinancieroId)).length;
    setMessage('npm-message',missing ? 'info' : 'ok',missing
      ? `${missing} pago${missing === 1 ? '' : 's'} validado${missing === 1 ? '' : 's'} requiere${missing === 1 ? '' : 'n'} regularización financiera.`
      : 'Alumnos, matrículas y grupos actualizados.');
  }catch(error){
    console.error(error);
    setMessage('npm-message','err',error?.code === 'permission-denied'
      ? 'Firebase todavía no autorizó los registros académicos. Deben publicarse las nuevas reglas de Firestore.'
      : 'No se pudieron cargar los registros académicos.');
  }
}

async function syncAcademicRecords(){
  if(syncing || !currentUser) return;
  syncing = true;
  try{
    const existingGroups = new Map(groups.map(item => [item.id,item]));
    const existingStudents = new Map(studentRecords.map(item => [item.id,item]));
    const groupWrites = [];
    const studentWrites = [];

    preinscriptions.forEach(record => {
      const group = groupFor(record);
      if(!existingGroups.has(group.id)){
        groupWrites.push({id:group.id,data:{...group,createdBy:currentUser.email || ADMIN_EMAIL,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}});
        existingGroups.set(group.id,group);
      }

      const status = studentStatus(record);
      const existing = existingStudents.get(record.id) || {};
      const financeId = clean(record.ingresoFinancieroId);
      const desired = {
        registroAlumnoId:record.id,
        preinscripcionId:record.id,
        matriculaId:record.id,
        alumnoNombre:clean(record.nombre),
        dni:clean(record.dni),
        celular:clean(record.celular),
        correo:clean(record.correo),
        grupoId:group.id,
        grupoNombre:group.nombre,
        salonNombre:group.salonNombre,
        programaId:clean(record.programaId),
        programaNombre:clean(record.ciclo),
        planId:clean(record.planId),
        planNombre:clean(record.planNombre),
        modalidad:clean(record.modalidad),
        turno:clean(record.turno),
        estadoAcademico:status,
        estadoPago:clean(record.estadoPago),
        pagoValidado:record.pagoValidado === true || record.estadoPago === 'pago_validado',
        ingresoFinancieroId:financeId,
        pagoFinanzasEstado:financeId ? 'registrado' : (status === 'pago_validado' ? 'pendiente_regularizacion' : 'pendiente'),
        montoPagoValidado:num(record.montoPagoValidado || record.montoPagoInicial || record.totalInicial),
        origen:'preinscripcion_web',
        actualizadoPor:currentUser.email || ADMIN_EMAIL,
        updatedAt:serverTimestamp()
      };
      const changed = !existing.id ||
        clean(existing.estadoAcademico) !== status ||
        clean(existing.grupoId) !== group.id ||
        clean(existing.ingresoFinancieroId) !== financeId ||
        clean(existing.estadoPago) !== clean(record.estadoPago);
      if(changed) studentWrites.push({id:record.id,data:desired});
    });

    for(let index=0;index<groupWrites.length;index+=200){
      const batch = writeBatch(db);
      groupWrites.slice(index,index+200).forEach(item => batch.set(doc(db,GROUP_COLLECTION,item.id),item.data,{merge:true}));
      await batch.commit();
    }
    for(let index=0;index<studentWrites.length;index+=200){
      const batch = writeBatch(db);
      studentWrites.slice(index,index+200).forEach(item => batch.set(doc(db,STUDENT_COLLECTION,item.id),item.data,{merge:true}));
      await batch.commit();
    }
  }finally{
    syncing = false;
  }
}

function filteredPreinscriptions(){
  const term = normalize(document.getElementById('npm-search')?.value);
  const status = clean(document.getElementById('npm-status')?.value);
  const groupId = clean(document.getElementById('npm-group')?.value);
  return preinscriptions.filter(record => {
    const group = groupFor(record);
    const currentStatus = studentStatus(record);
    const haystack = normalize([
      record.nombre,record.dni,record.celular,record.correo,record.ciclo,
      record.planNombre,record.turno,group.nombre,group.salonNombre
    ].join(' '));
    return (!term || haystack.includes(term)) && (!status || currentStatus === status) && (!groupId || group.id === groupId);
  });
}

function renderPanel(){
  if(!document.getElementById('admin-payments-enrollments')) return;
  const statuses = preinscriptions.map(studentStatus);
  document.getElementById('npm-total').textContent = String(preinscriptions.length);
  document.getElementById('npm-pending').textContent = String(statuses.filter(item => item === 'preinscrito').length);
  document.getElementById('npm-validated').textContent = String(statuses.filter(item => item === 'pago_validado').length);
  document.getElementById('npm-enrolled').textContent = String(statuses.filter(item => item === 'matriculado').length);

  const grouped = new Map();
  preinscriptions.forEach(record => {
    const group = groupFor(record);
    if(!grouped.has(group.id)) grouped.set(group.id,{group,records:[]});
    grouped.get(group.id).records.push(record);
  });
  const groupList = [...grouped.values()].sort((a,b) => a.group.nombre.localeCompare(b.group.nombre,'es'));
  const currentGroup = clean(document.getElementById('npm-group')?.value);
  const groupGrid = document.getElementById('npm-groups');
  if(groupGrid){
    groupGrid.innerHTML = groupList.map(item => {
      const enrolled = item.records.filter(record => studentStatus(record) === 'matriculado').length;
      const validated = item.records.filter(record => studentStatus(record) === 'pago_validado').length;
      return `<button type="button" class="npm-group ${currentGroup === item.group.id ? 'active' : ''}" data-npm-group="${esc(item.group.id)}"><strong>${esc(item.group.salonNombre)}</strong><small>${esc(item.group.planNombre)} · ${esc(item.group.modalidad)}</small><span><b>${item.records.length} registros</b><b>${validated} pagos</b><b>${enrolled} matriculados</b></span></button>`;
    }).join('') || '<div class="npm-target">Todavía no existen grupos académicos.</div>';
  }

  const groupSelect = document.getElementById('npm-group');
  if(groupSelect){
    const selected = groupSelect.value;
    groupSelect.innerHTML = '<option value="">Todos los grupos y salones</option>' + groupList.map(item => `<option value="${esc(item.group.id)}">${esc(item.group.salonNombre)} · ${esc(item.group.planNombre)}</option>`).join('');
    if([...groupSelect.options].some(option => option.value === selected)) groupSelect.value = selected;
  }

  const rows = document.getElementById('npm-rows');
  if(!rows) return;
  const data = filteredPreinscriptions();
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="7">No hay alumnos para los filtros seleccionados.</td></tr>';
    return;
  }
  rows.innerHTML = data.map(record => {
    const status = studentStatus(record);
    const group = groupFor(record);
    const financeId = clean(record.ingresoFinancieroId);
    const paid = record.pagoValidado === true || record.estadoPago === 'pago_validado';
    let action = `<button type="button" class="npm-mini" data-npm-open="${esc(record.id)}">Ver ficha</button>`;
    if(status === 'preinscrito') action = `<button type="button" class="npm-mini primary" data-npm-payment="${esc(record.id)}">Validar pago</button>`;
    if(status === 'pago_validado' && !financeId) action = `<button type="button" class="npm-mini warning" data-npm-payment="${esc(record.id)}">Regularizar ingreso</button>`;
    return `<tr>
      <td><b>${esc(record.nombre)}</b><br><small>DNI: ${esc(record.dni)} · ${esc(record.celular)}</small></td>
      <td><b>${esc(group.salonNombre)}</b><br><small>${esc(group.planNombre)} · ${esc(group.modalidad)} · ${esc(group.turno)}</small></td>
      <td><span class="npm-status ${esc(status)}">${esc(statusLabel(status))}</span></td>
      <td>${paid ? `<b>${esc(money(paymentAmount(record)))}</b><br><small>${esc(record.conceptoPagoInicial || 'Pago validado')}</small>` : '<span class="npm-finance-pending">Pendiente</span>'}</td>
      <td>${financeId ? `<span class="npm-finance-ok">Registrado</span><br><small>${esc(financeId)}</small>` : (paid ? '<span class="npm-finance-pending">Falta integrar</span>' : '<small>No aplica todavía</small>')}</td>
      <td>${esc(dateLabel(record.fechaPagoValidado || record.fechaOperacionPago || ''))}<br><small>${esc(record.numeroOperacionPago || '')}</small></td>
      <td>${action}</td>
    </tr>`;
  }).join('');
}

async function openPaymentModal(id){
  if(!currentUser || busy || !id) return;
  setMessage('npm-payment-message','info','Cargando información del alumno...');
  try{
    const snapshot = await getDoc(doc(db,PRE_COLLECTION,id));
    if(!snapshot.exists()) throw new Error('Preinscripción no encontrada');
    paymentRecord = {id:snapshot.id,...snapshot.data()};
    selectedRecordId = id;
    const group = groupFor(paymentRecord);
    const alreadyLinked = clean(paymentRecord.ingresoFinancieroId);
    document.getElementById('npm-payment-title').textContent = alreadyLinked ? 'Pago ya integrado' : ((paymentRecord.pagoValidado === true || paymentRecord.estadoPago === 'pago_validado') ? 'Regularizar ingreso financiero' : 'Validar pago e integrar ingreso');
    document.getElementById('npm-payment-target').innerHTML = `<strong>${esc(paymentRecord.nombre)}</strong> · DNI ${esc(paymentRecord.dni)}<br>${esc(paymentRecord.ciclo)} · ${esc(paymentRecord.planNombre)}<br><b>Grupo/salón:</b> ${esc(group.salonNombre)} · ${esc(group.turno)}`;
    document.getElementById('npm-payment-amount').value = paymentAmount(paymentRecord).toFixed(2);
    document.getElementById('npm-payment-date').max = todayIso();
    document.getElementById('npm-payment-date').value = clean(paymentRecord.fechaPagoValidado) || todayIso();
    document.getElementById('npm-payment-category').value = categoryFor(paymentRecord,'');
    document.getElementById('npm-payment-account').value = clean(paymentRecord.cuentaPagoValidado) || 'yape';
    document.getElementById('npm-payment-concept').value = clean(paymentRecord.conceptoPagoInicial) || `Pago inicial de ${clean(paymentRecord.ciclo)}`;
    document.getElementById('npm-payment-operation').value = clean(paymentRecord.numeroOperacionPago);
    document.getElementById('npm-payment-note').value = clean(paymentRecord.pagoObservacion);
    const save = document.getElementById('npm-payment-save');
    if(save) save.disabled = Boolean(alreadyLinked);
    setMessage('npm-payment-message',alreadyLinked ? 'ok' : 'info',alreadyLinked
      ? `Este pago ya generó el movimiento ${alreadyLinked}. No se creará un duplicado.`
      : 'Confirma el monto, la cuenta receptora y el número de operación.');
    document.getElementById('npm-payment-back')?.classList.add('show');
  }catch(error){
    console.error(error);
    paymentRecord = null;
    setMessage('npm-payment-message','err','No se pudo cargar el pago del alumno.');
    document.getElementById('npm-payment-back')?.classList.add('show');
  }
}

function closePaymentModal(){
  if(busy) return;
  document.getElementById('npm-payment-back')?.classList.remove('show');
  paymentRecord = null;
}

async function savePayment(event){
  event.preventDefault();
  if(busy || !currentUser || !paymentRecord) return;
  const amount = num(document.getElementById('npm-payment-amount')?.value);
  const date = clean(document.getElementById('npm-payment-date')?.value);
  const category = categoryFor(paymentRecord,clean(document.getElementById('npm-payment-category')?.value));
  const account = clean(document.getElementById('npm-payment-account')?.value);
  const conceptBase = clean(document.getElementById('npm-payment-concept')?.value);
  const operation = clean(document.getElementById('npm-payment-operation')?.value);
  const note = clean(document.getElementById('npm-payment-note')?.value);
  if(amount <= 0 || amount > 1000000) return setMessage('npm-payment-message','err','Ingresa un monto válido mayor que cero.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayIso()) return setMessage('npm-payment-message','err','Selecciona una fecha de pago válida.');
  if(!ACCOUNTS.some(item => item[0] === account)) return setMessage('npm-payment-message','err','Selecciona la cuenta que recibió el dinero.');
  if(conceptBase.length < 3) return setMessage('npm-payment-message','err','Escribe el concepto del pago.');
  if(operation.length < 3) return setMessage('npm-payment-message','err','Escribe el número de operación o una referencia de caja.');

  try{
    busy = true;
    const save = document.getElementById('npm-payment-save');
    if(save){ save.disabled = true; save.textContent = 'Registrando pago...'; }
    setMessage('npm-payment-message','info','Guardando el pago y el ingreso financiero en una sola operación...');

    const freshSnapshot = await getDoc(doc(db,PRE_COLLECTION,paymentRecord.id));
    if(!freshSnapshot.exists()) throw new Error('Preinscripción no encontrada');
    const fresh = {id:freshSnapshot.id,...freshSnapshot.data()};
    const movementId = `pago_${fresh.id}_inicial`;
    const movementRef = doc(db,FINANCE_COLLECTION,movementId);
    const existingMovement = await getDoc(movementRef);
    if(existingMovement.exists() || clean(fresh.ingresoFinancieroId)){
      throw Object.assign(new Error('El pago ya fue integrado.'),{code:'already-exists'});
    }

    const group = groupFor(fresh);
    const method = paymentMethodForAccount(account);
    const concept = `${conceptBase} · ${clean(fresh.nombre)}`.slice(0,160);
    const observation = [`Alumno: ${clean(fresh.nombre)}`,`DNI: ${clean(fresh.dni)}`,`Preinscripción: ${fresh.id}`,note].filter(Boolean).join(' · ').slice(0,1000);
    const email = currentUser.email || ADMIN_EMAIL;
    const batch = writeBatch(db);

    batch.set(movementRef,{
      tipo:'ingreso',
      fechaOperacion:date,
      categoria:category,
      concepto:concept,
      monto:amount,
      metodoPago:method,
      cuenta:account,
      numeroOperacion:operation,
      observacion:observation,
      estado:'activo',
      origen:'pago_alumno_admin',
      creadoPor:email,
      pagoId:movementId,
      preinscripcionId:fresh.id,
      registroAlumnoId:fresh.id,
      matriculaId:fresh.id,
      grupoId:group.id,
      alumnoNombre:clean(fresh.nombre),
      alumnoDni:clean(fresh.dni),
      conceptoPago:conceptBase.slice(0,150),
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });

    batch.update(doc(db,PRE_COLLECTION,fresh.id),{
      estadoPago:'pago_validado',
      pagoValidado:true,
      estado:fresh.matriculaAprobada === true ? 'matriculado' : 'listo_para_matricula',
      pagoObservacion:note || 'Pago validado e integrado con Finanzas.',
      pagoValidadoPor:email,
      pagoValidadoAt:serverTimestamp(),
      montoPagoValidado:amount,
      fechaPagoValidado:date,
      cuentaPagoValidado:account,
      metodoPagoValidado:method,
      numeroOperacionPago:operation,
      ingresoFinancieroId:movementId,
      ingresoFinancieroGenerado:true,
      registroAlumnoId:fresh.id,
      matriculaId:fresh.id,
      grupoId:group.id,
      grupoNombre:group.nombre,
      salonNombre:group.salonNombre,
      updatedAt:serverTimestamp()
    });

    batch.set(doc(db,STUDENT_COLLECTION,fresh.id),{
      registroAlumnoId:fresh.id,
      preinscripcionId:fresh.id,
      matriculaId:fresh.id,
      alumnoNombre:clean(fresh.nombre),
      dni:clean(fresh.dni),
      celular:clean(fresh.celular),
      correo:clean(fresh.correo),
      grupoId:group.id,
      grupoNombre:group.nombre,
      salonNombre:group.salonNombre,
      programaId:clean(fresh.programaId),
      programaNombre:clean(fresh.ciclo),
      planId:clean(fresh.planId),
      planNombre:clean(fresh.planNombre),
      modalidad:clean(fresh.modalidad),
      turno:clean(fresh.turno),
      estadoAcademico:fresh.matriculaAprobada === true ? 'matriculado' : 'pago_validado',
      estadoPago:'pago_validado',
      pagoValidado:true,
      ingresoFinancieroId:movementId,
      pagoFinanzasEstado:'registrado',
      montoPagoValidado:amount,
      fechaPagoValidado:date,
      numeroOperacionPago:operation,
      origen:'preinscripcion_web',
      actualizadoPor:email,
      updatedAt:serverTimestamp()
    },{merge:true});

    batch.set(doc(db,GROUP_COLLECTION,group.id),{
      ...group,
      actualizadoPor:email,
      updatedAt:serverTimestamp()
    },{merge:true});

    await batch.commit();
    setMessage('npm-payment-message','ok',`Pago validado e ingreso registrado en ${accountLabel(account)} por ${money(amount)}.`);
    document.getElementById('refresh-btn')?.click();
    await loadAll();
    setTimeout(closePaymentModal,750);
  }catch(error){
    console.error(error);
    const text = error?.code === 'already-exists'
      ? 'Este pago ya tiene un ingreso financiero. No se creó un duplicado.'
      : error?.code === 'permission-denied'
        ? 'Firebase rechazó la integración. Deben publicarse las nuevas reglas de Firestore.'
        : 'No se pudo registrar el pago y el ingreso. Inténtalo nuevamente.';
    setMessage('npm-payment-message','err',text);
  }finally{
    busy = false;
    const save = document.getElementById('npm-payment-save');
    if(save){ save.disabled = false; save.textContent = 'Confirmar pago e ingreso'; }
  }
}

async function approveEnrollment(id){
  if(busy || !currentUser || !id) return;
  const modalMessage = document.getElementById('modal-message');
  try{
    busy = true;
    if(modalMessage){ modalMessage.className = 'msg info'; modalMessage.textContent = 'Verificando pago y creando matrícula oficial...'; }
    const snapshot = await getDoc(doc(db,PRE_COLLECTION,id));
    if(!snapshot.exists()) throw new Error('Preinscripción no encontrada');
    const record = {id:snapshot.id,...snapshot.data()};
    if(record.matriculaAprobada === true || record.estado === 'matriculado'){
      if(modalMessage){ modalMessage.className = 'msg ok'; modalMessage.textContent = 'El alumno ya está matriculado.'; }
      return;
    }
    if(!(record.pagoValidado === true || record.estadoPago === 'pago_validado')) throw Object.assign(new Error('Pago no validado'),{code:'payment-required'});
    if(!clean(record.ingresoFinancieroId)) throw Object.assign(new Error('Ingreso financiero pendiente'),{code:'finance-required'});
    if(!confirm(`¿Aprobar la matrícula de ${clean(record.nombre)} en su grupo asignado?`)) return;

    const group = groupFor(record);
    const email = currentUser.email || ADMIN_EMAIL;
    const batch = writeBatch(db);
    batch.set(doc(db,ENROLLMENT_COLLECTION,id),{
      matriculaId:id,
      preinscripcionId:id,
      registroAlumnoId:id,
      alumnoNombre:clean(record.nombre),
      dni:clean(record.dni),
      celular:clean(record.celular),
      correo:clean(record.correo),
      grupoId:group.id,
      grupoNombre:group.nombre,
      salonNombre:group.salonNombre,
      programaId:clean(record.programaId),
      programaNombre:clean(record.ciclo),
      planId:clean(record.planId),
      planNombre:clean(record.planNombre),
      modalidad:clean(record.modalidad),
      turno:clean(record.turno),
      ingresoFinancieroId:clean(record.ingresoFinancieroId),
      montoPagoValidado:num(record.montoPagoValidado || record.montoPagoInicial || record.totalInicial),
      estado:'activo',
      fechaMatricula:todayIso(),
      matriculadoPor:email,
      matriculadoAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    },{merge:true});
    batch.update(doc(db,PRE_COLLECTION,id),{
      estado:'matriculado',
      matriculaAprobada:true,
      matriculaId:id,
      registroAlumnoId:id,
      grupoId:group.id,
      grupoNombre:group.nombre,
      salonNombre:group.salonNombre,
      matriculadoPor:email,
      matriculadoAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    batch.set(doc(db,STUDENT_COLLECTION,id),{
      registroAlumnoId:id,
      preinscripcionId:id,
      matriculaId:id,
      alumnoNombre:clean(record.nombre),
      dni:clean(record.dni),
      celular:clean(record.celular),
      correo:clean(record.correo),
      grupoId:group.id,
      grupoNombre:group.nombre,
      salonNombre:group.salonNombre,
      programaId:clean(record.programaId),
      programaNombre:clean(record.ciclo),
      planId:clean(record.planId),
      planNombre:clean(record.planNombre),
      modalidad:clean(record.modalidad),
      turno:clean(record.turno),
      estadoAcademico:'matriculado',
      estadoPago:'pago_validado',
      pagoValidado:true,
      ingresoFinancieroId:clean(record.ingresoFinancieroId),
      pagoFinanzasEstado:'registrado',
      matriculadoPor:email,
      matriculadoAt:serverTimestamp(),
      actualizadoPor:email,
      updatedAt:serverTimestamp()
    },{merge:true});
    batch.set(doc(db,GROUP_COLLECTION,group.id),{
      ...group,
      actualizadoPor:email,
      updatedAt:serverTimestamp()
    },{merge:true});
    await batch.commit();
    if(modalMessage){ modalMessage.className = 'msg ok'; modalMessage.textContent = `Matrícula aprobada y alumno incorporado a ${group.salonNombre}.`; }
    document.getElementById('refresh-btn')?.click();
    await loadAll();
  }catch(error){
    console.error(error);
    let text = 'No se pudo aprobar la matrícula.';
    if(error?.code === 'payment-required') text = 'Primero debes validar el pago del alumno.';
    if(error?.code === 'finance-required') text = 'El pago está validado, pero falta generar su ingreso financiero. Regularízalo desde Alumnos, pagos y salones.';
    if(error?.code === 'permission-denied') text = 'Firebase rechazó la matrícula. Deben publicarse las nuevas reglas de Firestore.';
    if(modalMessage){ modalMessage.className = 'msg err'; modalMessage.textContent = text; }
  }finally{
    busy = false;
  }
}

function openOriginalFicha(id){
  selectedRecordId = id;
  const temp = document.createElement('button');
  temp.type = 'button';
  temp.hidden = true;
  temp.dataset.open = id;
  document.body.appendChild(temp);
  temp.click();
  temp.remove();
}

function initialize(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if(setup() || attempts > 80) clearInterval(timer);
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser){
    setup();
    loadAll();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
