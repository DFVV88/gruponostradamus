import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};
const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const ADMIN_ENDPOINT = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/asistenciaAdmin';
const PUBLIC_ENDPOINT = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/asistenciaRegistrar';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const $ = id => document.getElementById(id);
const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
const esc = value => clean(value).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

let currentUser = null;
let state = null;
let currentToken = null;
let qrTimer = null;
let qrCountdownTimer = null;
let tokenGeneration = false;
let stateLoading = false;

function localDate(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const map = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function dateTimeLabel(value){
  if(!value) return '-';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-PE',{timeZone:'America/Lima',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
}

function message(id,type,text){
  const element = $(id);
  if(!element) return;
  element.className = `msg show ${type}`;
  element.textContent = text;
}

function clearMessage(id){
  const element = $(id);
  if(element) element.className = 'msg';
}

async function adminApi(action,payload={}){
  if(!currentUser) throw new Error('LOGIN_REQUERIDO');
  const idToken = await currentUser.getIdToken();
  const response = await fetch(ADMIN_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${idToken}`},
    body:JSON.stringify({action,...payload})
  });
  const body = await response.json().catch(() => ({}));
  if(!response.ok || !body.ok){
    const error = new Error(body.message || 'No se pudo completar la operación.');
    error.code = body.error || 'ERROR';
    throw error;
  }
  return body.data;
}

async function publicRegister(dni){
  if(!currentToken?.token) throw new Error('Genera un QR vigente primero.');
  const response = await fetch(PUBLIC_ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({dni,token:currentToken.token})
  });
  const body = await response.json().catch(() => ({}));
  if(!response.ok || !body.ok){
    const error = new Error(body.message || 'No se pudo registrar.');
    error.code = body.error || 'ERROR';
    throw error;
  }
  return body.asistencia;
}

function setAdminVisible(visible){
  $('auth-card').classList.toggle('hidden',visible);
  $('admin-panel').classList.toggle('hidden',!visible);
  $('logout-btn').classList.toggle('hidden',!visible);
}

function populateConfig(){
  if(!state) return;
  const cfg = state.config || {};
  $('cfg-sede').value = cfg.sede || 'Sede principal';
  $('cfg-activo').value = cfg.activo === false ? 'false' : 'true';
  $('cfg-public-url').value = cfg.publicBaseUrl || 'https://asistencia.gruponostradamus.edu.pe/asistencia.html';
  $('cfg-hora').value = cfg.horaGeneral || '08:00';
  $('cfg-tolerancia').value = cfg.toleranciaGeneral ?? 10;
  $('cfg-rotacion').value = cfg.qrRotacionSegundos ?? 60;
  $('cfg-vigencia').value = cfg.qrVigenciaSegundos ?? 120;
  $('cfg-duplicado').value = cfg.duplicateWindowMinutes ?? 5;
  $('cfg-modo').value = cfg.modoRegistro || 'entrada';
  $('cfg-min-salida').value = cfg.minSalidaMinutos ?? 45;
  $('terminal-sede').textContent = cfg.sede || 'Sede principal';

  ['alumno','docente','administrativo'].forEach(type => {
    const card = document.querySelector(`[data-role="${type}"]`);
    const rule = state.rules?.[type] || {};
    if(!card) return;
    card.querySelector('[data-field="hora"]').value = rule.horaIngreso || '08:00';
    card.querySelector('[data-field="tolerancia"]').value = rule.toleranciaMinutos ?? (type === 'docente' ? 5 : 10);
    card.querySelector('[data-field="activo"]').checked = rule.activo !== false;
  });
}

function badge(record){
  if(record.estado === 'tardanza') return `<span class="badge orange">Tardanza · ${Number(record.minutosTardanza||0)} min</span>`;
  if(record.estado === 'puntual') return '<span class="badge green">Puntual</span>';
  return `<span class="badge blue">${esc(record.estado || 'Registrado')}</span>`;
}

function filteredRecords(){
  if(!state) return [];
  const term = clean($('records-search').value).toLowerCase();
  const filter = $('records-filter').value;
  return (state.records || []).filter(record => {
    const hay = `${record.nombre || ''} ${record.dni || ''} ${record.ciclo || ''} ${record.detalle || ''}`.toLowerCase();
    const matchesFilter = !filter
      || (filter === 'pendiente' ? record.estadoVinculacion === 'pendiente' : record.estado === filter);
    return (!term || hay.includes(term)) && matchesFilter;
  });
}

function renderStats(){
  const records = state?.records || [];
  $('stat-total').textContent = records.length;
  $('stat-puntuales').textContent = records.filter(r => r.estado === 'puntual').length;
  $('stat-tardanzas').textContent = records.filter(r => r.estado === 'tardanza').length;
  $('stat-pendientes').textContent = state?.pending?.length || 0;
  $('stat-minutos').textContent = records.reduce((sum,r) => sum + Number(r.minutosTardanza || 0),0);
}

function renderRecords(){
  const data = filteredRecords();
  $('record-count').textContent = `${data.length} registro${data.length === 1 ? '' : 's'}`;
  const body = $('records-body');
  if(!data.length){ body.innerHTML = '<tr><td colspan="7" class="empty">No hay asistencias con este filtro.</td></tr>'; return; }
  body.innerHTML = data.map(record => `<tr>
    <td><b>${esc(record.nombre || 'DNI pendiente')}</b><br><small>DNI: ${esc(record.dni)}</small></td>
    <td>${esc(record.tipo || 'Por identificar')}<br><small>${esc(record.ciclo || record.detalle || '')}</small></td>
    <td><b>${esc(record.entradaHora || '-')}</b></td>
    <td>${esc(record.horaProgramada || '-')}<br><small>Tol. ${Number(record.toleranciaMinutos || 0)} min</small></td>
    <td>${badge(record)}</td>
    <td>${esc(record.salidaHora || '-')}</td>
    <td>${record.estadoVinculacion === 'vinculado' ? '<span class="badge green">Vinculado</span>' : '<span class="badge blue">Pendiente</span>'}</td>
  </tr>`).join('');
}

function renderPending(){
  const data = state?.pending || [];
  const body = $('pending-body');
  if(!data.length){ body.innerHTML = '<tr><td colspan="5" class="empty">No hay DNI pendientes de vinculación.</td></tr>'; return; }
  body.innerHTML = data.map(item => `<tr><td><b>${esc(item.dni)}</b></td><td>${Number(item.registros || 1)}</td><td>${esc(dateTimeLabel(item.firstSeenAt))}</td><td>${esc(dateTimeLabel(item.lastSeenAt))}</td><td><span class="badge blue">Pendiente</span></td></tr>`).join('');
}

function renderPeople(){
  const data = state?.people || [];
  $('people-count').textContent = `${data.length} persona${data.length === 1 ? '' : 's'}`;
  const body = $('people-body');
  if(!data.length){ body.innerHTML = '<tr><td colspan="4" class="empty">Aún no hay personas adicionales en el directorio.</td></tr>'; return; }
  body.innerHTML = data.map(item => `<tr><td><b>${esc(item.nombre)}</b></td><td>${esc(item.dni)}</td><td><span class="badge blue">${esc(item.tipo)}</span></td><td>${esc(item.detalle || item.ciclo || '-')}</td></tr>`).join('');
}

function renderState(){
  populateConfig();
  renderStats();
  renderRecords();
  renderPending();
  renderPeople();
}

async function loadState(date=$('records-date').value || localDate()){
  if(stateLoading || !currentUser) return;
  try{
    stateLoading = true;
    $('records-body').innerHTML = '<tr><td colspan="7" class="empty">Actualizando asistencia...</td></tr>';
    state = await adminApi('state',{date});
    $('records-date').value = state.date || date;
    renderState();
  }catch(error){
    console.error(error);
    $('records-body').innerHTML = `<tr><td colspan="7" class="empty">${esc(error.message)}</td></tr>`;
  }finally{
    stateLoading = false;
  }
}

function drawQr(url){
  const canvas = $('qr-canvas');
  const context = canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);
  if(!window.QRCode?.toCanvas){
    context.fillStyle = '#061426';
    context.font = '16px sans-serif';
    context.fillText('QR no disponible',28,110);
    return;
  }
  window.QRCode.toCanvas(canvas,url,{width:220,margin:1,errorCorrectionLevel:'M'},error => {
    if(error) console.error('No se pudo dibujar el QR.',error);
  });
}

function startCountdown(){
  if(qrCountdownTimer) clearInterval(qrCountdownTimer);
  const update = () => {
    if(!currentToken){ $('qr-countdown').textContent = '--'; return; }
    const seconds = Math.max(0,Math.ceil((new Date(currentToken.expiresAt).getTime() - Date.now())/1000));
    $('qr-countdown').textContent = `${seconds}s`;
  };
  update();
  qrCountdownTimer = setInterval(update,1000);
}

function scheduleRotation(){
  if(qrTimer) clearTimeout(qrTimer);
  const seconds = Number(currentToken?.rotateAfterSeconds || state?.config?.qrRotacionSegundos || 60);
  qrTimer = setTimeout(() => generateToken(false),Math.max(30,seconds)*1000);
}

async function generateToken(showFeedback=true){
  if(tokenGeneration || !currentUser) return;
  try{
    tokenGeneration = true;
    if(showFeedback) $('manual-result').textContent = 'Generando nuevo QR...';
    currentToken = await adminApi('create_token');
    drawQr(currentToken.url);
    startCountdown();
    scheduleRotation();
    if(showFeedback) $('manual-result').textContent = 'QR renovado correctamente.';
  }catch(error){
    console.error(error);
    $('manual-result').textContent = error.message;
  }finally{
    tokenGeneration = false;
  }
}

async function saveConfig(){
  const button = $('save-config');
  const config = {
    activo:$('cfg-activo').value === 'true',
    sede:clean($('cfg-sede').value),
    publicBaseUrl:clean($('cfg-public-url').value),
    horaGeneral:$('cfg-hora').value,
    toleranciaGeneral:Number($('cfg-tolerancia').value),
    qrRotacionSegundos:Number($('cfg-rotacion').value),
    qrVigenciaSegundos:Number($('cfg-vigencia').value),
    duplicateWindowMinutes:Number($('cfg-duplicado').value),
    modoRegistro:$('cfg-modo').value,
    minSalidaMinutos:Number($('cfg-min-salida').value)
  };
  const rules = {};
  ['alumno','docente','administrativo'].forEach(type => {
    const card = document.querySelector(`[data-role="${type}"]`);
    rules[type] = {
      activo:card.querySelector('[data-field="activo"]').checked,
      horaIngreso:card.querySelector('[data-field="hora"]').value,
      toleranciaMinutos:Number(card.querySelector('[data-field="tolerancia"]').value)
    };
  });
  try{
    button.disabled = true;
    message('config-msg','info','Guardando configuración...');
    await adminApi('save_config',{config,rules});
    message('config-msg','ok','Configuración guardada. Las siguientes asistencias usarán estas reglas.');
    await loadState();
    await generateToken(false);
  }catch(error){
    console.error(error);
    message('config-msg','err',error.message);
  }finally{
    button.disabled = false;
  }
}

async function registerManual(event){
  event.preventDefault();
  const input = $('manual-dni');
  const button = $('manual-submit');
  const dni = input.value.replace(/\D/g,'');
  if(!/^\d{8,12}$/.test(dni)){ $('manual-result').textContent = 'Ingresa un DNI válido.'; input.focus(); return; }
  try{
    button.disabled = true;
    button.textContent = 'Registrando...';
    const attendance = await publicRegister(dni);
    const name = attendance.person?.nombre || `DNI ${dni}`;
    const stateLabel = attendance.estado === 'tardanza' ? ` · tardanza ${attendance.minutosTardanza} min` : '';
    $('manual-result').textContent = `${name}: ${attendance.movimiento} registrada a las ${attendance.hora}${stateLabel}.`;
    input.value = '';
    input.focus();
    await loadState();
  }catch(error){
    console.error(error);
    $('manual-result').textContent = error.message;
    if(error.code === 'QR_EXPIRADO') await generateToken(false);
  }finally{
    button.disabled = false;
    button.textContent = 'Registrar';
  }
}

async function crossPending(){
  const button = $('cross-pending');
  try{
    button.disabled = true;
    message('pending-msg','info','Cruzando DNI con alumnos, docentes y directorio de asistencia...');
    const result = await adminApi('cross_pending');
    message('pending-msg','ok',`Cruce terminado: ${result.vinculados} vinculados de ${result.revisados} revisados.`);
    await loadState();
  }catch(error){
    console.error(error);
    message('pending-msg','err',error.message);
  }finally{
    button.disabled = false;
  }
}

async function createPerson(event){
  event.preventDefault();
  const form = event.currentTarget;
  const dni = $('person-dni').value.replace(/\D/g,'');
  try{
    message('person-msg','info','Guardando persona...');
    await adminApi('create_person',{
      dni,
      nombre:clean($('person-name').value),
      tipo:$('person-type').value,
      detalle:clean($('person-detail').value)
    });
    message('person-msg','ok','Persona guardada. Ahora puede ser reconocida por DNI.');
    form.reset();
    $('person-type').value = 'administrativo';
    await adminApi('cross_pending');
    await loadState();
  }catch(error){
    console.error(error);
    message('person-msg','err',error.message);
  }
}

function csvCell(value){
  const text = String(value == null ? '' : value).replace(/"/g,'""');
  return `"${text}"`;
}

function exportCsv(){
  const rows = filteredRecords();
  if(!rows.length){ alert('No hay registros para exportar.'); return; }
  const header = ['Fecha','DNI','Nombre','Tipo','Ciclo/Detalle','Entrada','Hora programada','Tolerancia','Estado','Minutos tardanza','Salida','Vinculación','Sede'];
  const lines = [header.map(csvCell).join(',')];
  rows.forEach(r => lines.push([
    r.fecha,r.dni,r.nombre,r.tipo,r.ciclo || r.detalle,r.entradaHora,r.horaProgramada,r.toleranciaMinutos,r.estado,r.minutosTardanza,r.salidaHora,r.estadoVinculacion,r.sede
  ].map(csvCell).join(',')));
  const blob = new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nostra-asistencia-${state?.date || localDate()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toggleTerminal(){
  document.body.classList.toggle('terminal-mode');
  $('fullscreen-terminal').textContent = document.body.classList.contains('terminal-mode') ? 'Salir de pantalla completa' : 'Pantalla completa';
  if(document.body.classList.contains('terminal-mode') && document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(() => {});
  }else if(document.fullscreenElement && document.exitFullscreen){
    document.exitFullscreen().catch(() => {});
  }
}

function bind(){
  $('login-btn').addEventListener('click',async () => {
    clearMessage('auth-msg');
    try{ await signInWithPopup(auth,provider); }
    catch(error){ console.error(error); message('auth-msg','err','No se pudo iniciar sesión con Google.'); }
  });
  $('logout-btn').addEventListener('click',() => signOut(auth));
  $('save-config').addEventListener('click',saveConfig);
  $('rotate-qr').addEventListener('click',() => generateToken(true));
  $('fullscreen-terminal').addEventListener('click',toggleTerminal);
  $('manual-form').addEventListener('submit',registerManual);
  $('cross-pending').addEventListener('click',crossPending);
  $('person-form').addEventListener('submit',createPerson);
  $('refresh-records').addEventListener('click',() => loadState($('records-date').value));
  $('records-date').addEventListener('change',() => loadState($('records-date').value));
  $('records-search').addEventListener('input',renderRecords);
  $('records-filter').addEventListener('change',renderRecords);
  $('export-csv').addEventListener('click',exportCsv);
  $('manual-dni').addEventListener('input',event => { event.target.value = event.target.value.replace(/\D/g,'').slice(0,12); });
  $('person-dni').addEventListener('input',event => { event.target.value = event.target.value.replace(/\D/g,'').slice(0,12); });
  document.addEventListener('fullscreenchange',() => {
    if(!document.fullscreenElement && document.body.classList.contains('terminal-mode')){
      document.body.classList.remove('terminal-mode');
      $('fullscreen-terminal').textContent = 'Pantalla completa';
    }
  });
}

bind();
$('records-date').value = localDate();
$('today-label').textContent = new Date().toLocaleDateString('es-PE',{timeZone:'America/Lima',weekday:'long',day:'2-digit',month:'long',year:'numeric'});

onAuthStateChanged(auth,async user => {
  currentUser = user && clean(user.email).toLowerCase() === ADMIN_EMAIL ? user : null;
  if(user && !currentUser){
    message('auth-msg','err','Esta cuenta no está autorizada para administrar asistencia.');
    await signOut(auth);
    return;
  }
  setAdminVisible(Boolean(currentUser));
  if(!currentUser){
    state = null;
    currentToken = null;
    if(qrTimer) clearTimeout(qrTimer);
    if(qrCountdownTimer) clearInterval(qrCountdownTimer);
    return;
  }
  await loadState();
  if(state?.config?.activo !== false) await generateToken(false);
});
