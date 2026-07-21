/* ==================================================
   Grupo Nostradamus - Condiciones económicas por alumno
   Permite ajustar cuotas futuras sin alterar pagos confirmados.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};
const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentRecordId = null;
let currentRecord = null;
let busy = false;

function clean(value){ return String(value == null ? '' : value).trim(); }
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }
function message(type,text){
  const el = document.getElementById('student-price-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.innerHTML = text;
}
function ensurePanel(){
  if(document.getElementById('student-price-panel')) return;
  const style = document.createElement('style');
  style.textContent = `
    #student-price-panel{margin:18px 0;padding:17px;border-radius:20px;background:linear-gradient(180deg,#f8fdff,#fff);border:1px solid rgba(7,140,149,.18)}
    #student-price-panel h3{font-family:'Baloo 2';font-size:28px;line-height:1;color:#061426;margin:0 0 5px}
    #student-price-panel>p{margin:0 0 13px;color:#526170;line-height:1.5}
    .student-price-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .student-price-grid .wide{grid-column:1/-1}
    .student-price-reference{grid-column:1/-1;padding:11px 12px;border-radius:14px;background:#eef8fa;color:#075b65;font-weight:850}
    .student-price-warning{grid-column:1/-1;padding:11px 12px;border-radius:14px;background:#fff8e8;color:#6a4700;font-weight:800;border:1px solid rgba(255,148,30,.25)}
    @media(max-width:650px){.student-price-grid{grid-template-columns:1fr}.student-price-grid .wide,.student-price-reference,.student-price-warning{grid-column:auto}}
  `;
  document.head.appendChild(style);

  const modalGrid = document.querySelector('#modal-back .admin-grid');
  if(!modalGrid) return;
  const panel = document.createElement('section');
  panel.id = 'student-price-panel';
  panel.innerHTML = `
    <h3>Condiciones económicas del alumno</h3>
    <p>Modifica la pensión acordada o solamente la próxima cuota. Esto no cambia ni elimina pagos ya confirmados.</p>
    <div class="student-price-grid">
      <div class="student-price-reference" id="student-price-reference">Abre la ficha de un alumno matriculado.</div>
      <label class="field"><span>Plan asignado</span><input id="student-plan-name" placeholder="Ej. Presencial - FULL"></label>
      <label class="field"><span>Pensión mensual acordada (S/)</span><input id="student-monthly-price" type="number" min="0" step="0.01" placeholder="0.00"></label>
      <label class="field"><span>Próxima cuota especial (S/)</span><input id="student-next-price" type="number" min="0" step="0.01" placeholder="Vacío = usar pensión acordada"></label>
      <label class="field"><span>Fecha de próxima cuota</span><input id="student-next-date" type="date"></label>
      <label class="field wide"><span>Motivo del cambio</span><input id="student-price-reason" placeholder="Ej. beca parcial, convenio, descuento por hermanos"></label>
      <div class="student-price-warning">Para corregir un pago ya realizado se registrará después una devolución, saldo a favor o ajuste. Nunca se sobrescribirá el pago original.</div>
    </div>
    <button class="btn btn-green" type="button" id="student-price-save">Guardar condiciones económicas</button>
    <div class="msg" id="student-price-message"></div>`;
  modalGrid.insertAdjacentElement('afterend',panel);
  document.getElementById('student-price-save').addEventListener('click',saveEconomicTerms);
}
function setDisabled(disabled){
  ['student-plan-name','student-monthly-price','student-next-price','student-next-date','student-price-reason','student-price-save']
    .forEach(id => { const el = document.getElementById(id); if(el) el.disabled = disabled; });
}
async function officialReference(record){
  const reference = document.getElementById('student-price-reference');
  if(!reference) return;
  reference.textContent = 'Consultando el precio oficial del plan...';
  const programId = clean(record.programaId);
  const planId = clean(record.planId);
  if(!programId){
    reference.textContent = 'Precio oficial: no vinculado todavía. Selecciona el plan en la preinscripción o escríbelo en esta ficha.';
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
      : 'No se encontró el plan exacto en el tarifario. Puedes establecer el precio acordado manualmente.';
  }catch(error){
    console.warn('No se pudo consultar el precio oficial:',error);
    reference.textContent = 'No se pudo consultar el tarifario en este momento.';
  }
}
async function loadRecord(id){
  if(!currentUser || !id) return;
  ensurePanel();
  currentRecordId = id;
  currentRecord = null;
  message('info','Cargando condiciones económicas...');
  try{
    const snap = await getDoc(doc(db,'preinscripciones',id));
    if(!snap.exists()) throw new Error('Registro no encontrado');
    currentRecord = {id:snap.id,...snap.data()};
    const isMatriculated = currentRecord.estado === 'matriculado' || currentRecord.matriculaAprobada === true;
    document.getElementById('student-plan-name').value = currentRecord.planAsignado || currentRecord.planNombre || '';
    document.getElementById('student-monthly-price').value = num(currentRecord.pensionAcordada) || '';
    document.getElementById('student-next-price').value = num(currentRecord.proximaCuotaMonto) || '';
    document.getElementById('student-next-date').value = clean(currentRecord.proximaCuotaFecha);
    document.getElementById('student-price-reason').value = '';
    setDisabled(!isMatriculated);
    if(isMatriculated){
      message('ok','Puedes modificar las cuotas futuras de este alumno.');
    }else{
      message('info','Esta sección se habilitará cuando la matrícula sea aprobada.');
    }
    await officialReference(currentRecord);
  }catch(error){
    console.error(error);
    setDisabled(true);
    message('err','No se pudieron cargar las condiciones económicas.');
  }
}
async function saveEconomicTerms(){
  if(busy || !currentUser || !currentRecordId || !currentRecord) return;
  const isMatriculated = currentRecord.estado === 'matriculado' || currentRecord.matriculaAprobada === true;
  if(!isMatriculated) return message('err','Primero debes aprobar la matrícula del alumno.');
  const planAsignado = clean(document.getElementById('student-plan-name').value);
  const pensionAcordada = num(document.getElementById('student-monthly-price').value);
  const proximaCuotaMonto = num(document.getElementById('student-next-price').value);
  const proximaCuotaFecha = clean(document.getElementById('student-next-date').value);
  const motivo = clean(document.getElementById('student-price-reason').value);
  if((pensionAcordada > 0 || proximaCuotaMonto > 0) && !motivo){
    return message('err','Escribe el motivo del cambio para mantener un historial claro.');
  }
  const entry = {
    fecha:new Date().toISOString(),
    administrador:currentUser.email || ADMIN_EMAIL,
    motivo:motivo || 'Actualización administrativa',
    anterior:{
      planAsignado:clean(currentRecord.planAsignado || currentRecord.planNombre),
      pensionAcordada:num(currentRecord.pensionAcordada),
      proximaCuotaMonto:num(currentRecord.proximaCuotaMonto),
      proximaCuotaFecha:clean(currentRecord.proximaCuotaFecha)
    },
    nuevo:{planAsignado,pensionAcordada,proximaCuotaMonto,proximaCuotaFecha}
  };
  if(!confirm('¿Guardar estas condiciones económicas para el alumno?')) return;
  try{
    busy = true;
    message('info','Guardando condiciones económicas...');
    await updateDoc(doc(db,'preinscripciones',currentRecordId),{
      planAsignado,
      pensionAcordada,
      proximaCuotaMonto,
      proximaCuotaFecha,
      ajustePagoMotivo:motivo,
      ajustePagoActualizadoPor:currentUser.email || ADMIN_EMAIL,
      ajustePagoUpdatedAt:serverTimestamp(),
      ajustesPagoHistorial:arrayUnion(entry),
      updatedAt:serverTimestamp()
    });
    message('ok','Condiciones económicas guardadas. Los pagos anteriores permanecen intactos.');
    await loadRecord(currentRecordId);
  }catch(error){
    console.error(error);
    message('err','No se pudo guardar el ajuste. Revisa los permisos de Firebase.');
  }finally{ busy = false; }
}

document.addEventListener('click',event => {
  const open = event.target.closest('[data-open],[data-pay]');
  if(!open) return;
  const id = open.dataset.open || open.dataset.pay;
  setTimeout(() => loadRecord(id),0);
});

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser) ensurePanel();
});
