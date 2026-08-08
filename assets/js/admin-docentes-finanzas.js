/* ==================================================
   Grupo Nostradamus - Control financiero de docentes
   Etapa 11: perfiles, periodos trabajados y enlace a Cuentas por pagar.
   Los pagos se realizan en el modulo existente de Cuentas por pagar.
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
  updateDoc,
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
const CONTROL_START_MONTH = '2026-08';
const TEACHER_COLLECTION = 'finanzas_docentes';
const PERIOD_COLLECTION = 'finanzas_docentes_periodos';
const OBLIGATION_COLLECTION = 'finanzas_obligaciones';
const USER_COLLECTION = 'users';
const MAX_RECORDS = 3000;

const SCHEMES = [
  ['hora','Por hora'],
  ['sesion','Por sesión / clase'],
  ['fijo','Monto fijo por periodo']
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let teacherAccounts = [];
let teachers = [];
let periods = [];
let obligations = [];
let selectedTeacherId = '';
let busy = false;
let loading = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
}[char]));
const cents = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};
const num = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{
  style:'currency',currency:'PEN'
}).format((Number(value) || 0) / 100);
const schemeLabel = value => SCHEMES.find(item => item[0] === value)?.[1] || value || '-';

function localDate(){
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function currentMonth(){
  return localDate().slice(0,7);
}

function monthLabel(value){
  if(!/^\d{4}-\d{2}$/.test(value)) return value || '-';
  const [year,month] = value.split('-').map(Number);
  const date = new Date(year,month-1,1);
  return date.toLocaleDateString('es-PE',{month:'long',year:'numeric'}).replace(/^./,c => c.toUpperCase());
}

function dateLabel(value){
  if(!value) return '-';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-PE');
}

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function normalize(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function injectStyles(){
  if(document.getElementById('finance-teachers-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-teachers-styles';
  style.textContent = `
    .nteach-section{margin:18px 0;padding:19px;border:1px solid rgba(7,140,149,.16);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .nteach-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:13px}.nteach-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:31px;line-height:1}.nteach-head p{margin:5px 0 0;color:#647482;font-size:12px;line-height:1.45}.nteach-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.nteach-actions .btn{margin:0;padding:9px 13px;font-size:10px;white-space:nowrap}
    .nteach-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-bottom:13px}.nteach-stat{padding:13px 14px;border:1px solid #e1ecef;border-radius:16px;background:#fbfdfe}.nteach-stat span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.nteach-stat strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:24px;line-height:1}.nteach-stat.generated strong{color:#078c95}.nteach-stat.unsent strong{color:#b45309}.nteach-stat.pending strong{color:#b42318}
    .nteach-tabs{display:grid;gap:9px;margin-top:8px}.nteach-sub{overflow:hidden;border:1px solid #dce9ed;border-radius:16px;background:#fbfdfe}.nteach-sub[open]{background:#fff}.nteach-sub>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;cursor:pointer;list-style:none}.nteach-sub>summary::-webkit-details-marker{display:none}.nteach-sub>summary strong{color:#061426;font-size:12px}.nteach-sub>summary small{color:#71808c;font-size:9px}.nteach-sub-body{padding:0 11px 11px}
    .nteach-filters{display:grid;grid-template-columns:minmax(220px,1.3fr) minmax(150px,.7fr) minmax(155px,.75fr) auto;gap:8px;margin-bottom:10px}.nteach-filters input,.nteach-filters select{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:12px;outline:none}.nteach-filters .btn{padding:9px 12px;font-size:10px}
    .nteach-table table{min-width:1200px}.nteach-table th{font-size:9px}.nteach-table td{font-size:11px}.nteach-profile-table table{min-width:1040px}.nteach-profile-table th{font-size:9px}.nteach-profile-table td{font-size:11px}.nteach-muted{display:block;margin-top:3px;color:#71808c;font-size:9px;line-height:1.4}.nteach-money{font-weight:950;white-space:nowrap}.nteach-money.paid{color:#14855a}.nteach-money.pending{color:#b45309}.nteach-money.overdue{color:#b42318}
    .nteach-status{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:950;text-transform:uppercase;white-space:nowrap}.nteach-status.por_enviar{background:#fff8e8;color:#8a4c00}.nteach-status.pendiente{background:#eef8fa;color:#075b65}.nteach-status.vencido{background:#fff0ef;color:#b42318}.nteach-status.parcial{background:#eef8fa;color:#075b65}.nteach-status.pagado{background:#eaf9f1;color:#14855a}.nteach-status.anulado{background:#f2f4f7;color:#475467}
    .nteach-row-actions{display:flex;flex-wrap:wrap;gap:5px}.nteach-action{border:1px solid #078c95;border-radius:999px;padding:7px 10px;background:#078c95;color:#fff;font:inherit;font-size:9px;font-weight:950;cursor:pointer;white-space:nowrap}.nteach-action.secondary{background:#fff;color:#075b65}.nteach-action.danger{border-color:#f3b8b3;background:#fff5f4;color:#a92d25}.nteach-action:disabled{opacity:.45;cursor:not-allowed}
    .nteach-calc{margin-top:8px;padding:11px 13px;border:1px solid rgba(7,140,149,.18);border-radius:14px;background:#eef8fa;color:#075b65;font-size:11px;font-weight:850}.nteach-calc strong{font-family:'Baloo 2';font-size:22px}.nteach-empty{padding:18px;text-align:center;color:#647482}
    @media(max-width:900px){.nteach-filters{grid-template-columns:1fr 1fr}.nteach-stats{grid-template-columns:1fr 1fr}}
    @media(max-width:720px){.nteach-head{display:block}.nteach-actions{display:grid;grid-template-columns:1fr;margin-top:10px}.nteach-actions .btn{width:100%}.nteach-stats,.nteach-filters{grid-template-columns:1fr}.nteach-stat strong{font-size:22px}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  if(document.getElementById('finance-teachers-section')) return true;
  const finance = document.getElementById('nostra-finance-panel');
  if(!finance) return false;
  injectStyles();

  const section = document.createElement('section');
  section.id = 'finance-teachers-section';
  section.className = 'nteach-section';
  section.innerHTML = `
    <div class="nteach-head">
      <div><h3>Control y pagos a docentes</h3><p>Configura la tarifa de cada docente, registra periodos trabajados y envíalos a Cuentas por pagar. Los pagos y egresos continúan en el flujo financiero auditado.</p></div>
      <div class="nteach-actions">
        <button type="button" class="btn btn-primary" id="finance-teacher-new">+ Agregar docente</button>
        <button type="button" class="btn btn-blue" id="finance-teacher-period-new">+ Registrar periodo</button>
        <button type="button" class="btn btn-light" id="finance-teacher-refresh">Actualizar</button>
      </div>
    </div>
    <div class="nteach-stats">
      <article class="nteach-stat"><span>Docentes activos</span><strong id="finance-teacher-active">0</strong></article>
      <article class="nteach-stat generated"><span>Generado en el mes</span><strong id="finance-teacher-generated">S/ 0.00</strong></article>
      <article class="nteach-stat unsent"><span>Por enviar a pagar</span><strong id="finance-teacher-unsent">S/ 0.00</strong></article>
      <article class="nteach-stat pending"><span>Saldo docente pendiente</span><strong id="finance-teacher-pending">S/ 0.00</strong></article>
    </div>
    <div class="nteach-tabs">
      <details class="nteach-sub" open>
        <summary><strong>Periodos trabajados y pagos</strong><small id="finance-teacher-period-summary">Sin periodos registrados</small></summary>
        <div class="nteach-sub-body">
          <div class="nteach-filters">
            <input id="finance-teacher-search" placeholder="Buscar docente, curso, salón o documento">
            <input id="finance-teacher-month" type="month" min="${CONTROL_START_MONTH}" max="${currentMonth()}" value="${currentMonth()}">
            <select id="finance-teacher-status"><option value="">Todos los estados</option><option value="por_enviar">Por enviar</option><option value="vencido">Vencido</option><option value="pendiente">Pendiente</option><option value="parcial">Pago parcial</option><option value="pagado">Pagado</option><option value="anulado">Anulado</option></select>
            <button type="button" class="btn btn-light" id="finance-teacher-clear">Limpiar</button>
          </div>
          <div class="msg" id="finance-teacher-message"></div>
          <div class="table-wrap nteach-table"><table><thead><tr><th>Docente</th><th>Periodo / curso</th><th>Cálculo</th><th>Generado</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="finance-teacher-period-rows"><tr><td colspan="8">Cargando periodos docentes...</td></tr></tbody></table></div>
        </div>
      </details>
      <details class="nteach-sub">
        <summary><strong>Directorio financiero de docentes</strong><small id="finance-teacher-profile-summary">0 docentes configurados</small></summary>
        <div class="nteach-sub-body"><div class="table-wrap nteach-profile-table"><table><thead><tr><th>Docente</th><th>Curso principal</th><th>Documento</th><th>Forma de pago</th><th>Tarifa</th><th>Estado</th><th>Acción</th></tr></thead><tbody id="finance-teacher-profile-rows"><tr><td colspan="7">Cargando docentes...</td></tr></tbody></table></div></div>
      </details>
    </div>`;

  const payables = document.getElementById('finance-payables-section');
  const payablesAccordion = document.getElementById('finance-accordion-payables');
  const receivables = document.getElementById('receivables-panel');
  const receivablesAccordion = document.getElementById('finance-accordion-receivables');
  if(payables?.parentElement === finance) payables.insertAdjacentElement('beforebegin',section);
  else if(payablesAccordion?.parentElement === finance) payablesAccordion.insertAdjacentElement('beforebegin',section);
  else if(receivables?.parentElement === finance) receivables.insertAdjacentElement('afterend',section);
  else if(receivablesAccordion?.parentElement === finance) receivablesAccordion.insertAdjacentElement('afterend',section);
  else finance.appendChild(section);

  buildModals();
  bindEvents();
  ready = true;
  return true;
}

function buildModals(){
  if(!document.getElementById('finance-teacher-new-back')){
    const modal = document.createElement('div');
    modal.id = 'finance-teacher-new-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="finance-teacher-new-title">
        <div class="nf-modal-head"><div><h2 id="finance-teacher-new-title">Docente financiero</h2><p>Importa los datos de una NostraCUENTA docente o registra el perfil manualmente.</p></div><button type="button" class="btn btn-light" id="finance-teacher-new-close">Cerrar</button></div>
        <form id="finance-teacher-new-form">
          <div class="nf-form-grid">
            <label class="wide"><span>NostraCUENTA docente (opcional)</span><select id="finance-teacher-account"><option value="">Registro manual</option></select></label>
            <label><span>Nombre completo</span><input id="finance-teacher-name" minlength="2" maxlength="140" required></label>
            <label><span>Correo institucional</span><input id="finance-teacher-email" type="email" maxlength="160" placeholder="Opcional"></label>
            <label><span>Curso principal</span><input id="finance-teacher-course" maxlength="100" placeholder="Ej. Física"></label>
            <label><span>DNI / RUC</span><input id="finance-teacher-document" maxlength="20" placeholder="Opcional"></label>
            <label><span>Forma de cálculo</span><select id="finance-teacher-scheme" required>${SCHEMES.map(item => `<option value="${item[0]}">${item[1]}</option>`).join('')}</select></label>
            <label><span>Tarifa base (S/)</span><input id="finance-teacher-rate" type="number" min="0.01" max="1000000" step="0.01" required placeholder="0.00"></label>
            <label class="wide"><span>Observación</span><textarea id="finance-teacher-note" maxlength="1000" rows="3" placeholder="Opcional"></textarea></label>
          </div>
          <div class="nf-form-note">La tarifa base sirve para precargar futuros periodos. Cada periodo conserva una copia de su tarifa para que el historial no cambie si luego actualizas el perfil.</div>
          <div class="msg" id="finance-teacher-new-message"></div>
          <div class="nf-form-actions"><button type="submit" class="btn btn-primary" id="finance-teacher-new-save">Guardar docente</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }

  if(!document.getElementById('finance-teacher-period-back')){
    const modal = document.createElement('div');
    modal.id = 'finance-teacher-period-back';
    modal.className = 'nf-modal-back';
    modal.innerHTML = `
      <div class="nf-modal" role="dialog" aria-modal="true" aria-labelledby="finance-teacher-period-title">
        <div class="nf-modal-head"><div><h2 id="finance-teacher-period-title">Registrar periodo trabajado</h2><p>Calcula los honorarios antes de enviarlos a Cuentas por pagar.</p></div><button type="button" class="btn btn-light" id="finance-teacher-period-close">Cerrar</button></div>
        <form id="finance-teacher-period-form">
          <div class="nf-form-grid">
            <label class="wide"><span>Docente</span><select id="finance-teacher-period-teacher" required><option value="">Selecciona un docente</option></select></label>
            <label><span>Periodo</span><input id="finance-teacher-period-month" type="month" min="${CONTROL_START_MONTH}" max="${currentMonth()}" value="${currentMonth()}" required></label>
            <label><span>Fecha de vencimiento</span><input id="finance-teacher-period-due" type="date" min="2026-08-01" required></label>
            <label><span>Curso / actividad</span><input id="finance-teacher-period-course" minlength="2" maxlength="80" required placeholder="Ej. Física"></label>
            <label><span>Salón / ciclo</span><input id="finance-teacher-period-room" minlength="2" maxlength="80" required placeholder="Ej. Nostra Power · Mañana"></label>
            <label><span>Forma de cálculo</span><select id="finance-teacher-period-scheme" required>${SCHEMES.map(item => `<option value="${item[0]}">${item[1]}</option>`).join('')}</select></label>
            <label><span id="finance-teacher-units-label">Horas / sesiones</span><input id="finance-teacher-period-units" type="number" min="0.01" max="1000" step="0.25" required value="1"></label>
            <label><span>Tarifa aplicada (S/)</span><input id="finance-teacher-period-rate" type="number" min="0.01" max="1000000" step="0.01" required></label>
            <label class="wide"><span>Observación</span><textarea id="finance-teacher-period-note" maxlength="1000" rows="3" placeholder="Opcional"></textarea></label>
          </div>
          <div class="nteach-calc">Monto generado: <strong id="finance-teacher-period-total">S/ 0.00</strong><br><small>El periodo se guardará primero como “Por enviar”. Podrás revisarlo antes de crear la obligación.</small></div>
          <div class="msg" id="finance-teacher-period-message"></div>
          <div class="nf-form-actions"><button type="submit" class="btn btn-primary" id="finance-teacher-period-save">Guardar periodo</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }
}

function bindEvents(){
  document.getElementById('finance-teacher-new')?.addEventListener('click',() => openTeacherModal());
  document.getElementById('finance-teacher-period-new')?.addEventListener('click',openPeriodModal);
  document.getElementById('finance-teacher-refresh')?.addEventListener('click',loadData);
  document.getElementById('finance-teacher-search')?.addEventListener('input',render);
  document.getElementById('finance-teacher-month')?.addEventListener('change',render);
  document.getElementById('finance-teacher-status')?.addEventListener('change',render);
  document.getElementById('finance-teacher-clear')?.addEventListener('click',clearFilters);

  document.getElementById('finance-teacher-new-close')?.addEventListener('click',closeTeacherModal);
  document.getElementById('finance-teacher-new-back')?.addEventListener('click',event => { if(event.target.id === 'finance-teacher-new-back') closeTeacherModal(); });
  document.getElementById('finance-teacher-new-form')?.addEventListener('submit',saveTeacher);
  document.getElementById('finance-teacher-account')?.addEventListener('change',applyImportedAccount);

  document.getElementById('finance-teacher-period-close')?.addEventListener('click',closePeriodModal);
  document.getElementById('finance-teacher-period-back')?.addEventListener('click',event => { if(event.target.id === 'finance-teacher-period-back') closePeriodModal(); });
  document.getElementById('finance-teacher-period-form')?.addEventListener('submit',savePeriod);
  document.getElementById('finance-teacher-period-teacher')?.addEventListener('change',applyTeacherToPeriod);
  document.getElementById('finance-teacher-period-scheme')?.addEventListener('change',updatePeriodCalculation);
  document.getElementById('finance-teacher-period-units')?.addEventListener('input',updatePeriodCalculation);
  document.getElementById('finance-teacher-period-rate')?.addEventListener('input',updatePeriodCalculation);

  document.getElementById('finance-teacher-profile-rows')?.addEventListener('click',event => {
    const edit = event.target.closest('[data-teacher-edit]');
    if(edit) openTeacherModal(edit.dataset.teacherEdit);
  });
  document.getElementById('finance-teacher-period-rows')?.addEventListener('click',event => {
    const send = event.target.closest('[data-teacher-send]');
    const pay = event.target.closest('[data-teacher-pay]');
    const cancel = event.target.closest('[data-teacher-cancel]');
    if(send) sendToPayables(send.dataset.teacherSend);
    if(pay) openPayables(pay.dataset.teacherPay);
    if(cancel) cancelPeriod(cancel.dataset.teacherCancel);
  });
}

function clearFilters(){
  const search = document.getElementById('finance-teacher-search');
  const month = document.getElementById('finance-teacher-month');
  const status = document.getElementById('finance-teacher-status');
  if(search) search.value = '';
  if(month) month.value = currentMonth();
  if(status) status.value = '';
  render();
}

function teacherAccountOptions(){
  return teacherAccounts
    .filter(account => clean(account.role) === 'teacher' || normalize(account.roleLabel) === 'docente')
    .sort((a,b) => clean(a.name).localeCompare(clean(b.name),'es'));
}

function populateTeacherAccountSelect(){
  const select = document.getElementById('finance-teacher-account');
  if(!select) return;
  const current = select.value;
  const data = teacherAccountOptions();
  select.innerHTML = '<option value="">Registro manual</option>' + data.map(item => `<option value="${esc(item.id)}">${esc(item.name || item.username)} · ${esc(item.detail || item.institutionalEmail || 'Docente')}</option>`).join('');
  if(data.some(item => item.id === current)) select.value = current;
}

function populatePeriodTeacherSelect(){
  const select = document.getElementById('finance-teacher-period-teacher');
  if(!select) return;
  const current = select.value;
  const data = teachers.filter(item => item.estado === 'activo').sort((a,b) => clean(a.nombre).localeCompare(clean(b.nombre),'es'));
  select.innerHTML = '<option value="">Selecciona un docente</option>' + data.map(item => `<option value="${esc(item.id)}">${esc(item.nombre)} · ${esc(item.cursoPrincipal || schemeLabel(item.esquemaPago))}</option>`).join('');
  if(data.some(item => item.id === current)) select.value = current;
}

function applyImportedAccount(){
  const id = clean(document.getElementById('finance-teacher-account')?.value);
  if(!id) return;
  const account = teacherAccounts.find(item => item.id === id);
  if(!account) return;
  const set = (field,value) => { const node = document.getElementById(field); if(node && !clean(node.value)) node.value = clean(value); };
  set('finance-teacher-name',account.name || account.username);
  set('finance-teacher-email',account.institutionalEmail);
  set('finance-teacher-course',account.detail);
}

function openTeacherModal(id=''){
  if(!currentUser || busy) return;
  selectedTeacherId = clean(id);
  const form = document.getElementById('finance-teacher-new-form');
  form?.reset();
  populateTeacherAccountSelect();
  const title = document.getElementById('finance-teacher-new-title');
  const accountSelect = document.getElementById('finance-teacher-account');
  const teacher = teachers.find(item => item.id === selectedTeacherId);
  if(teacher){
    if(title) title.textContent = 'Editar docente financiero';
    if(accountSelect){ accountSelect.value = teacher.userUid || ''; accountSelect.disabled = true; }
    const values = {
      'finance-teacher-name':teacher.nombre,
      'finance-teacher-email':teacher.correoInstitucional,
      'finance-teacher-course':teacher.cursoPrincipal,
      'finance-teacher-document':teacher.numeroDocumento,
      'finance-teacher-scheme':teacher.esquemaPago,
      'finance-teacher-rate':(num(teacher.tarifaCentimos)/100).toFixed(2),
      'finance-teacher-note':teacher.observacion
    };
    Object.entries(values).forEach(([field,value]) => { const node = document.getElementById(field); if(node) node.value = value || ''; });
  }else{
    if(title) title.textContent = 'Docente financiero';
    if(accountSelect) accountSelect.disabled = false;
  }
  setMessage('finance-teacher-new-message','info',teacher ? 'Actualiza únicamente los datos financieros que necesites.' : 'Puedes importar una NostraCUENTA docente o registrar el perfil manualmente.');
  document.getElementById('finance-teacher-new-back')?.classList.add('show');
}

function closeTeacherModal(){
  if(busy) return;
  selectedTeacherId = '';
  const accountSelect = document.getElementById('finance-teacher-account');
  if(accountSelect) accountSelect.disabled = false;
  document.getElementById('finance-teacher-new-back')?.classList.remove('show');
}

async function saveTeacher(event){
  event.preventDefault();
  if(busy || !currentUser) return;
  const accountId = clean(document.getElementById('finance-teacher-account')?.value);
  const name = clean(document.getElementById('finance-teacher-name')?.value);
  const email = clean(document.getElementById('finance-teacher-email')?.value).toLowerCase();
  const course = clean(document.getElementById('finance-teacher-course')?.value);
  const documentNumber = clean(document.getElementById('finance-teacher-document')?.value);
  const scheme = clean(document.getElementById('finance-teacher-scheme')?.value);
  const rate = cents(document.getElementById('finance-teacher-rate')?.value);
  const note = clean(document.getElementById('finance-teacher-note')?.value);
  if(name.length < 2 || name.length > 140) return setMessage('finance-teacher-new-message','err','Escribe un nombre válido.');
  if(email && (email.length > 160 || !email.includes('@'))) return setMessage('finance-teacher-new-message','err','Revisa el correo institucional.');
  if(documentNumber.length > 20) return setMessage('finance-teacher-new-message','err','El DNI / RUC es demasiado largo.');
  if(!SCHEMES.some(item => item[0] === scheme)) return setMessage('finance-teacher-new-message','err','Selecciona una forma de cálculo válida.');
  if(rate <= 0 || rate > 100000000) return setMessage('finance-teacher-new-message','err','Ingresa una tarifa válida.');
  if(note.length > 1000) return setMessage('finance-teacher-new-message','err','La observación es demasiado extensa.');

  const duplicate = teachers.find(item => item.id !== selectedTeacherId && (
    (accountId && item.userUid === accountId) || (email && clean(item.correoInstitucional).toLowerCase() === email)
  ));
  if(duplicate) return setMessage('finance-teacher-new-message','err','Ese docente ya tiene una ficha financiera. Edítala desde el directorio.');

  const button = document.getElementById('finance-teacher-new-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando...'; }
    const emailAdmin = clean(currentUser.email || ADMIN_EMAIL);
    if(selectedTeacherId){
      await updateDoc(doc(db,TEACHER_COLLECTION,selectedTeacherId),{
        nombre:name,
        correoInstitucional:email,
        cursoPrincipal:course,
        numeroDocumento:documentNumber,
        esquemaPago:scheme,
        tarifaCentimos:rate,
        observacion:note,
        estado:'activo',
        actualizadoPor:emailAdmin,
        updatedAt:serverTimestamp()
      });
    }else{
      const ref = doc(collection(db,TEACHER_COLLECTION));
      await setDoc(ref,{
        docenteId:ref.id,
        userUid:accountId,
        nombre:name,
        correoInstitucional:email,
        cursoPrincipal:course,
        numeroDocumento:documentNumber,
        esquemaPago:scheme,
        tarifaCentimos:rate,
        estado:'activo',
        observacion:note,
        origen:'docente_finanzas_admin',
        creadoPor:emailAdmin,
        actualizadoPor:emailAdmin,
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    }
    setMessage('finance-teacher-new-message','ok','Ficha financiera del docente guardada.');
    await loadData();
    window.setTimeout(closeTeacherModal,450);
  }catch(error){
    console.error('No se pudo guardar el docente financiero.',error);
    setMessage('finance-teacher-new-message','err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite guardar docentes financieros. Publica las reglas de la Etapa 11.'
      : 'No se pudo guardar el docente. Inténtalo nuevamente.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = selectedTeacherId ? 'Guardar cambios' : 'Guardar docente'; }
  }
}

function openPeriodModal(){
  if(!currentUser || busy) return;
  const active = teachers.filter(item => item.estado === 'activo');
  if(!active.length){
    setMessage('finance-teacher-message','err','Primero agrega al menos un docente con su tarifa base.');
    return;
  }
  document.getElementById('finance-teacher-period-form')?.reset();
  populatePeriodTeacherSelect();
  const month = document.getElementById('finance-teacher-period-month');
  const due = document.getElementById('finance-teacher-period-due');
  if(month) month.value = currentMonth();
  if(due) due.value = localDate();
  updatePeriodCalculation();
  setMessage('finance-teacher-period-message','info','Registra el trabajo realizado. Después podrás revisarlo antes de enviarlo a Cuentas por pagar.');
  document.getElementById('finance-teacher-period-back')?.classList.add('show');
}

function closePeriodModal(){
  if(busy) return;
  document.getElementById('finance-teacher-period-back')?.classList.remove('show');
}

function applyTeacherToPeriod(){
  const id = clean(document.getElementById('finance-teacher-period-teacher')?.value);
  const teacher = teachers.find(item => item.id === id);
  if(!teacher) return;
  const course = document.getElementById('finance-teacher-period-course');
  const scheme = document.getElementById('finance-teacher-period-scheme');
  const rate = document.getElementById('finance-teacher-period-rate');
  if(course && !clean(course.value)) course.value = teacher.cursoPrincipal || '';
  if(scheme) scheme.value = teacher.esquemaPago;
  if(rate) rate.value = (num(teacher.tarifaCentimos)/100).toFixed(2);
  updatePeriodCalculation();
}

function updatePeriodCalculation(){
  const scheme = clean(document.getElementById('finance-teacher-period-scheme')?.value) || 'hora';
  const units = document.getElementById('finance-teacher-period-units');
  const label = document.getElementById('finance-teacher-units-label');
  if(scheme === 'fijo'){
    if(units){ units.value = '1'; units.disabled = true; }
    if(label) label.textContent = 'Un periodo';
  }else{
    if(units) units.disabled = false;
    if(label) label.textContent = scheme === 'hora' ? 'Horas dictadas' : 'Sesiones / clases';
  }
  const unitValue = scheme === 'fijo' ? 1 : num(units?.value);
  const rate = cents(document.getElementById('finance-teacher-period-rate')?.value);
  const total = Math.round(unitValue * rate);
  const node = document.getElementById('finance-teacher-period-total');
  if(node) node.textContent = money(total);
}

async function savePeriod(event){
  event.preventDefault();
  if(busy || !currentUser) return;
  const teacherId = clean(document.getElementById('finance-teacher-period-teacher')?.value);
  const teacher = teachers.find(item => item.id === teacherId && item.estado === 'activo');
  const month = clean(document.getElementById('finance-teacher-period-month')?.value);
  const due = clean(document.getElementById('finance-teacher-period-due')?.value);
  const course = clean(document.getElementById('finance-teacher-period-course')?.value);
  const room = clean(document.getElementById('finance-teacher-period-room')?.value);
  const scheme = clean(document.getElementById('finance-teacher-period-scheme')?.value);
  const units = scheme === 'fijo' ? 1 : num(document.getElementById('finance-teacher-period-units')?.value);
  const rate = cents(document.getElementById('finance-teacher-period-rate')?.value);
  const total = Math.round(units * rate);
  const note = clean(document.getElementById('finance-teacher-period-note')?.value);
  if(!teacher) return setMessage('finance-teacher-period-message','err','Selecciona un docente activo.');
  if(!/^\d{4}-\d{2}$/.test(month) || month < CONTROL_START_MONTH || month > currentMonth()) return setMessage('finance-teacher-period-message','err','Selecciona un periodo válido desde agosto de 2026 hasta el mes actual.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(due) || due < '2026-08-01') return setMessage('finance-teacher-period-message','err','Selecciona una fecha de vencimiento válida.');
  if(course.length < 2 || course.length > 80 || room.length < 2 || room.length > 80) return setMessage('finance-teacher-period-message','err','Completa correctamente el curso y el salón / ciclo.');
  if(!SCHEMES.some(item => item[0] === scheme)) return setMessage('finance-teacher-period-message','err','Forma de cálculo inválida.');
  if(units <= 0 || units > 1000 || rate <= 0 || rate > 100000000 || total <= 0 || total > 100000000) return setMessage('finance-teacher-period-message','err','Revisa unidades, tarifa y monto total.');

  const ref = doc(collection(db,PERIOD_COLLECTION));
  const button = document.getElementById('finance-teacher-period-save');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando...'; }
    const emailAdmin = clean(currentUser.email || ADMIN_EMAIL);
    await setDoc(ref,{
      periodoId:ref.id,
      docenteId:teacher.id,
      docenteNombre:teacher.nombre,
      numeroDocumento:teacher.numeroDocumento || '',
      periodo:month,
      curso:course,
      salonCiclo:room,
      esquemaPago:scheme,
      unidades:units,
      tarifaCentimos:rate,
      montoGeneradoCentimos:total,
      fechaVencimiento:due,
      observacion:note,
      estado:'por_enviar',
      obligacionId:'',
      origen:'periodo_docente_admin',
      creadoPor:emailAdmin,
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    setMessage('finance-teacher-period-message','ok','Periodo guardado. Revísalo en la tabla y luego envíalo a Cuentas por pagar.');
    await loadData();
    window.setTimeout(closePeriodModal,500);
  }catch(error){
    console.error('No se pudo guardar el periodo docente.',error);
    setMessage('finance-teacher-period-message','err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite registrar periodos docentes. Publica las reglas de la Etapa 11.'
      : 'No se pudo guardar el periodo. Inténtalo nuevamente.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Guardar periodo'; }
  }
}

function obligationFor(period){
  return obligations.find(item => item.id === period.obligacionId) || null;
}

function derivedStatus(period){
  if(period.estado === 'anulado') return 'anulado';
  if(period.estado === 'por_enviar' || !period.obligacionId) return 'por_enviar';
  const obligation = obligationFor(period);
  if(!obligation) return 'pendiente';
  const pending = num(obligation.saldoPendienteCentimos);
  if(clean(obligation.estado) === 'pagada' || pending <= 0) return 'pagado';
  if(clean(obligation.estado) === 'parcial' || num(obligation.montoPagadoCentimos) > 0) return 'parcial';
  if(clean(obligation.fechaVencimiento) < localDate()) return 'vencido';
  return 'pendiente';
}

function statusLabel(status){
  return ({por_enviar:'Por enviar',pendiente:'Pendiente',vencido:'Vencido',parcial:'Pago parcial',pagado:'Pagado',anulado:'Anulado'})[status] || status;
}

function filteredPeriods(){
  const term = normalize(document.getElementById('finance-teacher-search')?.value);
  const month = clean(document.getElementById('finance-teacher-month')?.value);
  const status = clean(document.getElementById('finance-teacher-status')?.value);
  return periods.filter(item => {
    const hay = normalize([item.docenteNombre,item.numeroDocumento,item.curso,item.salonCiclo,item.observacion].join(' '));
    return (!term || hay.includes(term)) && (!month || item.periodo === month) && (!status || derivedStatus(item) === status);
  });
}

function renderSummary(){
  const month = clean(document.getElementById('finance-teacher-month')?.value) || currentMonth();
  const monthPeriods = periods.filter(item => item.periodo === month && item.estado !== 'anulado');
  const generated = monthPeriods.reduce((sum,item) => sum + num(item.montoGeneradoCentimos),0);
  const unsent = monthPeriods.filter(item => item.estado === 'por_enviar').reduce((sum,item) => sum + num(item.montoGeneradoCentimos),0);
  const linkedIds = new Set(periods.filter(item => item.obligacionId && item.estado !== 'anulado').map(item => item.obligacionId));
  const pending = obligations.filter(item => linkedIds.has(item.id)).reduce((sum,item) => sum + Math.max(0,num(item.saldoPendienteCentimos)),0);
  const set = (id,value) => { const node = document.getElementById(id); if(node) node.textContent = value; };
  set('finance-teacher-active',String(teachers.filter(item => item.estado === 'activo').length));
  set('finance-teacher-generated',money(generated));
  set('finance-teacher-unsent',money(unsent));
  set('finance-teacher-pending',money(pending));
  set('finance-teacher-profile-summary',`${teachers.length} docente${teachers.length === 1 ? '' : 's'} configurado${teachers.length === 1 ? '' : 's'} · ${teacherAccountOptions().length} NostraCUENTAS docentes detectadas`);
  set('finance-teacher-period-summary',`${monthLabel(month)} · ${monthPeriods.length} periodo${monthPeriods.length === 1 ? '' : 's'} · ${money(generated)} generado`);
}

function renderProfiles(){
  const rows = document.getElementById('finance-teacher-profile-rows');
  if(!rows) return;
  if(!teachers.length){
    rows.innerHTML = '<tr><td colspan="7" class="nteach-empty">Aún no hay docentes financieros configurados.</td></tr>';
    return;
  }
  rows.innerHTML = teachers.slice().sort((a,b) => clean(a.nombre).localeCompare(clean(b.nombre),'es')).map(item => `<tr>
    <td><b>${esc(item.nombre)}</b><span class="nteach-muted">${esc(item.correoInstitucional || 'Sin correo enlazado')}${item.userUid ? ' · NostraCUENTA vinculada' : ''}</span></td>
    <td>${esc(item.cursoPrincipal || '-')}</td>
    <td>${esc(item.numeroDocumento || '-')}</td>
    <td>${esc(schemeLabel(item.esquemaPago))}</td>
    <td><b>${esc(money(item.tarifaCentimos))}</b></td>
    <td><span class="nteach-status ${item.estado === 'activo' ? 'pagado' : 'anulado'}">${item.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
    <td><button type="button" class="nteach-action secondary" data-teacher-edit="${esc(item.id)}">Editar</button></td>
  </tr>`).join('');
}

function renderPeriods(){
  const rows = document.getElementById('finance-teacher-period-rows');
  if(!rows) return;
  const priority = {vencido:0,por_enviar:1,parcial:2,pendiente:3,pagado:4,anulado:5};
  const data = filteredPeriods().sort((a,b) => (priority[derivedStatus(a)]??9)-(priority[derivedStatus(b)]??9) || clean(b.periodo).localeCompare(clean(a.periodo)) || clean(a.docenteNombre).localeCompare(clean(b.docenteNombre),'es'));
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="8" class="nteach-empty">No hay periodos docentes para los filtros seleccionados.</td></tr>';
    return;
  }
  rows.innerHTML = data.map(item => {
    const obligation = obligationFor(item);
    const status = derivedStatus(item);
    const paid = obligation ? num(obligation.montoPagadoCentimos) : 0;
    const pending = obligation ? num(obligation.saldoPendienteCentimos) : num(item.montoGeneradoCentimos);
    const unitLabel = item.esquemaPago === 'hora' ? `${num(item.unidades)} h` : item.esquemaPago === 'sesion' ? `${num(item.unidades)} sesión${num(item.unidades) === 1 ? '' : 'es'}` : 'Monto fijo';
    let actions = '';
    if(status === 'por_enviar') actions = `<button type="button" class="nteach-action" data-teacher-send="${esc(item.id)}">Enviar a CxP</button><button type="button" class="nteach-action danger" data-teacher-cancel="${esc(item.id)}">Anular</button>`;
    else if(status !== 'anulado') actions = `<button type="button" class="nteach-action secondary" data-teacher-pay="${esc(item.id)}">${status === 'pagado' ? 'Ver en CxP' : 'Gestionar pago'}</button>`;
    else actions = '<span class="nteach-muted">Sin acciones</span>';
    return `<tr>
      <td><b>${esc(item.docenteNombre)}</b><span class="nteach-muted">${esc(item.numeroDocumento || 'Sin DNI/RUC')}</span></td>
      <td><b>${esc(monthLabel(item.periodo))}</b><span class="nteach-muted">${esc(item.curso)} · ${esc(item.salonCiclo)}<br>Vence: ${esc(dateLabel(item.fechaVencimiento))}</span></td>
      <td>${esc(schemeLabel(item.esquemaPago))}<span class="nteach-muted">${esc(unitLabel)} × ${esc(money(item.tarifaCentimos))}</span></td>
      <td><span class="nteach-money">${esc(money(item.montoGeneradoCentimos))}</span></td>
      <td><span class="nteach-money paid">${esc(money(paid))}</span></td>
      <td><span class="nteach-money ${status === 'vencido' ? 'overdue' : 'pending'}">${esc(money(pending))}</span></td>
      <td><span class="nteach-status ${status}">${esc(statusLabel(status))}</span>${item.obligacionId ? `<span class="nteach-muted">CxP vinculada</span>` : ''}</td>
      <td><div class="nteach-row-actions">${actions}</div></td>
    </tr>`;
  }).join('');
}

function render(){
  if(!ensurePanel()) return;
  renderSummary();
  renderProfiles();
  renderPeriods();
}

function obligationConcept(period){
  const raw = `Honorarios ${period.periodo} · ${period.curso} · ${period.salonCiclo}`;
  return raw.slice(0,160);
}

async function sendToPayables(id){
  if(busy || !currentUser) return;
  const period = periods.find(item => item.id === id);
  if(!period || period.estado !== 'por_enviar' || period.obligacionId) return;
  if(!window.confirm(`¿Crear una cuenta por pagar de ${money(period.montoGeneradoCentimos)} para ${period.docenteNombre}?`)) return;
  const obligationRef = doc(collection(db,OBLIGATION_COLLECTION));
  const periodRef = doc(db,PERIOD_COLLECTION,period.id);
  const emailAdmin = clean(currentUser.email || ADMIN_EMAIL);
  const batch = writeBatch(db);
  batch.set(obligationRef,{
    obligacionId:obligationRef.id,
    beneficiario:period.docenteNombre,
    tipoBeneficiario:'docente',
    categoria:'docentes',
    concepto:obligationConcept(period),
    numeroDocumento:period.numeroDocumento || '',
    montoProgramadoCentimos:num(period.montoGeneradoCentimos),
    montoPagadoCentimos:0,
    saldoPendienteCentimos:num(period.montoGeneradoCentimos),
    fechaVencimiento:period.fechaVencimiento,
    estado:'pendiente',
    observacion:period.observacion || '',
    origen:'cuenta_por_pagar_admin',
    creadoPor:emailAdmin,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });
  batch.update(periodRef,{
    estado:'enviado',
    obligacionId:obligationRef.id,
    enviadoCuentasPorPagarAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });
  try{
    busy = true;
    setMessage('finance-teacher-message','info','Creando la obligación docente en Cuentas por pagar...');
    await batch.commit();
    setMessage('finance-teacher-message','ok','Periodo enviado a Cuentas por pagar. Ya puede recibir pagos parciales o totales desde el flujo auditado.');
    await loadData();
    document.getElementById('finance-payable-refresh')?.click();
  }catch(error){
    console.error('No se pudo enviar el periodo a Cuentas por pagar.',error);
    setMessage('finance-teacher-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó el enlace. Publica las reglas de la Etapa 11.'
      : 'No se pudo crear la obligación. Ningún registro parcial fue guardado.');
  }finally{
    busy = false;
  }
}

async function cancelPeriod(id){
  if(busy || !currentUser) return;
  const period = periods.find(item => item.id === id);
  if(!period || period.estado !== 'por_enviar' || period.obligacionId) return;
  const reason = clean(window.prompt('Motivo de la anulación del periodo:') || '');
  if(reason.length < 5 || reason.length > 500) return setMessage('finance-teacher-message','err','El motivo de anulación debe tener entre 5 y 500 caracteres.');
  try{
    busy = true;
    await updateDoc(doc(db,PERIOD_COLLECTION,id),{
      estado:'anulado',
      motivoAnulacion:reason,
      anuladoPor:clean(currentUser.email || ADMIN_EMAIL),
      anuladoEn:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    await loadData();
    setMessage('finance-teacher-message','ok','Periodo anulado. No se creó ninguna cuenta por pagar.');
  }catch(error){
    console.error('No se pudo anular el periodo docente.',error);
    setMessage('finance-teacher-message','err',error?.code === 'permission-denied' ? 'Firebase rechazó la anulación. Publica las reglas de la Etapa 11.' : 'No se pudo anular el periodo.');
  }finally{
    busy = false;
  }
}

function openPayables(periodId){
  const period = periods.find(item => item.id === periodId);
  if(!period?.obligacionId) return;
  const accordion = document.getElementById('finance-accordion-payables');
  if(accordion) accordion.open = true;
  const search = document.getElementById('finance-payable-search');
  const type = document.getElementById('finance-payable-type');
  const category = document.getElementById('finance-payable-category');
  const status = document.getElementById('finance-payable-status');
  if(search){ search.value = period.docenteNombre; search.dispatchEvent(new Event('input',{bubbles:true})); }
  if(type){ type.value = 'docente'; type.dispatchEvent(new Event('change',{bubbles:true})); }
  if(category){ category.value = 'docentes'; category.dispatchEvent(new Event('change',{bubbles:true})); }
  if(status){ status.value = ''; status.dispatchEvent(new Event('change',{bubbles:true})); }
  window.setTimeout(() => accordion?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}

async function loadData(){
  if(!currentUser || loading || !ensurePanel()) return;
  loading = true;
  const button = document.getElementById('finance-teacher-refresh');
  if(button){ button.disabled = true; button.textContent = 'Actualizando...'; }
  setMessage('finance-teacher-message','info','Actualizando docentes, periodos y obligaciones...');
  try{
    const [userSnap,teacherSnap,periodSnap,obligationSnap] = await Promise.all([
      getDocs(query(collection(db,USER_COLLECTION),limit(1000))),
      getDocs(query(collection(db,TEACHER_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS))),
      getDocs(query(collection(db,PERIOD_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS))),
      getDocs(query(collection(db,OBLIGATION_COLLECTION),orderBy('createdAt','desc'),limit(MAX_RECORDS)))
    ]);
    teacherAccounts = userSnap.docs.map(item => ({id:item.id,...item.data()}));
    teachers = teacherSnap.docs.map(item => ({id:item.id,...item.data()}));
    periods = periodSnap.docs.map(item => ({id:item.id,...item.data()}));
    obligations = obligationSnap.docs.map(item => ({id:item.id,...item.data()}));
    populateTeacherAccountSelect();
    populatePeriodTeacherSelect();
    render();
    setMessage('finance-teacher-message','ok',`Control docente actualizado: ${teachers.length} docentes financieros, ${periods.length} periodos y ${teacherAccountOptions().length} NostraCUENTAS docentes detectadas.`);
  }catch(error){
    console.error('No se pudo cargar el control financiero docente.',error);
    setMessage('finance-teacher-message','err',error?.code === 'permission-denied'
      ? 'Firebase todavía no permite leer el control financiero docente. Publica las reglas de la Etapa 11.'
      : 'No se pudo actualizar el control docente. Revisa la conexión e inténtalo nuevamente.');
  }finally{
    loading = false;
    if(button){ button.disabled = false; button.textContent = 'Actualizar'; }
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
      console.warn('No se encontró el panel financiero para Control docente.');
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
