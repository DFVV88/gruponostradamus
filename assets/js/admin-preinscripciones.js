/* ==================================================
   Grupo Nostradamus - Admin Preinscripciones
   Lee y actualiza preinscripciones desde Firebase.
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
let currentId = null;
let currentMode = 'ficha';

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
function badge(text, type=''){ return `<span class="badge ${type}">${text || '-'}</span>`; }
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
function showApp(isAdmin){ els.authCard.classList.toggle('hidden', isAdmin); els.adminPanel.classList.toggle('hidden', !isAdmin); els.logout.classList.toggle('hidden', !isAdmin); }

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
      <td><b>${clean(r.nombre)}</b><br><small>DNI: ${clean(r.dni)}</small></td>
      <td>${clean(r.ciclo)}<br><small>${clean(r.turno) || '-'}</small></td>
      <td>${clean(r.celular)}<br><small>${clean(r.correo)}</small></td>
      <td>${clean(r.metodoPagoLabel)}<br>${paymentBadge(r.estadoPago)}</td>
      <td>${estadoBadge(r.estado)}</td>
      <td>${clean(r.asesorAsignado) || '-'}</td>
      <td><button class="mini" data-open="${r.id}">Ver ficha</button><button class="mini" data-pay="${r.id}">Validar pago</button></td>
    </tr>`).join('');
}
function detail(label, value){ return `<div class="detail"><b>${label}</b><span>${clean(value) || '-'}</span></div>`; }

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
els.refresh.addEventListener('click', loadRecords); els.search.addEventListener('input', renderTable); els.estadoFilter.addEventListener('change', renderTable); els.pagoFilter.addEventListener('change', renderTable);
els.closeModal.addEventListener('click', closeModal); els.modalBack.addEventListener('click', e => { if(e.target === els.modalBack) closeModal(); }); els.saveBtn.addEventListener('click', saveChanges); els.approveBtn.addEventListener('click', approveMatricula); els.rejectBtn.addEventListener('click', rejectCurrent);
document.addEventListener('click', e => { const open = e.target.closest('[data-open]'); const pay = e.target.closest('[data-pay]'); if(open) openModal(open.dataset.open, 'ficha'); if(pay) openModal(pay.dataset.pay, 'pago'); });
onAuthStateChanged(auth, async user => { if(!user){ showApp(false); return; } if((user.email || '').toLowerCase() !== ADMIN_EMAIL){ showApp(false); message(els.authMsg,'err','Este correo no está autorizado: ' + (user.email || 'sin correo')); await signOut(auth); return; } showApp(true); await loadRecords(); });
