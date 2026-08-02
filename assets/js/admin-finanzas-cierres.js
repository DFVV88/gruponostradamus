/* ==================================================
   Grupo Nostradamus - Cierre diario y conciliación
   Control operativo desde el 01/08/2026.
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
const MOVEMENTS_COLLECTION = 'finanzas_movimientos';
const CLOSURES_COLLECTION = 'finanzas_cierres';
const CONTROL_START_DATE = '2026-08-01';
const TRANSFER_CATEGORY = 'transferencia_interna';

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
let closures = [];
let currentSnapshot = null;
let busy = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const toCents = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};
const money = cents => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format((Number(cents) || 0) / 100);
const accountLabel = value => ACCOUNTS.find(item => item[0] === value)?.[1] || value || '-';
const isTransfer = item => item?.categoria === TRANSFER_CATEGORY;

function todayIso(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'});
}

function timestampLabel(value){
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'})
    : '-';
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('finance-close-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-close-styles';
  style.textContent = `
    .nf-close-section{padding:18px;border:1px solid rgba(7,140,149,.13);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .nf-close-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:13px}
    .nf-close-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:29px;line-height:1}
    .nf-close-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.45}
    .nf-close-head .btn{padding:9px 14px;font-size:11px;white-space:nowrap}
    .nf-close-alert{display:flex;align-items:flex-start;gap:11px;margin-bottom:13px;padding:13px 14px;border:1px solid #dce9ed;border-radius:16px;background:#f8fcfd;color:#526170;font-size:11px;line-height:1.45}
    .nf-close-alert strong{display:block;margin-bottom:2px;color:#061426;font-size:12px}
    .nf-close-alert .icon{width:31px;height:31px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:#eaf8f9;color:#075b65;font-weight:950}
    .nf-close-alert.closed{border-color:#ccebdc;background:#effaf4}.nf-close-alert.closed .icon{background:#daf3e6;color:#14855a}
    .nf-close-alert.warning{border-color:#ffd9a6;background:#fff8e8}.nf-close-alert.warning .icon{background:#fff0cf;color:#9b5a00}
    .nf-close-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:13px}
    .nf-close-summary article{padding:12px 13px;border:1px solid #e1ecef;border-radius:15px;background:#fbfdfe}
    .nf-close-summary span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}
    .nf-close-summary strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:22px;line-height:1}
    .nf-close-summary .difference strong.negative{color:#c73931}.nf-close-summary .difference strong.positive{color:#14855a}
    .nf-close-history table{min-width:980px}.nf-close-history th{font-size:10px}
    .nf-close-status{display:inline-flex;padding:5px 9px;border-radius:999px;background:#eaf9f1;color:#14855a;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.25px}
    .nf-close-difference{font-weight:950}.nf-close-difference.ok{color:#14855a}.nf-close-difference.bad{color:#c73931}
    .nf-close-observation{display:block;margin-top:4px;color:#87939d;font-size:9px;line-height:1.35}
    .nf-close-modal{width:min(1040px,97vw)}
    .nf-close-datebar{display:grid;grid-template-columns:minmax(190px,.45fr) 1.55fr;gap:10px;margin-bottom:12px}
    .nf-close-datebar label span{display:block;margin-bottom:5px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}
    .nf-close-datebar input{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:13px;outline:none}
    .nf-close-datebar aside{padding:11px 13px;border:1px solid rgba(7,140,149,.16);border-radius:13px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:800;line-height:1.45}
    .nf-close-day-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}
    .nf-close-day-summary article{padding:11px 12px;border:1px solid #e1ecef;border-radius:14px;background:#fbfdfe}
    .nf-close-day-summary span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase}.nf-close-day-summary strong{display:block;margin-top:4px;color:#061426;font-size:17px}
    .nf-close-accounts{overflow:auto;border:1px solid #dce9ed;border-radius:16px}
    .nf-close-accounts table{width:100%;min-width:900px;border-collapse:collapse}
    .nf-close-accounts th,.nf-close-accounts td{padding:10px 9px;border-bottom:1px solid #edf3f5;font-size:11px}
    .nf-close-accounts th{background:#f4fbfd;color:#061426;font-size:9px;text-transform:uppercase}
    .nf-close-accounts input{width:130px;border:1px solid #dce9ed;border-radius:10px;padding:8px 9px;background:#fff;color:#172033;font:inherit;text-align:right;outline:none}
    .nf-close-accounts input:focus{border-color:#078c95;box-shadow:0 0 0 3px rgba(7,140,149,.1)}
    .nf-close-row-diff{font-weight:950}.nf-close-row-diff.ok{color:#14855a}.nf-close-row-diff.bad{color:#c73931}
    .nf-close-total{display:flex;justify-content:flex-end;gap:22px;margin-top:11px;padding:11px 13px;border-radius:14px;background:#f4fbfd;color:#526170;font-size:11px;font-weight:850}
    .nf-close-total b{color:#061426;font-size:14px}.nf-close-total b.bad{color:#c73931}.nf-close-total b.ok{color:#14855a}
    .nf-close-form-note{margin-top:12px;padding:11px 13px;border:1px solid rgba(255,148,30,.27);border-radius:14px;background:#fff8e8;color:#6a4700;font-size:11px;font-weight:800;line-height:1.45}
    .nf-close-form-note.closed{border-color:#ccebdc;background:#effaf4;color:#17672a}
    @media(max-width:900px){.nf-close-summary,.nf-close-day-summary{grid-template-columns:1fr 1fr}.nf-close-head{display:block}.nf-close-head .btn{width:100%;margin-top:11px}.nf-close-datebar{grid-template-columns:1fr}}
    @media(max-width:620px){.nf-close-summary,.nf-close-day-summary{grid-template-columns:1fr}.nf-close-total{display:grid;gap:5px}.nf-close-modal{padding:17px}}
  `;
  document.head.appendChild(style);
}

function buildSection(panel){
  if(document.getElementById('finance-close-section')) return;
  const section = document.createElement('section');
  section.id = 'finance-close-section';
  section.className = 'nf-close-section';
  section.innerHTML = `
    <div class="nf-close-head">
      <div><h3>Cierre diario y conciliación</h3><p>Compara el saldo calculado con el dinero real de Caja, Yape, Plin, BCP, Culqi y otras cuentas. Cada fecha solo puede cerrarse una vez.</p></div>
      <button type="button" class="btn btn-primary" id="finance-close-open">Realizar cierre diario</button>
    </div>
    <div class="nf-close-alert" id="finance-close-alert"><span class="icon">…</span><div><strong>Revisando el cierre de hoy</strong>Cargando movimientos y conciliaciones...</div></div>
    <div class="nf-close-summary">
      <article><span>Cierres registrados</span><strong id="finance-close-count">0</strong></article>
      <article><span>Último cierre</span><strong id="finance-close-last">-</strong></article>
      <article><span>Saldo real último cierre</span><strong id="finance-close-last-real">S/ 0.00</strong></article>
      <article class="difference"><span>Diferencia último cierre</span><strong id="finance-close-last-difference">S/ 0.00</strong></article>
    </div>
    <div class="msg" id="finance-close-message"></div>
    <div class="table-wrap nf-close-history">
      <table>
        <thead><tr><th>Fecha</th><th>Estado</th><th>Saldo esperado</th><th>Saldo real</th><th>Diferencia</th><th>Responsable</th><th>Observación</th></tr></thead>
        <tbody id="finance-close-rows"><tr><td colspan="7">Cargando cierres...</td></tr></tbody>
      </table>
    </div>`;

  const movementPanel = panel.querySelector('.nf-panel');
  if(movementPanel) panel.insertBefore(section,movementPanel);
  else panel.appendChild(section);

  const modal = document.createElement('div');
  modal.id = 'finance-close-back';
  modal.className = 'nf-modal-back';
  modal.innerHTML = `
    <div class="nf-modal nf-close-modal" role="dialog" aria-modal="true" aria-labelledby="finance-close-title">
      <div class="nf-modal-head"><div><h2 id="finance-close-title">Cierre diario</h2><p>Cuenta o consulta el saldo real de cada cuenta y compáralo con el sistema.</p></div><button type="button" class="btn btn-light" id="finance-close-dismiss">Cerrar</button></div>
      <form id="finance-close-form">
        <div class="nf-close-datebar">
          <label><span>Fecha del cierre</span><input id="finance-close-date" type="date" required></label>
          <aside>El saldo inicial se calcula desde el 1 de agosto de 2026. Las transferencias afectan las cuentas, pero no aumentan los ingresos ni egresos reales del negocio.</aside>
        </div>
        <div class="nf-close-day-summary">
          <article><span>Ingresos del día</span><strong id="finance-close-day-income">S/ 0.00</strong></article>
          <article><span>Egresos del día</span><strong id="finance-close-day-expense">S/ 0.00</strong></article>
          <article><span>Operaciones</span><strong id="finance-close-day-operations">0</strong></article>
          <article><span>Saldo esperado total</span><strong id="finance-close-day-expected">S/ 0.00</strong></article>
        </div>
        <div class="nf-close-accounts">
          <table>
            <thead><tr><th>Cuenta</th><th>Saldo inicial</th><th>Entradas del día</th><th>Salidas del día</th><th>Saldo esperado</th><th>Saldo real</th><th>Diferencia</th></tr></thead>
            <tbody id="finance-close-account-rows"></tbody>
          </table>
        </div>
        <div class="nf-close-total"><span>Saldo real total: <b id="finance-close-real-total">S/ 0.00</b></span><span>Diferencia total: <b id="finance-close-difference-total">S/ 0.00</b></span></div>
        <div class="nf-form-grid" style="margin-top:12px"><label class="wide"><span>Observación del cierre</span><textarea id="finance-close-observation" maxlength="1000" rows="3" placeholder="Obligatoria cuando existe alguna diferencia"></textarea></label></div>
        <div class="nf-close-form-note" id="finance-close-form-note">Revisa todos los saldos. Una vez guardado, este cierre no podrá editarse ni eliminarse.</div>
        <div class="msg" id="finance-close-form-message"></div>
        <div class="nf-form-actions"><button type="submit" class="btn btn-primary" id="finance-close-save">Guardar cierre definitivo</button></div>
      </form>
    </div>`;
  document.body.appendChild(modal);
}

function bindEvents(){
  document.getElementById('finance-close-open')?.addEventListener('click',openCloseModal);
  document.getElementById('finance-close-dismiss')?.addEventListener('click',closeCloseModal);
  document.getElementById('finance-close-back')?.addEventListener('click',event => {
    if(event.target.id === 'finance-close-back') closeCloseModal();
  });
  document.getElementById('finance-close-date')?.addEventListener('change',renderCloseForm);
  document.getElementById('finance-close-account-rows')?.addEventListener('input',event => {
    if(event.target.matches('[data-close-actual]')) updateCloseDifferences();
  });
  document.getElementById('finance-close-form')?.addEventListener('submit',saveClosure);
  document.addEventListener('click',event => {
    if(event.target.closest('#finance-refresh,#finance-audit-refresh')) setTimeout(loadData,700);
  });
  document.addEventListener('submit',event => {
    if(event.target.matches('#finance-form,#finance-transfer-form,#finance-void-form')) setTimeout(loadData,1400);
  },true);
}

function setup(){
  if(ready) return true;
  const panel = document.getElementById('nostra-finance-panel');
  if(!panel) return false;
  injectStyles();
  buildSection(panel);
  bindEvents();
  ready = true;
  if(currentUser) loadData();
  return true;
}

async function loadData(){
  if(!currentUser || !setup()) return;
  setMessage('finance-close-message','info','Actualizando cierres y conciliaciones...');
  try{
    const [movementSnapshot,closureSnapshot] = await Promise.all([
      getDocs(query(collection(db,MOVEMENTS_COLLECTION),orderBy('createdAt','desc'),limit(5000))),
      getDocs(query(collection(db,CLOSURES_COLLECTION),orderBy('fechaCierre','desc'),limit(500)))
    ]);
    movements = movementSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    closures = closureSnapshot.docs.map(item => ({id:item.id,...item.data()}));
    renderSection();
    setMessage('finance-close-message','ok',closures.length
      ? 'Historial de cierres actualizado.'
      : 'Todavía no existen cierres diarios.');
  }catch(error){
    console.error(error);
    const denied = error?.code === 'permission-denied';
    setMessage('finance-close-message','err',denied
      ? 'Firebase todavía no autorizó la colección de cierres. Deben publicarse las nuevas reglas de Firestore.'
      : 'No se pudieron cargar los cierres diarios.');
  }
}

function activeMovementsUntil(date){
  return movements.filter(item =>
    (item.estado || 'activo') === 'activo' &&
    clean(item.fechaOperacion) >= CONTROL_START_DATE &&
    clean(item.fechaOperacion) <= date
  );
}

function operationCount(data){
  const regular = data.filter(item => !isTransfer(item)).length;
  const transfers = new Set(data.filter(isTransfer).map(item => clean(item.numeroOperacion) || `${item.fechaOperacion}-${item.monto}`));
  return regular + transfers.size;
}

function computeSnapshot(date){
  const all = activeMovementsUntil(date);
  const before = all.filter(item => clean(item.fechaOperacion) < date);
  const day = all.filter(item => clean(item.fechaOperacion) === date);
  const accounts = {};

  ACCOUNTS.forEach(([id,label]) => {
    const prior = before.filter(item => item.cuenta === id);
    const today = day.filter(item => item.cuenta === id);
    const opening = prior.reduce((sum,item) => sum + (item.tipo === 'ingreso' ? toCents(item.monto) : -toCents(item.monto)),0);
    const entries = today.filter(item => item.tipo === 'ingreso').reduce((sum,item) => sum + toCents(item.monto),0);
    const exits = today.filter(item => item.tipo === 'egreso').reduce((sum,item) => sum + toCents(item.monto),0);
    accounts[id] = {id,label,opening,entries,exits,expected:opening + entries - exits};
  });

  const operational = day.filter(item => !isTransfer(item));
  const dailyIncome = operational.filter(item => item.tipo === 'ingreso').reduce((sum,item) => sum + toCents(item.monto),0);
  const dailyExpense = operational.filter(item => item.tipo === 'egreso').reduce((sum,item) => sum + toCents(item.monto),0);
  const expectedTotal = Object.values(accounts).reduce((sum,item) => sum + item.expected,0);

  return {
    date,
    accounts,
    dailyIncome,
    dailyExpense,
    operations:operationCount(day),
    expectedTotal
  };
}

function renderSection(){
  const count = document.getElementById('finance-close-count');
  const lastDate = document.getElementById('finance-close-last');
  const lastReal = document.getElementById('finance-close-last-real');
  const lastDifference = document.getElementById('finance-close-last-difference');
  const latest = closures[0] || null;

  if(count) count.textContent = String(closures.length);
  if(lastDate) lastDate.textContent = latest ? dateLabel(latest.fechaCierre) : '-';
  if(lastReal) lastReal.textContent = money(latest?.saldoRealTotalCentimos || 0);
  if(lastDifference){
    const difference = Number(latest?.diferenciaTotalCentimos || 0);
    lastDifference.textContent = money(difference);
    lastDifference.classList.toggle('negative',difference < 0);
    lastDifference.classList.toggle('positive',difference > 0);
  }

  renderTodayAlert();
  renderHistory();
}

function renderTodayAlert(){
  const alert = document.getElementById('finance-close-alert');
  if(!alert) return;
  const today = todayIso();
  const closure = closures.find(item => item.fechaCierre === today);
  alert.className = 'nf-close-alert';

  if(closure){
    const difference = Number(closure.diferenciaTotalCentimos || 0);
    alert.classList.add(difference === 0 ? 'closed' : 'warning');
    alert.innerHTML = `<span class="icon">✓</span><div><strong>Cierre de hoy completado</strong>Saldo real ${esc(money(closure.saldoRealTotalCentimos || 0))}. Diferencia ${esc(money(difference))}. Registrado por ${esc(closure.cerradoPor || '-')}.</div>`;
    return;
  }

  const snapshot = computeSnapshot(today);
  const negativeAccounts = Object.values(snapshot.accounts).filter(item => item.expected < 0);
  if(negativeAccounts.length){
    alert.classList.add('warning');
    alert.innerHTML = `<span class="icon">!</span><div><strong>Cierre de hoy pendiente</strong>Hay ${negativeAccounts.length} cuenta${negativeAccounts.length === 1 ? '' : 's'} con saldo calculado negativo. Revisa los movimientos antes de cerrar.</div>`;
  }else{
    alert.innerHTML = `<span class="icon">○</span><div><strong>Cierre de hoy pendiente</strong>El sistema espera un saldo total de ${esc(money(snapshot.expectedTotal))}. Realiza el cierre cuando hayas registrado todas las operaciones del día.</div>`;
  }
}

function renderHistory(){
  const rows = document.getElementById('finance-close-rows');
  if(!rows) return;
  if(!closures.length){
    rows.innerHTML = '<tr><td colspan="7">No hay cierres registrados.</td></tr>';
    return;
  }
  rows.innerHTML = closures.map(item => {
    const difference = Number(item.diferenciaTotalCentimos || 0);
    return `<tr>
      <td><b>${esc(dateLabel(item.fechaCierre))}</b><small class="nf-close-observation">Guardado: ${esc(timestampLabel(item.closedAt || item.createdAt))}</small></td>
      <td><span class="nf-close-status">Cerrado</span></td>
      <td>${esc(money(item.saldoEsperadoTotalCentimos || 0))}</td>
      <td><b>${esc(money(item.saldoRealTotalCentimos || 0))}</b></td>
      <td class="nf-close-difference ${difference === 0 ? 'ok' : 'bad'}">${esc(money(difference))}</td>
      <td>${esc(item.cerradoPor || '-')}</td>
      <td>${esc(item.observacion || 'Sin observación')}</td>
    </tr>`;
  }).join('');
}

function openCloseModal(){
  if(!currentUser) return;
  const dateInput = document.getElementById('finance-close-date');
  if(dateInput){
    dateInput.min = CONTROL_START_DATE;
    dateInput.max = todayIso();
    dateInput.value = todayIso();
  }
  const observation = document.getElementById('finance-close-observation');
  if(observation) observation.value = '';
  document.getElementById('finance-close-back')?.classList.add('show');
  renderCloseForm();
}

function closeCloseModal(){
  if(busy) return;
  document.getElementById('finance-close-back')?.classList.remove('show');
  currentSnapshot = null;
}

function renderCloseForm(){
  const date = clean(document.getElementById('finance-close-date')?.value);
  const rows = document.getElementById('finance-close-account-rows');
  const saveButton = document.getElementById('finance-close-save');
  const note = document.getElementById('finance-close-form-note');
  if(!rows || !date) return;

  currentSnapshot = computeSnapshot(date);
  const existing = closures.find(item => item.fechaCierre === date);

  document.getElementById('finance-close-day-income').textContent = money(currentSnapshot.dailyIncome);
  document.getElementById('finance-close-day-expense').textContent = money(currentSnapshot.dailyExpense);
  document.getElementById('finance-close-day-operations').textContent = String(currentSnapshot.operations);
  document.getElementById('finance-close-day-expected').textContent = money(currentSnapshot.expectedTotal);

  rows.innerHTML = ACCOUNTS.map(([id,label]) => {
    const account = currentSnapshot.accounts[id];
    const actual = existing?.cuentas?.[id]?.saldoRealCentimos ?? account.expected;
    const difference = actual - account.expected;
    return `<tr data-close-account-row="${esc(id)}">
      <td><b>${esc(label)}</b></td>
      <td>${esc(money(account.opening))}</td>
      <td>${esc(money(account.entries))}</td>
      <td>${esc(money(account.exits))}</td>
      <td><b>${esc(money(account.expected))}</b></td>
      <td><input type="number" step="0.01" min="-1000000" max="1000000" data-close-actual="${esc(id)}" value="${(actual/100).toFixed(2)}" ${existing ? 'disabled' : ''}></td>
      <td class="nf-close-row-diff ${difference === 0 ? 'ok' : 'bad'}" data-close-difference="${esc(id)}">${esc(money(difference))}</td>
    </tr>`;
  }).join('');

  if(existing){
    if(saveButton) saveButton.disabled = true;
    if(note){
      note.className = 'nf-close-form-note closed';
      note.textContent = `Esta fecha ya fue cerrada por ${existing.cerradoPor || '-'} el ${timestampLabel(existing.closedAt || existing.createdAt)}. El cierre está protegido y no puede modificarse.`;
    }
    const observation = document.getElementById('finance-close-observation');
    if(observation){ observation.value = existing.observacion || ''; observation.disabled = true; }
    setMessage('finance-close-form-message','ok','Cierre ya registrado. Puedes consultarlo, pero no editarlo.');
  }else{
    if(saveButton) saveButton.disabled = false;
    if(note){
      note.className = 'nf-close-form-note';
      note.textContent = 'Revisa todos los saldos. Una vez guardado, este cierre no podrá editarse ni eliminarse.';
    }
    const observation = document.getElementById('finance-close-observation');
    if(observation) observation.disabled = false;
    setMessage('finance-close-form-message','info','Los saldos reales se completan inicialmente con el valor esperado. Modifica únicamente los que no coincidan.');
  }
  updateCloseDifferences();
}

function readActualCents(accountId){
  const input = document.querySelector(`[data-close-actual="${accountId}"]`);
  return toCents(input?.value);
}

function updateCloseDifferences(){
  if(!currentSnapshot) return;
  let realTotal = 0;
  let differenceTotal = 0;

  ACCOUNTS.forEach(([id]) => {
    const actual = readActualCents(id);
    const expected = currentSnapshot.accounts[id].expected;
    const difference = actual - expected;
    realTotal += actual;
    differenceTotal += difference;
    const cell = document.querySelector(`[data-close-difference="${id}"]`);
    if(cell){
      cell.textContent = money(difference);
      cell.classList.toggle('ok',difference === 0);
      cell.classList.toggle('bad',difference !== 0);
    }
  });

  const realNode = document.getElementById('finance-close-real-total');
  const differenceNode = document.getElementById('finance-close-difference-total');
  if(realNode) realNode.textContent = money(realTotal);
  if(differenceNode){
    differenceNode.textContent = money(differenceTotal);
    differenceNode.classList.toggle('ok',differenceTotal === 0);
    differenceNode.classList.toggle('bad',differenceTotal !== 0);
  }
}

function buildAccountPayload(){
  const payload = {};
  ACCOUNTS.forEach(([id]) => {
    const account = currentSnapshot.accounts[id];
    const actual = readActualCents(id);
    payload[id] = {
      saldoInicialCentimos:account.opening,
      entradasCentimos:account.entries,
      salidasCentimos:account.exits,
      saldoEsperadoCentimos:account.expected,
      saldoRealCentimos:actual,
      diferenciaCentimos:actual - account.expected
    };
  });
  return payload;
}

async function saveClosure(event){
  event.preventDefault();
  if(busy || !currentUser || !currentSnapshot) return;

  const date = clean(document.getElementById('finance-close-date')?.value);
  const observation = clean(document.getElementById('finance-close-observation')?.value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < CONTROL_START_DATE || date > todayIso()){
    return setMessage('finance-close-form-message','err','Selecciona una fecha válida desde el 1 de agosto de 2026 hasta hoy.');
  }

  const accounts = buildAccountPayload();
  const expectedTotal = Object.values(accounts).reduce((sum,item) => sum + item.saldoEsperadoCentimos,0);
  const realTotal = Object.values(accounts).reduce((sum,item) => sum + item.saldoRealCentimos,0);
  const differenceTotal = realTotal - expectedTotal;
  if(differenceTotal !== 0 && observation.length < 5){
    return setMessage('finance-close-form-message','err','Escribe una observación de al menos 5 caracteres para explicar la diferencia encontrada.');
  }

  try{
    busy = true;
    const saveButton = document.getElementById('finance-close-save');
    if(saveButton){ saveButton.disabled = true; saveButton.textContent = 'Guardando cierre...'; }
    setMessage('finance-close-form-message','info','Guardando cierre definitivo en Firebase...');

    const closureRef = doc(db,CLOSURES_COLLECTION,date);
    const existing = await getDoc(closureRef);
    if(existing.exists()) throw Object.assign(new Error('El cierre ya existe.'),{code:'already-exists'});

    await setDoc(closureRef,{
      fechaCierre:date,
      estado:'cerrado',
      cuentas:accounts,
      totalIngresosDiaCentimos:currentSnapshot.dailyIncome,
      totalEgresosDiaCentimos:currentSnapshot.dailyExpense,
      operacionesDia:currentSnapshot.operations,
      saldoEsperadoTotalCentimos:expectedTotal,
      saldoRealTotalCentimos:realTotal,
      diferenciaTotalCentimos:differenceTotal,
      tieneDiferencia:differenceTotal !== 0,
      observacion:observation,
      cerradoPor:currentUser.email || ADMIN_EMAIL,
      origen:'cierre_diario_admin',
      version:'2026-08',
      closedAt:serverTimestamp(),
      createdAt:serverTimestamp()
    });

    setMessage('finance-close-form-message','ok','Cierre diario registrado correctamente.');
    await loadData();
    setTimeout(closeCloseModal,700);
  }catch(error){
    console.error(error);
    const text = error?.code === 'already-exists'
      ? 'Esta fecha ya tiene un cierre registrado.'
      : error?.code === 'permission-denied'
        ? 'Firebase rechazó el cierre. Publica las nuevas reglas de Firestore antes de intentarlo.'
        : 'No se pudo guardar el cierre diario. Inténtalo nuevamente.';
    setMessage('finance-close-form-message','err',text);
  }finally{
    busy = false;
    const saveButton = document.getElementById('finance-close-save');
    if(saveButton){ saveButton.disabled = false; saveButton.textContent = 'Guardar cierre definitivo'; }
  }
}

function initialize(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if(setup() || attempts > 70) clearInterval(timer);
  },200);
}

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  currentUser = user && email === ADMIN_EMAIL ? user : null;
  if(currentUser){
    setup();
    loadData();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
