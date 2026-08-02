/* ==================================================
   Grupo Nostradamus - Cronograma económico por alumno
   Cuotas manuales, vencimientos, abonos parciales y Finanzas.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  limit,
  writeBatch,
  runTransaction
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
const PAYMENT_COLLECTION = 'alumno_abonos';
const FINANCE_COLLECTION = 'finanzas_movimientos';
const MIN_DATE = '2026-01-01';
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
let currentRecordId = '';
let currentRecord = null;
let installments = [];
let selectedInstallment = null;
let busy = false;

function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
function esc(value){
  return clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function cents(value){ return Math.round(num(value) * 100); }
function amountFromCents(value){ return Math.round(Number(value || 0)) / 100; }
function money(value){ return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value)); }
function moneyCents(value){ return money(amountFromCents(value)); }
function todayIso(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}
function isMatriculated(record){ return record?.matriculaAprobada === true || record?.estado === 'matriculado'; }
function accountLabel(value){ return ACCOUNTS.find(item => item[0] === value)?.[1] || value || '-'; }
function paymentMethodForAccount(account){
  return ({caja_efectivo:'efectivo',yape:'yape',plin:'plin',bcp:'transferencia',culqi:'culqi',otra:'otro'})[account] || 'otro';
}
function financeCategory(concept){
  const normalized = clean(concept).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(normalized.includes('matricula')) return 'matricula';
  if(normalized.includes('pension') || normalized.includes('cuota')) return 'pension';
  return 'otros_ingresos';
}
function statusFor(item){
  if(item.estado === 'pagada') return 'pagada';
  if(item.estado === 'parcial') return 'parcial';
  if(item.estado === 'anulada') return 'anulada';
  if(clean(item.fechaVencimiento) && item.fechaVencimiento < todayIso()) return 'vencida';
  return 'pendiente';
}
function statusLabel(value){
  return ({pendiente:'Pendiente',parcial:'Pago parcial',pagada:'Pagada',vencida:'Vencida',anulada:'Anulada'})[value] || value;
}
function message(type,text){
  const el = document.getElementById('student-price-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.textContent = text;
}
function paymentMessage(type,text){
  const el = document.getElementById('student-installment-payment-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.textContent = text;
}

function injectStyles(){
  if(document.getElementById('student-payment-schedule-styles')) return;
  const style = document.createElement('style');
  style.id = 'student-payment-schedule-styles';
  style.textContent = `
    #student-price-panel{margin:18px 0;padding:18px;border-radius:22px;background:linear-gradient(180deg,#f8fdff,#fff);border:1px solid rgba(7,140,149,.18)}
    #student-price-panel h3{font-family:'Baloo 2';font-size:29px;line-height:1;color:#061426;margin:0 0 5px}
    #student-price-panel>p{margin:0 0 13px;color:#526170;line-height:1.5}
    .student-price-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.student-price-grid .wide{grid-column:1/-1}
    .student-price-reference{grid-column:1/-1;padding:11px 12px;border-radius:14px;background:#eef8fa;color:#075b65;font-weight:850}
    .student-price-actions{display:flex;justify-content:flex-end;margin-top:10px}.student-price-actions .btn{min-width:220px}
    .student-schedule-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:17px 0 12px}.student-schedule-summary article{padding:12px 13px;border:1px solid #dfecef;border-radius:15px;background:#fff}.student-schedule-summary span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase}.student-schedule-summary strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:22px;line-height:1}.student-schedule-summary .paid strong{color:#14855a}.student-schedule-summary .pending strong{color:#b45309}.student-schedule-summary .late strong{color:#b42318}
    .student-schedule-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:15px 0 9px}.student-schedule-head h4{margin:0;color:#061426;font-family:'Baloo 2';font-size:24px;line-height:1}.student-schedule-head p{margin:4px 0 0;color:#647482;font-size:11px}
    .student-installment-form{display:grid;grid-template-columns:minmax(220px,1.3fr) minmax(130px,.55fr) minmax(155px,.65fr) auto;gap:9px;margin-bottom:12px;padding:12px;border:1px solid #dfecef;border-radius:16px;background:#fbfdfe}.student-installment-form input{width:100%;border:1px solid #d9e7eb;border-radius:11px;padding:10px;background:#fff;font:inherit;font-size:12px}.student-installment-form .btn{padding:9px 13px;font-size:11px;white-space:nowrap}
    .student-installment-table table{min-width:780px}.student-installment-table th{font-size:9px}.student-installment-table td{font-size:11px}.student-installment-status{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:950;text-transform:uppercase}.student-installment-status.pendiente{background:#fff8e8;color:#8a4c00}.student-installment-status.parcial{background:#eef8fa;color:#075b65}.student-installment-status.pagada{background:#eaf9f1;color:#14855a}.student-installment-status.vencida{background:#fff0ef;color:#b42318}.student-installment-action{border:1px solid #078c95;border-radius:999px;padding:7px 10px;background:#078c95;color:#fff;font:inherit;font-size:9px;font-weight:950;cursor:pointer}.student-installment-action:disabled{opacity:.45;cursor:not-allowed}
    .student-price-warning{margin-top:11px;padding:11px 12px;border-radius:14px;background:#fff8e8;color:#6a4700;font-weight:800;border:1px solid rgba(255,148,30,.25);font-size:11px;line-height:1.45}
    .student-payment-back{position:fixed;inset:0;z-index:10250;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,7,13,.7)}.student-payment-back.show{display:flex}.student-payment-modal{width:min(720px,96vw);max-height:92vh;overflow:auto;padding:22px;border-radius:23px;background:#fff;box-shadow:0 30px 90px rgba(2,7,13,.35)}.student-payment-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.student-payment-modal-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:31px;line-height:1}.student-payment-modal-head p{margin:4px 0 0;color:#647482;font-size:11px}.student-payment-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.student-payment-modal-grid .wide{grid-column:1/-1}.student-payment-modal-grid label span{display:block;margin-bottom:5px;color:#061426;font-size:9px;font-weight:950;text-transform:uppercase}.student-payment-modal-grid input,.student-payment-modal-grid select,.student-payment-modal-grid textarea{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;font:inherit;font-size:12px}.student-payment-modal-grid textarea{min-height:74px;resize:vertical}.student-payment-target{margin-bottom:12px;padding:12px;border:1px solid #dce9ed;border-radius:14px;background:#f5fbfc;color:#526170;font-size:11px;line-height:1.5}.student-payment-target strong{color:#061426}.student-payment-modal-actions{display:flex;justify-content:flex-end;margin-top:12px}.student-payment-modal-actions .btn{min-width:220px}
    @media(max-width:760px){.student-price-grid,.student-schedule-summary,.student-installment-form,.student-payment-modal-grid{grid-template-columns:1fr}.student-price-grid .wide,.student-payment-modal-grid .wide{grid-column:auto}.student-price-actions .btn,.student-payment-modal-actions .btn{width:100%}.student-schedule-head{display:block}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  if(document.getElementById('student-price-panel')) return;
  injectStyles();
  const modalGrid = document.querySelector('#modal-back .admin-grid');
  if(!modalGrid) return;
  const panel = document.createElement('section');
  panel.id = 'student-price-panel';
  panel.innerHTML = `
    <h3>Condiciones económicas y cronograma de cuotas</h3>
    <p>Configura manualmente las cuotas, sus vencimientos y los pagos recibidos. Cada abono confirmado genera su ingreso en Finanzas.</p>
    <div class="student-price-grid">
      <div class="student-price-reference" id="student-price-reference">Abre la ficha de un alumno matriculado.</div>
      <label class="field"><span>Plan asignado</span><input id="student-plan-name" placeholder="Ej. Presencial - FULL"></label>
      <label class="field"><span>Pensión mensual acordada (S/)</span><input id="student-monthly-price" type="number" min="0" step="0.01" placeholder="0.00"></label>
      <label class="field wide"><span>Motivo o condición especial</span><input id="student-price-reason" placeholder="Ej. convenio, beca parcial o descuento por hermanos"></label>
    </div>
    <div class="student-price-actions"><button class="btn btn-green" type="button" id="student-price-save">Guardar condiciones generales</button></div>
    <div class="student-schedule-summary">
      <article><span>Total programado</span><strong id="student-total-scheduled">S/ 0.00</strong></article>
      <article class="paid"><span>Total pagado</span><strong id="student-total-paid">S/ 0.00</strong></article>
      <article class="pending"><span>Saldo pendiente</span><strong id="student-total-pending">S/ 0.00</strong></article>
      <article class="late"><span>Cuotas vencidas</span><strong id="student-total-late">0</strong></article>
    </div>
    <div class="student-schedule-head"><div><h4>Cronograma manual</h4><p>Agrega cada concepto con su monto y fecha de vencimiento.</p></div></div>
    <form class="student-installment-form" id="student-installment-form">
      <input id="student-installment-concept" placeholder="Ej. Pensión agosto" maxlength="150" required>
      <input id="student-installment-amount" type="number" min="0.01" step="0.01" placeholder="Monto S/" required>
      <input id="student-installment-date" type="date" min="2026-01-01" required>
      <button class="btn btn-blue" type="submit">Agregar cuota</button>
    </form>
    <div class="table-wrap student-installment-table"><table><thead><tr><th>N.°</th><th>Concepto</th><th>Vencimiento</th><th>Programado</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="student-installment-rows"><tr><td colspan="8">Abre la ficha de un alumno matriculado.</td></tr></tbody></table></div>
    <div class="student-price-warning">Los pagos confirmados no se eliminan ni se sobrescriben. Las correcciones financieras deberán realizarse mediante anulación y un nuevo registro.</div>
    <div class="msg" id="student-price-message"></div>`;
  modalGrid.insertAdjacentElement('afterend',panel);

  const paymentBack = document.createElement('div');
  paymentBack.id = 'student-installment-payment-back';
  paymentBack.className = 'student-payment-back';
  paymentBack.innerHTML = `
    <section class="student-payment-modal" role="dialog" aria-modal="true" aria-labelledby="student-payment-title">
      <div class="student-payment-modal-head"><div><h3 id="student-payment-title">Registrar pago de cuota</h3><p>El abono actualizará la cuota y generará un ingreso en Finanzas.</p></div><button type="button" class="btn btn-light" id="student-installment-payment-close">Cerrar</button></div>
      <div class="student-payment-target" id="student-installment-payment-target"></div>
      <form id="student-installment-payment-form">
        <div class="student-payment-modal-grid">
          <label><span>Monto recibido (S/)</span><input id="student-installment-payment-amount" type="number" min="0.01" step="0.01" required></label>
          <label><span>Fecha real de pago</span><input id="student-installment-payment-date" type="date" min="2026-01-01" required></label>
          <label><span>Cuenta receptora</span><select id="student-installment-payment-account">${ACCOUNTS.map(item => `<option value="${item[0]}">${item[1]}</option>`).join('')}</select></label>
          <label><span>Número de operación o referencia</span><input id="student-installment-payment-operation" maxlength="100" placeholder="Ej. 847251 o CAJA-001" required></label>
          <label class="wide"><span>Observación</span><textarea id="student-installment-payment-note" maxlength="1000" placeholder="Detalle opcional del pago"></textarea></label>
        </div>
        <div class="student-payment-modal-actions"><button class="btn btn-green" type="submit" id="student-installment-payment-save">Confirmar abono e ingreso</button></div>
        <div class="msg" id="student-installment-payment-message"></div>
      </form>
    </section>`;
  document.body.appendChild(paymentBack);

  document.getElementById('student-price-save').addEventListener('click',saveEconomicTerms);
  document.getElementById('student-installment-form').addEventListener('submit',addInstallment);
  document.getElementById('student-installment-rows').addEventListener('click',event => {
    const button = event.target.closest('[data-installment-pay]');
    if(button) openInstallmentPayment(button.dataset.installmentPay);
  });
  document.getElementById('student-installment-payment-close').addEventListener('click',closeInstallmentPayment);
  paymentBack.addEventListener('click',event => { if(event.target === paymentBack) closeInstallmentPayment(); });
  document.getElementById('student-installment-payment-form').addEventListener('submit',saveInstallmentPayment);
}

function setDisabled(disabled){
  [
    'student-plan-name','student-monthly-price','student-price-reason','student-price-save',
    'student-installment-concept','student-installment-amount','student-installment-date'
  ].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = disabled; });
  const submit = document.querySelector('#student-installment-form button[type="submit"]');
  if(submit) submit.disabled = disabled;
}

async function officialReference(record){
  const reference = document.getElementById('student-price-reference');
  if(!reference) return;
  reference.textContent = 'Consultando el precio oficial del plan...';
  const programId = clean(record.programaId);
  const planId = clean(record.planId);
  if(!programId){
    reference.textContent = 'Precio oficial no vinculado. Puedes establecer las condiciones manualmente.';
    return;
  }
  try{
    const snap = await getDoc(doc(db,'programas_publicos',programId));
    const data = snap.exists() ? snap.data() : {};
    const plans = Array.isArray(data.planes) ? data.planes : [];
    const plan = plans.find(item => clean(item.id) === planId) ||
      plans.find(item => clean(item.nombre).toLowerCase() === clean(record.planNombre || record.planAsignado).toLowerCase());
    reference.textContent = plan
      ? `Precio oficial de ${plan.nombre}: ${money(plan.precio)} ${plan.tipoCobro === 'unico' ? 'pago único' : 'mensual'}${num(plan.matricula) > 0 ? ' · Matrícula: ' + money(plan.matricula) : ''}`
      : 'No se encontró el plan exacto en el tarifario. Puedes establecer el acuerdo manualmente.';
  }catch(error){
    console.warn('No se pudo consultar el precio oficial:',error);
    reference.textContent = 'No se pudo consultar el tarifario en este momento.';
  }
}

async function loadInstallments(id){
  const snapshot = await getDocs(query(
    collection(db,INSTALLMENT_COLLECTION),
    where('preinscripcionId','==',id),
    limit(100)
  ));
  installments = snapshot.docs.map(item => ({id:item.id,...item.data()})).sort((a,b) => {
    const byDate = clean(a.fechaVencimiento).localeCompare(clean(b.fechaVencimiento));
    return byDate || Number(a.numeroCuota || 0) - Number(b.numeroCuota || 0);
  });
  renderInstallments();
}

function renderInstallments(){
  const rows = document.getElementById('student-installment-rows');
  if(!rows) return;
  const totalScheduled = installments.filter(item => item.estado !== 'anulada').reduce((sum,item) => sum + Number(item.montoProgramadoCentimos || 0),0);
  const totalPaid = installments.filter(item => item.estado !== 'anulada').reduce((sum,item) => sum + Number(item.montoPagadoCentimos || 0),0);
  const totalPending = Math.max(0,totalScheduled-totalPaid);
  const late = installments.filter(item => statusFor(item) === 'vencida').length;
  document.getElementById('student-total-scheduled').textContent = moneyCents(totalScheduled);
  document.getElementById('student-total-paid').textContent = moneyCents(totalPaid);
  document.getElementById('student-total-pending').textContent = moneyCents(totalPending);
  document.getElementById('student-total-late').textContent = String(late);

  if(!installments.length){
    rows.innerHTML = '<tr><td colspan="8">Todavía no hay cuotas programadas para este alumno.</td></tr>';
    return;
  }
  rows.innerHTML = installments.map((item,index) => {
    const status = statusFor(item);
    const balance = Number(item.saldoPendienteCentimos || 0);
    const disabled = status === 'pagada' || status === 'anulada' || balance <= 0;
    return `<tr>
      <td>${Number(item.numeroCuota || index+1)}</td>
      <td><b>${esc(item.concepto)}</b></td>
      <td>${dateLabel(item.fechaVencimiento)}</td>
      <td>${moneyCents(item.montoProgramadoCentimos)}</td>
      <td>${moneyCents(item.montoPagadoCentimos)}</td>
      <td><b>${moneyCents(balance)}</b></td>
      <td><span class="student-installment-status ${status}">${statusLabel(status)}</span></td>
      <td><button type="button" class="student-installment-action" data-installment-pay="${esc(item.id)}" ${disabled ? 'disabled' : ''}>Registrar pago</button></td>
    </tr>`;
  }).join('');
}

async function loadRecord(id){
  if(!currentUser || !id) return;
  ensurePanel();
  currentRecordId = id;
  currentRecord = null;
  installments = [];
  renderInstallments();
  message('info','Cargando condiciones económicas y cronograma...');
  try{
    const snap = await getDoc(doc(db,'preinscripciones',id));
    if(!snap.exists()) throw new Error('Registro no encontrado');
    currentRecord = {id:snap.id,...snap.data()};
    const enabled = isMatriculated(currentRecord);
    document.getElementById('student-plan-name').value = currentRecord.planAsignado || currentRecord.planNombre || '';
    document.getElementById('student-monthly-price').value = num(currentRecord.pensionAcordada) || '';
    document.getElementById('student-price-reason').value = '';
    document.getElementById('student-installment-date').min = MIN_DATE;
    setDisabled(!enabled);
    await Promise.all([officialReference(currentRecord),loadInstallments(id)]);
    message(enabled ? 'ok' : 'info',enabled
      ? 'Puedes agregar cuotas y registrar sus pagos manualmente.'
      : 'El cronograma se habilitará cuando la matrícula sea aprobada.');
  }catch(error){
    console.error(error);
    setDisabled(true);
    message('err','No se pudieron cargar las condiciones económicas.');
  }
}

async function saveEconomicTerms(){
  if(busy || !currentUser || !currentRecordId || !currentRecord) return;
  if(!isMatriculated(currentRecord)) return message('err','Primero debes aprobar la matrícula del alumno.');
  const planAsignado = clean(document.getElementById('student-plan-name').value);
  const pensionAcordada = num(document.getElementById('student-monthly-price').value);
  const motivo = clean(document.getElementById('student-price-reason').value);
  if((planAsignado || pensionAcordada > 0) && motivo.length < 3){
    return message('err','Escribe brevemente el motivo o condición del acuerdo.');
  }
  const entry = {
    fecha:new Date().toISOString(),
    administrador:currentUser.email || ADMIN_EMAIL,
    motivo:motivo || 'Actualización administrativa',
    anterior:{planAsignado:clean(currentRecord.planAsignado || currentRecord.planNombre),pensionAcordada:num(currentRecord.pensionAcordada)},
    nuevo:{planAsignado,pensionAcordada}
  };
  if(!confirm('¿Guardar estas condiciones económicas generales?')) return;
  try{
    busy = true;
    message('info','Guardando condiciones generales...');
    await updateDoc(doc(db,'preinscripciones',currentRecordId),{
      planAsignado,
      pensionAcordada,
      ajustePagoMotivo:motivo,
      ajustePagoActualizadoPor:currentUser.email || ADMIN_EMAIL,
      ajustePagoUpdatedAt:serverTimestamp(),
      ajustesPagoHistorial:arrayUnion(entry),
      updatedAt:serverTimestamp()
    });
    message('ok','Condiciones generales guardadas.');
    await loadRecord(currentRecordId);
  }catch(error){
    console.error(error);
    message('err','No se pudo guardar el acuerdo. Revisa los permisos de Firebase.');
  }finally{ busy = false; }
}

async function addInstallment(event){
  event.preventDefault();
  if(busy || !currentUser || !currentRecordId || !currentRecord) return;
  if(!isMatriculated(currentRecord)) return message('err','Primero debes aprobar la matrícula del alumno.');
  const concept = clean(document.getElementById('student-installment-concept').value);
  const amount = cents(document.getElementById('student-installment-amount').value);
  const dueDate = clean(document.getElementById('student-installment-date').value);
  if(concept.length < 3) return message('err','Escribe el concepto de la cuota.');
  if(amount <= 0 || amount > 100000000) return message('err','Ingresa un monto válido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < MIN_DATE) return message('err','Selecciona una fecha de vencimiento válida.');
  try{
    busy = true;
    message('info','Agregando cuota al cronograma...');
    const installmentRef = doc(collection(db,INSTALLMENT_COLLECTION));
    const email = currentUser.email || ADMIN_EMAIL;
    const groupId = clean(currentRecord.grupoId) || 'grupo-por-confirmar';
    const batch = writeBatch(db);
    batch.set(installmentRef,{
      cuotaId:installmentRef.id,
      preinscripcionId:currentRecordId,
      registroAlumnoId:currentRecordId,
      matriculaId:currentRecordId,
      alumnoNombre:clean(currentRecord.nombre),
      alumnoDni:clean(currentRecord.dni),
      grupoId,
      concepto:concept,
      numeroCuota:installments.length + 1,
      montoProgramadoCentimos:amount,
      montoPagadoCentimos:0,
      saldoPendienteCentimos:amount,
      fechaVencimiento:dueDate,
      estado:'pendiente',
      origen:'cronograma_manual_admin',
      creadoPor:email,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    batch.update(doc(db,'preinscripciones',currentRecordId),{
      cronogramaCuotasActivo:true,
      cronogramaActualizadoPor:email,
      cronogramaUpdatedAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    await batch.commit();
    document.getElementById('student-installment-form').reset();
    message('ok',`Cuota “${concept}” agregada con vencimiento ${dateLabel(dueDate)}.`);
    await loadInstallments(currentRecordId);
  }catch(error){
    console.error(error);
    message('err',error?.code === 'permission-denied'
      ? 'Firebase todavía no autorizó el cronograma. Deben publicarse las nuevas reglas.'
      : 'No se pudo agregar la cuota.');
  }finally{ busy = false; }
}

function openInstallmentPayment(id){
  const installment = installments.find(item => item.id === id);
  if(!installment || Number(installment.saldoPendienteCentimos || 0) <= 0) return;
  selectedInstallment = installment;
  const balance = amountFromCents(installment.saldoPendienteCentimos);
  document.getElementById('student-installment-payment-target').innerHTML = `<strong>${esc(installment.concepto)}</strong><br>Vencimiento: ${dateLabel(installment.fechaVencimiento)} · Saldo pendiente: ${money(balance)}`;
  document.getElementById('student-installment-payment-amount').value = balance.toFixed(2);
  document.getElementById('student-installment-payment-amount').max = balance.toFixed(2);
  document.getElementById('student-installment-payment-date').value = todayIso();
  document.getElementById('student-installment-payment-date').max = todayIso();
  document.getElementById('student-installment-payment-account').value = 'yape';
  document.getElementById('student-installment-payment-operation').value = '';
  document.getElementById('student-installment-payment-note').value = '';
  paymentMessage('info','Confirma el monto recibido, la cuenta y la referencia de la operación.');
  document.getElementById('student-installment-payment-back').classList.add('show');
}

function closeInstallmentPayment(){
  if(busy) return;
  document.getElementById('student-installment-payment-back')?.classList.remove('show');
  selectedInstallment = null;
}

async function saveInstallmentPayment(event){
  event.preventDefault();
  if(busy || !currentUser || !currentRecord || !selectedInstallment) return;
  const amount = cents(document.getElementById('student-installment-payment-amount').value);
  const paymentDate = clean(document.getElementById('student-installment-payment-date').value);
  const account = clean(document.getElementById('student-installment-payment-account').value);
  const operation = clean(document.getElementById('student-installment-payment-operation').value);
  const note = clean(document.getElementById('student-installment-payment-note').value);
  if(amount <= 0) return paymentMessage('err','Ingresa un monto mayor que cero.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate) || paymentDate < MIN_DATE || paymentDate > todayIso()) return paymentMessage('err','Selecciona una fecha real de pago válida.');
  if(!ACCOUNTS.some(item => item[0] === account)) return paymentMessage('err','Selecciona la cuenta que recibió el dinero.');
  if(operation.length < 3) return paymentMessage('err','Escribe el número de operación o una referencia de caja.');

  try{
    busy = true;
    const save = document.getElementById('student-installment-payment-save');
    save.disabled = true;
    save.textContent = 'Registrando abono...';
    paymentMessage('info','Actualizando la cuota y creando el ingreso financiero...');

    const paymentRef = doc(collection(db,PAYMENT_COLLECTION));
    const movementRef = doc(db,FINANCE_COLLECTION,`abono_${paymentRef.id}`);
    const installmentRef = doc(db,INSTALLMENT_COLLECTION,selectedInstallment.id);
    const preRef = doc(db,'preinscripciones',currentRecordId);
    const email = currentUser.email || ADMIN_EMAIL;

    await runTransaction(db,async transaction => {
      const [installmentSnapshot,movementSnapshot] = await Promise.all([
        transaction.get(installmentRef),
        transaction.get(movementRef)
      ]);
      if(!installmentSnapshot.exists()) throw Object.assign(new Error('Cuota no encontrada'),{code:'not-found'});
      if(movementSnapshot.exists()) throw Object.assign(new Error('Abono duplicado'),{code:'already-exists'});
      const fresh = installmentSnapshot.data();
      const balance = Number(fresh.saldoPendienteCentimos || 0);
      if(!['pendiente','parcial'].includes(clean(fresh.estado)) || balance <= 0) throw Object.assign(new Error('Cuota ya cerrada'),{code:'failed-precondition'});
      if(amount > balance) throw Object.assign(new Error('Monto mayor al saldo'),{code:'amount-exceeded'});
      const newPaid = Number(fresh.montoPagadoCentimos || 0) + amount;
      const newBalance = Number(fresh.montoProgramadoCentimos || 0) - newPaid;
      const newStatus = newBalance === 0 ? 'pagada' : 'parcial';
      const concept = clean(fresh.concepto);
      const method = paymentMethodForAccount(account);
      const observation = [
        `Alumno: ${clean(currentRecord.nombre)}`,
        `DNI: ${clean(currentRecord.dni)}`,
        `Cuota: ${concept}`,
        `Vencimiento: ${clean(fresh.fechaVencimiento)}`,
        note
      ].filter(Boolean).join(' · ').slice(0,1000);

      transaction.update(installmentRef,{
        montoPagadoCentimos:newPaid,
        saldoPendienteCentimos:newBalance,
        estado:newStatus,
        ultimoAbonoId:paymentRef.id,
        ultimoPagoAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      transaction.set(paymentRef,{
        abonoId:paymentRef.id,
        cuotaId:selectedInstallment.id,
        preinscripcionId:currentRecordId,
        registroAlumnoId:currentRecordId,
        matriculaId:currentRecordId,
        alumnoNombre:clean(currentRecord.nombre),
        alumnoDni:clean(currentRecord.dni),
        concepto:concept,
        montoCentimos:amount,
        fechaPago:paymentDate,
        cuenta:account,
        metodoPago:method,
        numeroOperacion:operation,
        observacion:note.slice(0,1000),
        movimientoFinancieroId:movementRef.id,
        estado:'activo',
        origen:'abono_cuota_admin',
        registradoPor:email,
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      transaction.set(movementRef,{
        tipo:'ingreso',
        fechaOperacion:paymentDate,
        categoria:financeCategory(concept),
        concepto:`${concept} · ${clean(currentRecord.nombre)}`.slice(0,160),
        monto:amountFromCents(amount),
        metodoPago:method,
        cuenta:account,
        numeroOperacion:operation,
        observacion,
        estado:'activo',
        origen:'abono_cuota_admin',
        creadoPor:email,
        pagoId:movementRef.id,
        cuotaId:selectedInstallment.id,
        abonoId:paymentRef.id,
        preinscripcionId:currentRecordId,
        registroAlumnoId:currentRecordId,
        matriculaId:currentRecordId,
        grupoId:clean(currentRecord.grupoId) || 'grupo-por-confirmar',
        alumnoNombre:clean(currentRecord.nombre),
        alumnoDni:clean(currentRecord.dni),
        conceptoPago:concept.slice(0,150),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      transaction.update(preRef,{
        ultimoAbonoCuotaId:paymentRef.id,
        ultimoAbonoCuotaMonto:amountFromCents(amount),
        ultimoAbonoCuotaFecha:paymentDate,
        cronogramaActualizadoPor:email,
        cronogramaUpdatedAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    });

    paymentMessage('ok',`Abono de ${moneyCents(amount)} registrado en ${accountLabel(account)} e integrado con Finanzas.`);
    await loadInstallments(currentRecordId);
    window.setTimeout(closeInstallmentPayment,850);
  }catch(error){
    console.error(error);
    const text = error?.code === 'amount-exceeded'
      ? 'El monto supera el saldo pendiente de la cuota.'
      : error?.code === 'permission-denied'
        ? 'Firebase todavía no autorizó cuotas y abonos. Deben publicarse las nuevas reglas.'
        : error?.code === 'failed-precondition'
          ? 'La cuota ya está pagada o no admite nuevos abonos.'
          : 'No se pudo registrar el abono.';
    paymentMessage('err',text);
  }finally{
    busy = false;
    const save = document.getElementById('student-installment-payment-save');
    if(save){ save.disabled = false; save.textContent = 'Confirmar abono e ingreso'; }
  }
}

document.addEventListener('click',event => {
  const open = event.target.closest('[data-open],[data-pay]');
  if(!open) return;
  const id = open.dataset.open || open.dataset.pay;
  window.setTimeout(() => loadRecord(id),0);
});

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) ensurePanel();
});
