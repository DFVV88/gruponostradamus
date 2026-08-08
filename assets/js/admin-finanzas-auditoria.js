/* ==================================================
   Grupo Nostradamus - Auditoría financiera
   Anulación segura sin eliminar movimientos.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
  doc,
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
const AUDIT_COLLECTION = 'finanzas_auditoria';
const TRANSFER_CATEGORY = 'transferencia_interna';

const ACCOUNTS = {
  caja_efectivo:'Caja en efectivo',
  yape:'Yape',
  plin:'Plin',
  bcp:'Cuenta BCP',
  culqi:'Pasarela Culqi',
  otra:'Otra cuenta'
};

const CATEGORIES = {
  matricula:'Matrícula',
  pension:'Pensión',
  materiales:'Materiales e impresiones',
  simulacro:'Simulacro',
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
let selectedMovement = null;
let busy = false;
let ready = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const num = value => {
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
};
const money = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(num(value));
const accountLabel = value => ACCOUNTS[value] || value || '-';
const categoryLabel = value => CATEGORIES[value] || value || '-';
const isTransfer = item => item?.categoria === TRANSFER_CATEGORY;
const isPayableMovement = item => item?.origen === 'pago_obligacion_admin';

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

function setMessage(id,type,text){
  const element = document.getElementById(id);
  if(!element) return;
  element.className = `msg ${type}`;
  element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('finance-audit-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-audit-styles';
  style.textContent = `
    .nf-audit-section{padding:18px;border:1px solid rgba(7,140,149,.13);border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(6,20,38,.055)}
    .nf-audit-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:14px}
    .nf-audit-head h3{margin:0;color:#061426;font-family:'Baloo 2';font-size:28px;line-height:1}
    .nf-audit-head p{margin:5px 0 0;color:#647482;font-size:12px}
    .nf-audit-seal{padding:7px 10px;border-radius:999px;background:#eef8fa;color:#075b65;font-size:10px;font-weight:950;white-space:nowrap}
    .nf-audit-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:12px}
    .nf-audit-summary article{padding:12px 14px;border:1px solid #e1ecef;border-radius:15px;background:#fbfdfe}
    .nf-audit-summary span{display:block;color:#71808c;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}
    .nf-audit-summary strong{display:block;margin-top:4px;color:#061426;font-family:'Baloo 2';font-size:23px;line-height:1}
    .nf-audit-summary .active strong{color:#14855a}.nf-audit-summary .void strong{color:#c73931}
    .nf-audit-filters{display:grid;grid-template-columns:minmax(170px,.55fr) minmax(260px,1.4fr) auto;gap:9px;margin-bottom:12px}
    .nf-audit-filters label span{display:block;margin-bottom:5px;color:#061426;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}
    .nf-audit-filters input,.nf-audit-filters select{width:100%;border:1px solid #dce9ed;border-radius:12px;padding:10px 11px;background:#fbfdfe;color:#172033;font:inherit;font-size:13px;outline:none}
    .nf-audit-filters input:focus,.nf-audit-filters select:focus{border-color:#078c95;box-shadow:0 0 0 3px rgba(7,140,149,.1)}
    .nf-audit-filters .btn{align-self:end;padding:10px 14px;font-size:11px}
    .nf-audit-table table{min-width:1080px}
    .nf-audit-table th{font-size:10px}
    .nf-audit-status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.25px}
    .nf-audit-status.active{background:#eaf9f1;color:#14855a}.nf-audit-status.void{background:#fff0ef;color:#b42318}
    .nf-audit-operation{display:block;margin-top:4px;color:#87939d;font-size:9px;font-weight:750}
    .nf-audit-reason{display:block;margin-top:5px;padding:6px 8px;border-radius:9px;background:#fff4f2;color:#9d2f28;font-size:10px;line-height:1.35}
    .nf-audit-user{display:block;margin-top:3px;color:#7d8992;font-size:9px}
    .nf-audit-amount{font-weight:950;white-space:nowrap}.nf-audit-amount.income{color:#14855a}.nf-audit-amount.expense{color:#c73931}.nf-audit-amount.void{text-decoration:line-through;color:#8c969d}
    .nf-audit-action{border:1px solid #ffd1cc;border-radius:999px;padding:7px 10px;background:#fff5f4;color:#a92d25;font:inherit;font-size:10px;font-weight:950;cursor:pointer;white-space:nowrap}
    .nf-audit-action:hover{background:#ffe9e6}.nf-audit-action:disabled{opacity:.45;cursor:not-allowed}
    .nf-audit-none{color:#87939d;font-size:10px;font-weight:800}
    .nf-audit-managed{display:inline-flex;max-width:145px;padding:6px 8px;border-radius:10px;background:#eef8fa;color:#075b65;font-size:9px;font-weight:850;line-height:1.25}
    .nf-audit-modal-note{margin-top:12px;padding:11px 13px;border:1px solid rgba(217,45,32,.18);border-radius:14px;background:#fff4f2;color:#8c2923;font-size:11px;font-weight:800;line-height:1.45}
    .nf-audit-target{margin:12px 0;padding:12px;border:1px solid #dce9ed;border-radius:14px;background:#f8fcfd;color:#172033;font-size:12px;line-height:1.45}
    .nf-audit-target strong{color:#061426}
    @media(max-width:720px){.nf-audit-head{display:block}.nf-audit-seal{display:inline-flex;margin-top:9px}.nf-audit-summary,.nf-audit-filters{grid-template-columns:1fr}.nf-audit-filters .btn{width:100%;margin:0}.nf-audit-summary{grid-template-columns:1fr 1fr 1fr}}
  `;
  document.head.appendChild(style);
}

function buildSection(panel){
  if(document.getElementById('finance-audit-section')) return;
  const section = document.createElement('section');
  section.id = 'finance-audit-section';
  section.className = 'nf-audit-section';
  section.innerHTML = `
    <div class="nf-audit-head">
      <div><h3>Auditoría y anulaciones</h3><p>Los movimientos no se eliminan. Una anulación conserva el registro original, el motivo, el usuario responsable y la fecha.</p></div>
      <span class="nf-audit-seal">Historial protegido</span>
    </div>
    <div class="nf-audit-summary">
      <article class="active"><span>Activos</span><strong id="finance-audit-active-count">0</strong></article>
      <article class="void"><span>Anulados</span><strong id="finance-audit-void-count">0</strong></article>
      <article><span>Total registrado</span><strong id="finance-audit-total-count">0</strong></article>
    </div>
    <div class="nf-audit-filters">
      <label><span>Estado</span><select id="finance-audit-status"><option value="activo">Movimientos activos</option><option value="anulado">Movimientos anulados</option><option value="all">Todos los movimientos</option></select></label>
      <label><span>Buscar</span><input id="finance-audit-search" placeholder="Concepto, cuenta, operación, usuario o motivo"></label>
      <button type="button" class="btn btn-light" id="finance-audit-refresh">Actualizar auditoría</button>
    </div>
    <div class="msg" id="finance-audit-message"></div>
    <div class="table-wrap nf-audit-table">
      <table>
        <thead><tr><th>Fecha</th><th>Estado</th><th>Movimiento</th><th>Cuenta</th><th>Monto</th><th>Registro / auditoría</th><th>Acción</th></tr></thead>
        <tbody id="finance-audit-rows"><tr><td colspan="7">Cargando auditoría...</td></tr></tbody>
      </table>
    </div>`;
  panel.appendChild(section);

  const modal = document.createElement('div');
  modal.id = 'finance-void-back';
  modal.className = 'nf-modal-back';
  modal.innerHTML = `
    <div class="nf-modal nf-transfer-modal" role="dialog" aria-modal="true" aria-labelledby="finance-void-title">
      <div class="nf-modal-head"><div><h2 id="finance-void-title">Anular movimiento</h2><p>La operación dejará de afectar saldos y reportes, pero permanecerá en el historial.</p></div><button type="button" class="btn btn-light" id="finance-void-close">Cerrar</button></div>
      <form id="finance-void-form">
        <div class="nf-audit-target" id="finance-void-target"></div>
        <div class="nf-form-grid">
          <label class="wide"><span>Motivo de la anulación</span><textarea id="finance-void-reason" minlength="5" maxlength="500" rows="4" required placeholder="Ej. Registro de prueba o monto ingresado incorrectamente"></textarea></label>
        </div>
        <div class="nf-audit-modal-note" id="finance-void-note">Esta acción no borra información y no puede revertirse desde esta etapa.</div>
        <div class="msg" id="finance-void-message"></div>
        <div class="nf-form-actions"><button type="submit" class="btn btn-red" id="finance-void-save">Confirmar anulación</button></div>
      </form>
    </div>`;
  document.body.appendChild(modal);
}

function bindEvents(){
  document.getElementById('finance-audit-status')?.addEventListener('change',render);
  document.getElementById('finance-audit-search')?.addEventListener('input',render);
  document.getElementById('finance-audit-refresh')?.addEventListener('click',loadMovements);
  document.getElementById('finance-audit-rows')?.addEventListener('click',event => {
    const button = event.target.closest('[data-finance-void]');
    if(button) openVoidModal(button.dataset.financeVoid);
  });
  document.getElementById('finance-void-close')?.addEventListener('click',closeVoidModal);
  document.getElementById('finance-void-back')?.addEventListener('click',event => {
    if(event.target.id === 'finance-void-back') closeVoidModal();
  });
  document.getElementById('finance-void-form')?.addEventListener('submit',voidMovement);
  document.addEventListener('click',event => {
    if(event.target.closest('#finance-refresh')) setTimeout(loadMovements,700);
  });
  document.addEventListener('submit',event => {
    if(event.target.matches('#finance-form,#finance-transfer-form,#finance-payable-payment-form')) setTimeout(loadMovements,1300);
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
  if(currentUser) loadMovements();
  return true;
}

async function loadMovements(){
  if(!currentUser || !setup()) return;
  const rows = document.getElementById('finance-audit-rows');
  if(rows) rows.innerHTML = '<tr><td colspan="7">Cargando auditoría...</td></tr>';
  setMessage('finance-audit-message','info','Actualizando el historial financiero...');
  try{
    const snapshot = await getDocs(query(collection(db,MOVEMENTS_COLLECTION),orderBy('createdAt','desc'),limit(2000)));
    movements = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    render();
    setMessage('finance-audit-message','ok',movements.length
      ? 'Auditoría financiera actualizada.'
      : 'Todavía no existen movimientos financieros.');
  }catch(error){
    console.error(error);
    movements = [];
    render();
    setMessage('finance-audit-message','err','No se pudo cargar la auditoría financiera.');
  }
}

function filteredMovements(){
  const status = clean(document.getElementById('finance-audit-status')?.value) || 'activo';
  const term = clean(document.getElementById('finance-audit-search')?.value).toLowerCase();
  return movements.filter(item => {
    const state = clean(item.estado) || 'activo';
    const statusOk = status === 'all' || state === status;
    const haystack = [
      item.concepto,
      categoryLabel(item.categoria),
      accountLabel(item.cuenta),
      item.numeroOperacion,
      item.observacion,
      item.creadoPor,
      item.motivoAnulacion,
      item.anuladoPor
    ].map(clean).join(' ').toLowerCase();
    return statusOk && (!term || haystack.includes(term));
  });
}

function render(){
  const activeCount = movements.filter(item => (item.estado || 'activo') === 'activo').length;
  const voidCount = movements.filter(item => item.estado === 'anulado').length;
  const set = (id,value) => { const element = document.getElementById(id); if(element) element.textContent = String(value); };
  set('finance-audit-active-count',activeCount);
  set('finance-audit-void-count',voidCount);
  set('finance-audit-total-count',movements.length);

  const data = filteredMovements();
  const rows = document.getElementById('finance-audit-rows');
  if(!rows) return;
  if(!data.length){
    rows.innerHTML = '<tr><td colspan="7">No hay movimientos para los filtros seleccionados.</td></tr>';
    return;
  }

  rows.innerHTML = data.map(item => {
    const active = (item.estado || 'activo') === 'activo';
    const income = item.tipo === 'ingreso';
    const transfer = isTransfer(item);
    const payable = isPayableMovement(item);
    const amountClass = active ? (income ? 'income' : 'expense') : 'void';
    const registeredBy = clean(item.creadoPor) || '-';
    const auditedBy = clean(item.anuladoPor);
    const actionText = transfer ? 'Anular transferencia' : 'Anular';
    const action = !active
      ? '<span class="nf-audit-none">Sin acciones</span>'
      : payable
        ? '<span class="nf-audit-managed">Gestionar desde Cuentas por pagar</span>'
        : `<button type="button" class="nf-audit-action" data-finance-void="${esc(item.id)}">${esc(actionText)}</button>`;
    return `<tr>
      <td><b>${esc(dateLabel(item.fechaOperacion))}</b><span class="nf-audit-operation">${esc(item.numeroOperacion || 'Sin número de operación')}</span></td>
      <td><span class="nf-audit-status ${active ? 'active' : 'void'}">${active ? 'Activo' : 'Anulado'}</span></td>
      <td><b>${esc(categoryLabel(item.categoria))}</b><br><small>${esc(item.concepto)}</small>${item.observacion ? `<br><small class="nf-muted">${esc(item.observacion)}</small>` : ''}${!active && item.motivoAnulacion ? `<span class="nf-audit-reason">Motivo: ${esc(item.motivoAnulacion)}</span>` : ''}</td>
      <td>${esc(accountLabel(item.cuenta))}<br><small>${esc(transfer ? 'Transferencia interna' : payable ? 'Pago de obligación' : (item.origen || 'Registro manual'))}</small></td>
      <td class="nf-audit-amount ${amountClass}">${income ? '+' : '-'} ${esc(money(item.monto))}</td>
      <td><small>Registrado: ${esc(timestampLabel(item.createdAt))}</small><span class="nf-audit-user">${esc(registeredBy)}</span>${!active ? `<br><small>Anulado: ${esc(timestampLabel(item.anuladoEn))}</small><span class="nf-audit-user">${esc(auditedBy || '-')}</span>` : ''}</td>
      <td>${action}</td>
    </tr>`;
  }).join('');
}

function transferTargets(item){
  if(!isTransfer(item)) return [item];
  const operation = clean(item.numeroOperacion);
  if(!operation) return [item];
  return movements.filter(candidate =>
    (candidate.estado || 'activo') === 'activo' &&
    isTransfer(candidate) &&
    clean(candidate.numeroOperacion) === operation &&
    clean(candidate.fechaOperacion) === clean(item.fechaOperacion) &&
    num(candidate.monto) === num(item.monto)
  );
}

function openVoidModal(id){
  if(!currentUser || busy) return;
  const item = movements.find(candidate => candidate.id === id);
  if(!item || (item.estado || 'activo') !== 'activo' || isPayableMovement(item)) return;
  selectedMovement = item;
  const targets = transferTargets(item);
  const target = document.getElementById('finance-void-target');
  const title = document.getElementById('finance-void-title');
  const note = document.getElementById('finance-void-note');
  const reason = document.getElementById('finance-void-reason');
  document.getElementById('finance-void-form')?.reset();

  if(title) title.textContent = isTransfer(item) ? 'Anular transferencia' : 'Anular movimiento';
  if(target){
    target.innerHTML = `<strong>${esc(categoryLabel(item.categoria))}</strong><br>${esc(item.concepto)}<br>${esc(dateLabel(item.fechaOperacion))} · ${esc(accountLabel(item.cuenta))} · ${esc(money(item.monto))}`;
  }
  if(note){
    note.textContent = isTransfer(item) && targets.length > 1
      ? `Se anularán conjuntamente los ${targets.length} movimientos que forman esta transferencia. Así no se rompe el saldo entre las cuentas de origen y destino.`
      : 'El movimiento dejará de afectar los saldos y reportes, pero seguirá visible con su motivo de anulación.';
  }
  setMessage('finance-void-message','info','Escribe un motivo claro antes de confirmar.');
  document.getElementById('finance-void-back')?.classList.add('show');
  setTimeout(() => reason?.focus(),60);
}

function closeVoidModal(){
  if(busy) return;
  selectedMovement = null;
  document.getElementById('finance-void-back')?.classList.remove('show');
}

async function voidMovement(event){
  event.preventDefault();
  if(busy || !currentUser || !selectedMovement || isPayableMovement(selectedMovement)) return;
  const reason = clean(document.getElementById('finance-void-reason')?.value);
  if(reason.length < 5 || reason.length > 500){
    return setMessage('finance-void-message','err','El motivo debe tener entre 5 y 500 caracteres.');
  }

  const targets = transferTargets(selectedMovement);
  if(!targets.length) return setMessage('finance-void-message','err','No se encontraron movimientos activos para anular.');

  try{
    busy = true;
    const save = document.getElementById('finance-void-save');
    if(save){ save.disabled = true; save.textContent = 'Anulando...'; }
    setMessage('finance-void-message','info','Registrando la anulación y su auditoría...');

    const batch = writeBatch(db);
    targets.forEach(item => {
      const movementRef = doc(db,MOVEMENTS_COLLECTION,item.id);
      const auditRef = doc(db,AUDIT_COLLECTION,item.id);
      batch.update(movementRef,{
        estado:'anulado',
        motivoAnulacion:reason,
        anuladoPor:currentUser.email || ADMIN_EMAIL,
        anuladoEn:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      batch.set(auditRef,{
        movimientoId:item.id,
        accion:'anulacion',
        motivo:reason,
        estadoAnterior:'activo',
        estadoNuevo:'anulado',
        ejecutadoPor:currentUser.email || ADMIN_EMAIL,
        fechaOperacion:clean(item.fechaOperacion),
        tipo:clean(item.tipo),
        categoria:clean(item.categoria),
        concepto:clean(item.concepto),
        monto:num(item.monto),
        cuenta:clean(item.cuenta),
        numeroOperacion:clean(item.numeroOperacion),
        origen:clean(item.origen) || 'manual_admin',
        createdAt:serverTimestamp()
      });
    });

    await batch.commit();
    setMessage('finance-void-message','ok',targets.length > 1
      ? 'Transferencia anulada correctamente en ambas cuentas.'
      : 'Movimiento anulado correctamente.');
    await loadMovements();
    document.getElementById('finance-refresh')?.click();
    setTimeout(closeVoidModal,700);
  }catch(error){
    console.error(error);
    setMessage('finance-void-message','err',error?.code === 'permission-denied'
      ? 'Firebase rechazó la anulación. Deben publicarse las nuevas reglas de auditoría en Firestore.'
      : 'No se pudo anular el movimiento. Inténtalo nuevamente.');
  }finally{
    busy = false;
    const save = document.getElementById('finance-void-save');
    if(save){ save.disabled = false; save.textContent = 'Confirmar anulación'; }
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
    loadMovements();
  }
});

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
