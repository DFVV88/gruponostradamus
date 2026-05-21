/* ==================================================
   Grupo Nostradamus - Admin Preinscripciones + NostraCUENTAS
   Lee y actualiza preinscripciones, valida pagos y administra cuentas.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId: 'nostrachat-grupo-nostradamus',
  storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId: '869749182265',
  appId: '1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let records = [];
let accounts = [];
let currentId = null;
let currentMode = 'ficha';
let accountActionBusy = false;

const $ = (id) => document.getElementById(id);
const els = {
  authCard: $('auth-card'), adminPanel: $('admin-panel'), googleLogin: $('google-login-btn'), logout: $('logout-btn'), authMsg: $('auth-message'),
  rows: $('rows'), search: $('search-input'), estadoFilter: $('estado-filter'), pagoFilter: $('pago-filter'), refresh: $('refresh-btn'),
  statTotal: $('stat-total'), statNuevos: $('stat-nuevos'), statPagos: $('stat-pagos'), statValidados: $('stat-validados'),
  modalBack: $('modal-back'), closeModal: $('close-modal'), modalTitle: $('modal-title'), modalSubtitle: $('modal-subtitle'), detailGrid: $('detail-grid'),
  editEstado: $('edit-estado'), editAsesor: $('edit-asesor'), editEstadoPago: $('edit-estado-pago'), editPagoObs: $('edit-pago-observacion'),
  saveBtn: $('save-btn'), approveBtn: $('approve-btn'), rejectBtn: $('reject-btn'), modalMsg: $('modal-message')
};

function message(el, type, text){ if(el){ el.className = 'msg ' + type; el.innerHTML = text; } }
function clean(value){ return String(value || '').trim(); }
function esc(value){ return clean(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function badge(text, type=''){ return `<span class="badge ${type}">${esc(text || '-')}</span>`; }
function paymentBadge(value){
  if(value === 'pago_validado') return badge('Pago validado','green');
  if(value === 'pago_observado' || value === 'pago_rechazado') return badge(value,'red');
  if(value === 'pendiente_envio_voucher') return badge('Pendiente voucher','orange');
  if(value === 'pendiente_pago_online') return badge('Pendiente online','orange');
  return badge(value || 'Sin estado','');
}
function estadoBadge(value){
  if(value === 'matriculado' || value === 'listo_para_matricula') return badge(value,'green');
  if(value === 'observado' || value === 'rechazado') return badge(value,'red');
  if(value === 'pago_en_revision' || value === 'contactado') return badge(value,'orange');
  return badge(value || 'nuevo','');
}
function getAccountStatus(account){
  if(account.blocked === true || account.status === 'blocked') return 'blocked';
  if(account.status === 'active') return 'active';
  return 'pending';
}
function accountStatusBadge(account){
  const status = typeof account === 'string' ? account : getAccountStatus(account || {});
  if(status === 'active') return badge('Activa','green');
  if(status === 'blocked') return badge('Bloqueada','red');
  return badge('Pendiente','orange');
}
function showApp(isAdmin){ els.authCard.classList.toggle('hidden', isAdmin); els.adminPanel.classList.toggle('hidden', !isAdmin); els.logout.classList.toggle('hidden', !isAdmin); }

function ensureAccountsPanel(){
  if(document.getElementById('nostra-accounts-panel')) return;
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = 'nostra-accounts-panel';
  panel.style.marginTop = '22px';
  panel.innerHTML = `
    <h2 style="font-family:'Baloo 2';font-size:38px;line-height:1;color:#061426;margin:0 0 8px;">NostraCUENTAS</h2>
    <p style="color:#4b5d70;font-size:17px;margin:0 0 16px;">Administra cuentas creadas con Microsoft 365: activa alumnos, bloquea accesos y reabre cuentas pendientes.</p>
    <div class="stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px;">
      <div class="stat"><strong id="account-stat-total">0</strong><span>Total cuentas</span></div>
      <div class="stat"><strong id="account-stat-pending">0</strong><span>Pendientes</span></div>
      <div class="stat"><strong id="account-stat-active">0</strong><span>Activas</span></div>
      <div class="stat"><strong id="account-stat-blocked">0</strong><span>Bloqueadas</span></div>
    </div>
    <div class="toolbar" style="grid-template-columns:1.5fr 1fr auto;">
      <input id="account-search" placeholder="Buscar por nombre, usuario corto o correo institucional">
      <select id="account-filter">
        <option value="pending">Pendientes</option>
        <option value="active">Activas</option>
        <option value="blocked">Bloqueadas</option>
        <option value="">Todas</option>
      </select>
      <button class="btn btn-blue" id="accounts-refresh-btn">Actualizar cuentas</button>
    </div>
    <div class="msg" id="accounts-message"></div>
    <div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Usuario corto</th><th>Correo institucional</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="account-rows"><tr><td colspan="5">Cargando...</td></tr></tbody></table></div>`;
  els.adminPanel.appendChild(panel);
  document.getElementById('account-search').addEventListener('input', renderAccountsTable);
  document.getElementById('account-filter').addEventListener('change', renderAccountsTable);
  document.getElementById('accounts-refresh-btn').addEventListener('click', loadAccounts);
}

async function loadRecords(){
  els.rows.innerHTML = '<tr><td colspan="7">Cargando preinscripciones...</td></tr>';
  try{
    const q = query(collection(db, 'preinscripciones'), orderBy('createdAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderStats(); renderTable();
  }catch(err){
    console.error(err);
    els.rows.innerHTML = '<tr><td colspan="7">No se pudo cargar. Verifica login y reglas de Firebase.</td></tr>';
  }
}

async function loadAccounts(){
  ensureAccountsPanel();
  const body = document.getElementById('account-rows');
  const accountsMsg = document.getElementById('accounts-message');
  if(body) body.innerHTML = '<tr><td colspan="5">Cargando NostraCUENTAS...</td></tr>';
  message(accountsMsg, 'info', 'Cargando cuentas...');
  try{
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(500)));
    accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAccountStats();
    renderAccountsTable();
    message(accountsMsg, 'ok', 'NostraCUENTAS actualizadas.');
  }catch(err){
    console.error(err);
    if(body) body.innerHTML = '<tr><td colspan="5">No se pudo cargar NostraCUENTAS. Revisa permisos.</td></tr>';
    message(accountsMsg, 'err', 'No se pudo cargar NostraCUENTAS. Revisa permisos de Firebase.');
  }
}

function renderAccountStats(){
  const set = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  set('account-stat-total', accounts.length);
  set('account-stat-pending', accounts.filter(a => getAccountStatus(a) === 'pending').length);
  set('account-stat-active', accounts.filter(a => getAccountStatus(a) === 'active').length);
  set('account-stat-blocked', accounts.filter(a => getAccountStatus(a) === 'blocked').length);
}

function filteredAccounts(){
  const term = clean(document.getElementById('account-search')?.value).toLowerCase();
  const status = document.getElementById('account-filter')?.value ?? 'pending';
  return accounts.filter(a => {
    const currentStatus = getAccountStatus(a);
    const hay = [a.name, a.username, a.usernameLower, a.roleLabel, a.detail, a.institutionalEmail, a.authEmail].map(clean).join(' ').toLowerCase();
    return (!term || hay.includes(term)) && (!status || currentStatus === status);
  });
}

function accountActions(account){
  const status = getAccountStatus(account);
  if(status === 'active'){
    return `
      <button class="mini" data-account-action="pending" data-account-uid="${account.id}">Pasar a pendiente</button>
      <button class="mini" data-account-action="block" data-account-uid="${account.id}">Bloquear</button>`;
  }
  if(status === 'blocked'){
    return `<button class="mini" data-account-action="unblock" data-account-uid="${account.id}">Desbloquear</button>`;
  }
  return `
    <button class="mini" data-account-action="activate" data-account-uid="${account.id}">Activar acceso</button>
    <button class="mini" data-account-action="block" data-account-uid="${account.id}">Bloquear</button>`;
}

function renderAccountsTable(){
  const body = document.getElementById('account-rows');
  if(!body) return;
  renderAccountStats();
  const data = filteredAccounts();
  if(!data.length){ body.innerHTML = '<tr><td colspan="5">No hay NostraCUENTAS con ese filtro.</td></tr>'; return; }
  body.innerHTML = data.map(a => `
    <tr>
      <td><b>${esc(a.name)}</b><br><small>${esc(a.roleLabel || 'Alumno')} · ${esc(a.detail || 'NostraCUENTA')}</small></td>
      <td><b>${esc(a.username || a.usernameLower)}</b><br><small>${esc(a.authEmail)}</small></td>
      <td>${esc(a.institutionalEmail)}</td>
      <td>${accountStatusBadge(a)}</td>
      <td>${accountActions(a)}</td>
    </tr>`).join('');
}

async function updateAccountStatus(uid, action){
  if(accountActionBusy) return;
  const account = accounts.find(a => a.id === uid);
  if(!account) return;

  const name = account.name || account.username || 'esta cuenta';
  const labels = {
    activate: 'activar el acceso de',
    block: 'bloquear el acceso de',
    unblock: 'desbloquear y dejar pendiente a',
    pending: 'pasar a pendiente a'
  };
  if(!confirm('¿Seguro que deseas ' + (labels[action] || 'actualizar') + ' ' + name + '?')) return;

  const accountsMsg = document.getElementById('accounts-message');
  const patch = { updatedAt: serverTimestamp() };
  if(action === 'activate') Object.assign(patch, { status: 'active', blocked: false, activatedAt: serverTimestamp() });
  if(action === 'block') Object.assign(patch, { status: 'blocked', blocked: true, blockedAt: serverTimestamp() });
  if(action === 'unblock') Object.assign(patch, { status: 'pending', blocked: false, unblockedAt: serverTimestamp() });
  if(action === 'pending') Object.assign(patch, { status: 'pending', blocked: false });

  try{
    accountActionBusy = true;
    message(accountsMsg, 'info', 'Actualizando NostraCUENTA...');
    await updateDoc(doc(db, 'users', uid), patch);
    await loadAccounts();
    const okText = action === 'activate'
      ? 'NostraCUENTA activada. El alumno ya puede ingresar.'
      : action === 'block'
        ? 'NostraCUENTA bloqueada. El alumno ya no podrá ingresar.'
        : 'NostraCUENTA actualizada correctamente.';
    message(accountsMsg, 'ok', okText);
  }catch(err){
    console.error(err);
    message(accountsMsg, 'err', 'No se pudo actualizar la cuenta. Revisa reglas de Firebase.');
  }finally{
    accountActionBusy = false;
  }
}

function renderStats(){
  els.statTotal.textContent = records.length;
  els.statNuevos.textContent = records.filter(r => (r.estado || 'nuevo') === 'nuevo').length;
  els.statPagos.textContent = records.filter(r => ['pendiente_envio_voucher','pendiente_pago_online','pago_observado'].includes(r.estadoPago)).length;
  els.statValidados.textContent = records.filter(r => r.pagoValidado === true || r.estadoPago === 'pago_validado').length;
}
function filteredRecords(){
  const term = clean(els.search.value).toLowerCase(), estado = els.estadoFilter.value, pago = els.pagoFilter.value;
  return records.filter(r => {
    const hay = [r.nombre, r.dni, r.celular, r.correo, r.ciclo, r.asesorAsignado].map(clean).join(' ').toLowerCase();
    return (!term || hay.includes(term)) && (!estado || r.estado === estado) && (!pago || r.estadoPago === pago);
  });
}
function renderTable(){
  const data = filteredRecords();
  if(!data.length){ els.rows.innerHTML = '<tr><td colspan="7">No hay resultados.</td></tr>'; return; }
  els.rows.innerHTML = data.map(r => `
    <tr>
      <td><b>${esc(r.nombre)}</b><br><small>DNI: ${esc(r.dni)}</small></td>
      <td>${esc(r.ciclo)}<br><small>${esc(r.turno) || '-'}</small></td>
      <td>${esc(r.celular)}<br><small>${esc(r.correo)}</small></td>
      <td>${esc(r.metodoPagoLabel)}<br>${paymentBadge(r.estadoPago)}</td>
      <td>${estadoBadge(r.estado)}</td>
      <td>${esc(r.asesorAsignado) || '-'}</td>
      <td><button class="mini" data-open="${r.id}">Ver ficha</button><button class="mini" data-pay="${r.id}">Validar pago</button></td>
    </tr>`).join('');
}
function detail(label, value){ return `<div class="detail"><b>${esc(label)}</b><span>${esc(value) || '-'}</span></div>`; }

function openModal(id, mode='ficha'){
  const r = records.find(x => x.id === id); if(!r) return;
  currentId = id; currentMode = mode;
  els.modalTitle.textContent = mode === 'pago' ? 'Validar pago' : (r.nombre || 'Ficha');
  els.modalSubtitle.textContent = (mode === 'pago' ? 'Revisión de voucher / pago · ' : 'Código: ') + id;
  els.detailGrid.innerHTML = [
    detail('Alumno', r.nombre), detail('DNI', r.dni), detail('Celular', r.celular), detail('Correo personal', r.correo),
    detail('Ciclo', r.ciclo), detail('Turno', r.turno), detail('Método de pago', r.metodoPagoLabel), detail('Estado de pago actual', r.estadoPago),
    detail('Comentario', r.comentario)
  ].join('');
  els.editEstado.value = r.estado || 'nuevo';
  els.editAsesor.value = r.asesorAsignado || '';
  els.editEstadoPago.value = r.estadoPago || 'pendiente_envio_voucher';
  els.editPagoObs.value = r.pagoObservacion || '';
  message(els.modalMsg,'info', mode === 'pago' ? 'Modo validación: revisa el voucher o pago. Si es correcto, presiona “Confirmar pago validado”.' : 'Modo ficha: revisa o edita los datos administrativos.');
  els.saveBtn.textContent = mode === 'pago' ? 'Confirmar pago validado' : 'Guardar cambios';
  els.approveBtn.style.display = mode === 'pago' ? 'none' : '';
  els.rejectBtn.textContent = mode === 'pago' ? 'Observar pago' : 'Rechazar';
  if(mode === 'pago'){
    els.editEstadoPago.value = 'pago_validado';
    els.editEstado.value = 'listo_para_matricula';
    if(!els.editPagoObs.value) els.editPagoObs.value = 'Pago validado por asesor.';
  }
  els.modalBack.classList.add('show');
}
function closeModal(){ els.modalBack.classList.remove('show'); currentId = null; currentMode = 'ficha'; els.saveBtn.textContent = 'Guardar cambios'; els.approveBtn.style.display = ''; els.rejectBtn.textContent = 'Rechazar'; }
async function updateCurrent(extra={}){
  if(!currentId) return;
  const estadoPago = els.editEstadoPago.value;
  const patch = { estado: els.editEstado.value, asesorAsignado: clean(els.editAsesor.value), estadoPago, pagoValidado: estadoPago === 'pago_validado', pagoObservacion: clean(els.editPagoObs.value), updatedAt: serverTimestamp(), ...extra };
  await updateDoc(doc(db, 'preinscripciones', currentId), patch);
}
async function saveChanges(){
  try{
    message(els.modalMsg,'info', currentMode === 'pago' ? 'Validando pago...' : 'Guardando cambios...');
    if(currentMode === 'pago') await updateCurrent({ estado: 'listo_para_matricula', estadoPago: 'pago_validado', pagoValidado: true });
    else await updateCurrent();
    message(els.modalMsg,'ok', currentMode === 'pago' ? 'Pago validado. La solicitud quedó lista para matrícula.' : 'Cambios guardados correctamente.');
    await loadRecords();
  }catch(err){ console.error(err); message(els.modalMsg,'err','No se pudo guardar. Revisa reglas o permisos.'); }
}
async function approveMatricula(){
  const r = records.find(x => x.id === currentId);
  const pagoValidado = els.editEstadoPago.value === 'pago_validado' || (r && r.pagoValidado === true);
  if(!pagoValidado){ message(els.modalMsg,'err','No puedes aprobar matrícula sin pago validado.'); return; }
  try{ message(els.modalMsg,'info','Aprobando matrícula...'); await updateCurrent({ estado: 'matriculado', matriculaAprobada: true, estadoPago: 'pago_validado', pagoValidado: true }); message(els.modalMsg,'ok','Matrícula aprobada. Siguiente paso: asignar aula y correo institucional.'); await loadRecords(); }catch(err){ console.error(err); message(els.modalMsg,'err','No se pudo aprobar la matrícula.'); }
}
async function rejectCurrent(){
  try{
    message(els.modalMsg,'info', currentMode === 'pago' ? 'Observando pago...' : 'Marcando como rechazado...');
    if(currentMode === 'pago') await updateCurrent({ estadoPago: 'pago_observado', pagoValidado: false, estado: 'observado', pagoObservacion: clean(els.editPagoObs.value) || 'Pago observado por asesor.' });
    else await updateCurrent({ estado: 'rechazado' });
    message(els.modalMsg,'ok', currentMode === 'pago' ? 'Pago observado.' : 'Solicitud rechazada.'); await loadRecords();
  }catch(err){ console.error(err); message(els.modalMsg,'err','No se pudo completar la acción.'); }
}

els.googleLogin.addEventListener('click', async () => { try{ message(els.authMsg,'info','Abriendo Google...'); await signInWithPopup(auth, provider); }catch(err){ console.error(err); message(els.authMsg,'err','No se pudo iniciar sesión con Google.'); } });
els.logout.addEventListener('click', () => signOut(auth));
els.refresh.addEventListener('click', () => { loadRecords(); loadAccounts(); }); els.search.addEventListener('input', renderTable); els.estadoFilter.addEventListener('change', renderTable); els.pagoFilter.addEventListener('change', renderTable);
els.closeModal.addEventListener('click', closeModal); els.modalBack.addEventListener('click', e => { if(e.target === els.modalBack) closeModal(); }); els.saveBtn.addEventListener('click', saveChanges); els.approveBtn.addEventListener('click', approveMatricula); els.rejectBtn.addEventListener('click', rejectCurrent);
document.addEventListener('click', e => {
  const open = e.target.closest('[data-open]');
  const pay = e.target.closest('[data-pay]');
  const accountBtn = e.target.closest('[data-account-action]');
  if(open) openModal(open.dataset.open, 'ficha');
  if(pay) openModal(pay.dataset.pay, 'pago');
  if(accountBtn) updateAccountStatus(accountBtn.dataset.accountUid, accountBtn.dataset.accountAction);
});
onAuthStateChanged(auth, async user => { if(!user){ showApp(false); return; } if((user.email || '').toLowerCase() !== ADMIN_EMAIL){ showApp(false); message(els.authMsg,'err','Este correo no está autorizado: ' + (user.email || 'sin correo')); await signOut(auth); return; } showApp(true); ensureAccountsPanel(); await loadRecords(); await loadAccounts(); });
