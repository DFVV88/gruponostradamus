import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

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
let claims = [];
let currentId = '';

const clean = value => String(value == null ? '' : value).trim();
const esc = value => clean(value).replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const dateLabel = value => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-PE') : '-';
};
const badge = (text,type='') => `<span class="badge ${type}">${esc(text)}</span>`;

function statusBadge(status){
  if(status === 'respondido' || status === 'cerrado') return badge(status,'green');
  if(status === 'en_revision') return badge('en revisión','orange');
  return badge('pendiente','red');
}

function ensurePanel(){
  const admin = document.getElementById('admin-panel');
  if(!admin || document.getElementById('nostra-claims-panel')) return;
  const panel = document.createElement('section');
  panel.id = 'nostra-claims-panel';
  panel.className = 'panel';
  panel.style.marginTop = '22px';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
      <div><h2 style="font-family:'Baloo 2';font-size:38px;line-height:1;color:#061426;margin:0 0 8px">Libro de Reclamaciones</h2><p style="color:#4b5d70;font-size:17px;margin:0 0 16px">Revisa, asigna y registra la respuesta administrativa de cada queja o reclamo.</p></div>
      <a class="btn btn-light" href="libro-de-reclamaciones.html" target="_blank" rel="noopener">Ver libro público</a>
    </div>
    <div class="stats" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat"><strong id="claim-stat-total">0</strong><span>Total</span></div>
      <div class="stat"><strong id="claim-stat-pending">0</strong><span>Pendientes</span></div>
      <div class="stat"><strong id="claim-stat-reclamos">0</strong><span>Reclamos</span></div>
      <div class="stat"><strong id="claim-stat-quejas">0</strong><span>Quejas</span></div>
    </div>
    <div class="toolbar" style="grid-template-columns:1.5fr 1fr auto">
      <input id="claim-search" placeholder="Buscar por código, consumidor, documento o servicio">
      <select id="claim-status-filter"><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="en_revision">En revisión</option><option value="respondido">Respondido</option><option value="cerrado">Cerrado</option></select>
      <button class="btn btn-blue" id="claim-refresh">Actualizar reclamos</button>
    </div>
    <div class="msg" id="claim-message"></div>
    <div class="table-wrap"><table><thead><tr><th>Código</th><th>Consumidor</th><th>Tipo</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="claim-rows"><tr><td colspan="7">Cargando...</td></tr></tbody></table></div>`;
  admin.appendChild(panel);

  const modal = document.createElement('div');
  modal.id = 'claim-modal-back';
  modal.className = 'modal-back';
  modal.innerHTML = `<div class="modal"><div class="modal-head"><div><h2 id="claim-modal-title">Reclamo</h2><p id="claim-modal-subtitle"></p></div><button class="btn btn-light" id="claim-modal-close">Cerrar</button></div><div class="detail-grid" id="claim-detail-grid"></div><div class="admin-grid"><label class="field"><span>Estado de atención</span><select id="claim-edit-status"><option value="pendiente">Pendiente</option><option value="en_revision">En revisión</option><option value="respondido">Respondido</option><option value="cerrado">Cerrado</option></select></label><label class="field"><span>Responsable</span><input id="claim-edit-owner" maxlength="120"></label><label class="field" style="grid-column:1/-1"><span>Respuesta administrativa</span><textarea id="claim-edit-response" rows="7" style="width:100%;border:1px solid var(--line);border-radius:14px;padding:12px;font:inherit" maxlength="5000"></textarea></label></div><div class="note">La respuesta debe enviarse también por escrito al correo registrado por el consumidor. Este panel conserva el contenido y el estado interno de atención.</div><button class="btn btn-green" id="claim-save">Guardar atención</button><div class="msg" id="claim-modal-message"></div></div>`;
  document.body.appendChild(modal);

  document.getElementById('claim-search').addEventListener('input',renderTable);
  document.getElementById('claim-status-filter').addEventListener('change',renderTable);
  document.getElementById('claim-refresh').addEventListener('click',loadClaims);
  document.getElementById('claim-modal-close').addEventListener('click',closeModal);
  document.getElementById('claim-modal-back').addEventListener('click',event => { if(event.target.id === 'claim-modal-back') closeModal(); });
  document.getElementById('claim-save').addEventListener('click',saveCurrent);
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-claim-open]');
    if(button) openModal(button.dataset.claimOpen);
  });
}

function setText(id,value){ const element = document.getElementById(id); if(element) element.textContent = value; }
function showMessage(id,type,text){ const element = document.getElementById(id); if(!element) return; element.className = `msg ${type}`; element.textContent = text; }

async function loadClaims(){
  ensurePanel();
  const rows = document.getElementById('claim-rows');
  if(rows) rows.innerHTML = '<tr><td colspan="7">Cargando reclamos...</td></tr>';
  try{
    const snapshot = await getDocs(query(collection(db,'libro_reclamaciones'),orderBy('createdAt','desc'),limit(250)));
    claims = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    renderStats();
    renderTable();
    showMessage('claim-message','ok','Libro de Reclamaciones actualizado.');
  }catch(error){
    console.error(error);
    if(rows) rows.innerHTML = '<tr><td colspan="7">No se pudo cargar. Verifica las reglas de Firestore.</td></tr>';
    showMessage('claim-message','err','No se pudieron cargar los reclamos. Revisa permisos y reglas.');
  }
}

function renderStats(){
  setText('claim-stat-total',claims.length);
  setText('claim-stat-pending',claims.filter(item => (item.estadoAtencion || 'pendiente') === 'pendiente').length);
  setText('claim-stat-reclamos',claims.filter(item => item.tipo === 'reclamo').length);
  setText('claim-stat-quejas',claims.filter(item => item.tipo === 'queja').length);
}

function filtered(){
  const term = clean(document.getElementById('claim-search')?.value).toLowerCase();
  const status = clean(document.getElementById('claim-status-filter')?.value);
  return claims.filter(item => {
    const haystack = [item.codigo,item.consumidor?.nombres,item.consumidor?.numeroDocumento,item.consumidor?.correo,item.servicio?.nombre,item.tipo].map(clean).join(' ').toLowerCase();
    return (!term || haystack.includes(term)) && (!status || (item.estadoAtencion || 'pendiente') === status);
  });
}

function renderTable(){
  const rows = document.getElementById('claim-rows');
  if(!rows) return;
  const data = filtered();
  if(!data.length){ rows.innerHTML = '<tr><td colspan="7">No hay registros con ese filtro.</td></tr>'; return; }
  rows.innerHTML = data.map(item => `<tr><td><b>${esc(item.codigo || item.id)}</b></td><td><b>${esc(item.consumidor?.nombres)}</b><br><small>${esc(item.consumidor?.correo)}</small></td><td>${badge(item.tipo === 'queja' ? 'Queja' : 'Reclamo',item.tipo === 'queja' ? 'orange' : '')}</td><td>${esc(item.servicio?.nombre)}</td><td>${esc(dateLabel(item.createdAt))}</td><td>${statusBadge(item.estadoAtencion || 'pendiente')}</td><td><button class="mini" data-claim-open="${esc(item.id)}">Revisar</button></td></tr>`).join('');
}

function detail(label,value){ return `<div class="detail"><b>${esc(label)}</b><span>${esc(value) || '-'}</span></div>`; }

function openModal(id){
  const item = claims.find(entry => entry.id === id);
  if(!item) return;
  currentId = id;
  setText('claim-modal-title',item.tipo === 'queja' ? 'Queja registrada' : 'Reclamo registrado');
  setText('claim-modal-subtitle',`Código: ${item.codigo || id}`);
  document.getElementById('claim-detail-grid').innerHTML = [
    detail('Consumidor',item.consumidor?.nombres),
    detail('Documento',`${item.consumidor?.tipoDocumento || ''} ${item.consumidor?.numeroDocumento || ''}`),
    detail('Correo',item.consumidor?.correo),
    detail('Celular',item.consumidor?.celular),
    detail('Dirección',item.consumidor?.direccion),
    detail('Servicio',item.servicio?.nombre),
    detail('Monto',item.servicio?.monto > 0 ? `S/ ${Number(item.servicio.monto).toFixed(2)}` : 'No consignado'),
    detail('Comprobante',item.servicio?.comprobante),
    detail('Fecha de registro',dateLabel(item.createdAt)),
    detail('Detalle',item.detalle),
    detail('Pedido',item.pedido)
  ].join('');
  document.getElementById('claim-edit-status').value = item.estadoAtencion || 'pendiente';
  document.getElementById('claim-edit-owner').value = item.responsable || '';
  document.getElementById('claim-edit-response').value = item.respuestaAdministrativa || '';
  showMessage('claim-modal-message','info','Revisa la solicitud y registra el avance de atención.');
  document.getElementById('claim-modal-back').classList.add('show');
}

function closeModal(){
  currentId = '';
  document.getElementById('claim-modal-back')?.classList.remove('show');
}

async function saveCurrent(){
  if(!currentId) return;
  const status = clean(document.getElementById('claim-edit-status').value);
  const response = clean(document.getElementById('claim-edit-response').value);
  const owner = clean(document.getElementById('claim-edit-owner').value);
  if((status === 'respondido' || status === 'cerrado') && response.length < 10){
    showMessage('claim-modal-message','err','Registra una respuesta administrativa antes de marcarlo como respondido o cerrado.');
    return;
  }
  try{
    showMessage('claim-modal-message','info','Guardando atención...');
    const patch = {estadoAtencion:status,respuestaAdministrativa:response,responsable:owner,notificacionPendiente:false,updatedAt:serverTimestamp()};
    if(status === 'respondido' || status === 'cerrado') patch.fechaRespuesta = serverTimestamp();
    await updateDoc(doc(db,'libro_reclamaciones',currentId),patch);
    showMessage('claim-modal-message','ok','Atención guardada correctamente.');
    await loadClaims();
  }catch(error){
    console.error(error);
    showMessage('claim-modal-message','err','No se pudo guardar. Revisa las reglas de Firestore.');
  }
}

onAuthStateChanged(auth,user => {
  if(!user || clean(user.email).toLowerCase() !== ADMIN_EMAIL) return;
  ensurePanel();
  loadClaims();
});
