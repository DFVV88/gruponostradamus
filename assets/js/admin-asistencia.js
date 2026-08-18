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
const esc = value => clean(value).replace(/[&<>'\"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));

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

function ensureModeOptions(){
  const select = $('cfg-modo');
  if(!select || select.querySelector('option[value="salida"]')) return;
  const option = document.createElement('option');
  option.value = 'salida';
  option.textContent = 'Solo salida';
  const entradaSalida = select.querySelector('option[value="entrada_salida"]');
  select.insertBefore(option,entradaSalida || null);
}

function injectDirectoryStyles(){
  if(document.getElementById('directory-enhancements-style')) return;
  const style = document.createElement('style');
  style.id = 'directory-enhancements-style';
  style.textContent = `
    .directory-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 12px}
    .directory-toolbar input,.directory-toolbar select{border:1px solid var(--line);border-radius:12px;padding:9px 10px;font:inherit;font-size:11px;background:#fbfdfe;min-width:150px}
    .directory-toolbar .directory-search{flex:1;min-width:220px}
    .directory-quick{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
    .directory-quick .btn{padding:9px 11px}
    #person-form.directory-form{grid-template-columns:1fr 1.35fr .85fr 1.1fr 1.1fr auto}
    #person-form.directory-form .person-cycle-field.is-hidden{display:none}
    .pending-action{white-space:nowrap}
    .pending-action .btn{padding:7px 10px;font-size:9px}
    .directory-focus{outline:3px solid rgba(7,140,149,.14);outline-offset:4px;border-radius:14px}
    .directory-origin{font-size:8px;font-weight:900;color:#647482}
    @media(max-width:1180px){#person-form.directory-form{grid-template-columns:1fr 1fr 1fr}.directory-quick{margin-left:0}}
    @media(max-width:680px){#person-form.directory-form{grid-template-columns:1fr}.directory-toolbar>*{width:100%}.directory-quick{width:100%}.directory-quick .btn{flex:1}}
  `;
  document.head.appendChild(style);
}

function updatePersonFieldLabels(){
  const type = $('person-type')?.value || '';
  const detail = $('person-detail');
  const detailLabel = detail?.closest('label');
  const detailSpan = detailLabel?.querySelector('span');
  const cycleField = document.querySelector('.person-cycle-field');
  const cycleSpan = cycleField?.querySelector('span');
  const cycleInput = $('person-cycle');
  if(!detail || !detailSpan || !cycleField || !cycleSpan || !cycleInput) return;

  cycleField.classList.remove('is-hidden');
  if(type === 'docente'){
    detailSpan.textContent = 'Curso / especialidad';
    detail.placeholder = 'Ej. Física';
    cycleSpan.textContent = 'Ciclo / programa';
    cycleInput.placeholder = 'Ej. NostraPOWER';
  }else if(type === 'alumno'){
    detailSpan.textContent = 'Grupo / turno';
    detail.placeholder = 'Ej. Mañana A';
    cycleSpan.textContent = 'Ciclo / programa';
    cycleInput.placeholder = 'Ej. NostraWEEKEND';
  }else if(type === 'administrativo'){
    detailSpan.textContent = 'Cargo / área';
    detail.placeholder = 'Ej. Recepción';
    cycleInput.value = '';
    cycleField.classList.add('is-hidden');
  }else{
    detailSpan.textContent = 'Curso / ciclo / cargo';
    detail.placeholder = 'Selecciona primero el tipo';
    cycleSpan.textContent = 'Ciclo / programa';
    cycleInput.placeholder = 'Opcional';
  }
}

function resetPersonForm(type=''){
  const form = $('person-form');
  if(!form) return;
  form.reset();
  $('person-type').value = type;
  $('person-dni').readOnly = false;
  $('person-dni').dataset.pendingLink = '';
  updatePersonFieldLabels();
  clearMessage('person-msg');
}

function focusPersonForm(){
  const form = $('person-form');
  if(!form) return;
  form.classList.add('directory-focus');
  form.scrollIntoView({behavior:'smooth',block:'center'});
  window.setTimeout(() => form.classList.remove('directory-focus'),1800);
}

function prefillPending(dni){
  resetPersonForm('');
  $('person-dni').value = String(dni || '').replace(/\D/g,'').slice(0,12);
  $('person-dni').readOnly = true;
  $('person-dni').dataset.pendingLink = '1';
  message('person-msg','info',`DNI ${$('person-dni').value} listo para vincular. Selecciona Alumno, Docente o Administrativo y completa sus datos.`);
  focusPersonForm();
  $('person-type').focus();
}

function enhanceDirectoryUi(){
  const form = $('person-form');
  const pendingBody = $('pending-body');
  if(!form || form.dataset.enhanced === '1') return;
  form.dataset.enhanced = '1';
  injectDirectoryStyles();

  const section = form.closest('.section');
  const title = section?.querySelector('.section-head h2');
  const subtitle = section?.querySelector('.section-head p');
  if(title) title.textContent = 'Directorio institucional de asistencia';
  if(subtitle) subtitle.textContent = 'Identifica manualmente alumnos, docentes y administrativos que aún no estén completos en otros módulos. La asistencia y el historial quedan vinculados por DNI.';

  const typeSelect = $('person-type');
  if(typeSelect && !typeSelect.querySelector('option[value=""]')){
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleccionar tipo...';
    typeSelect.insertBefore(placeholder,typeSelect.firstChild);
    typeSelect.value = '';
    typeSelect.required = true;
  }

  const detailLabel = $('person-detail')?.closest('label');
  if(detailLabel && !$('person-cycle')){
    const cycleLabel = document.createElement('label');
    cycleLabel.className = 'person-cycle-field';
    cycleLabel.innerHTML = '<span>Ciclo / programa</span><input id="person-cycle" maxlength="120" placeholder="Opcional">';
    detailLabel.insertAdjacentElement('afterend',cycleLabel);
  }

  form.classList.add('directory-form');
  const submitButton = form.querySelector('button[type="submit"]');
  if(submitButton) submitButton.textContent = 'Guardar persona';

  const toolbar = document.createElement('div');
  toolbar.className = 'directory-toolbar';
  toolbar.innerHTML = `
    <input class="directory-search" id="people-search" placeholder="Buscar por nombre, DNI, curso, ciclo o cargo">
    <select id="people-type-filter">
      <option value="">Todos los tipos</option>
      <option value="alumno">Alumnos</option>
      <option value="docente">Docentes</option>
      <option value="administrativo">Administrativos</option>
    </select>
    <div class="directory-quick">
      <button class="btn btn-light" type="button" data-new-person="alumno">+ Alumno</button>
      <button class="btn btn-light" type="button" data-new-person="docente">+ Docente</button>
      <button class="btn btn-light" type="button" data-new-person="administrativo">+ Administrativo</button>
    </div>`;
  form.parentNode.insertBefore(toolbar,form);

  const peopleTable = $('people-body')?.closest('table');
  if(peopleTable){
    peopleTable.style.minWidth = '820px';
    const row = peopleTable.querySelector('thead tr');
    if(row) row.innerHTML = '<th>Persona</th><th>DNI</th><th>Tipo</th><th>Curso / ciclo / cargo</th><th>Origen</th><th>Estado</th>';
  }

  const pendingTable = pendingBody?.closest('table');
  if(pendingTable){
    pendingTable.style.minWidth = '760px';
    const row = pendingTable.querySelector('thead tr');
    if(row) row.innerHTML = '<th>DNI</th><th>Registros</th><th>Primera vez</th><th>Última vez</th><th>Estado</th><th>Acciones</th>';
  }

  updatePersonFieldLabels();
}

function populateConfig(){
  if(!state) return;
  ensureModeOptions();
  const cfg = state.config || {};
  $('cfg-sede').value = cfg.sede || 'Sede principal';
  $('cfg-activo').value = cfg.activo === false ? 'false' : 'true';
  $('cfg-public-url').value = 'https://gruponostradamus.edu.pe/asistencia';
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
  if(!data.length){ body.innerHTML = '<tr><td colspan="6" class="empty">No hay DNI pendientes de vinculación.</td></tr>'; return; }
  body.innerHTML = data.map(item => `<tr>
    <td><b>${esc(item.dni)}</b></td>
    <td>${Number(item.registros || 1)}</td>
    <td>${esc(dateTimeLabel(item.firstSeenAt))}</td>
    <td>${esc(dateTimeLabel(item.lastSeenAt))}</td>
    <td><span class="badge blue">Pendiente</span></td>
    <td class="pending-action"><button class="btn btn-light" type="button" data-link-pending="${esc(item.dni)}">Vincular persona</button></td>
  </tr>`).join('');
}

function sourceLabel(item){
  const origin = clean(item.origen || item.origenPersona || '').toLowerCase();
  if(origin.includes('manual') || origin.includes('directorio')) return 'Manual';
  if(origin.includes('finanzas')) return 'Finanzas docentes';
  if(origin.includes('preinscripciones')) return 'Preinscripciones';
  return origin ? origin.replace(/_/g,' ') : 'Directorio';
}

function renderPeople(){
  const all = state?.people || [];
  const term = clean($('people-search')?.value).toLowerCase();
  const type = $('people-type-filter')?.value || '';
  const data = all.filter(item => {
    const hay = `${item.nombre || ''} ${item.dni || ''} ${item.tipo || ''} ${item.detalle || ''} ${item.ciclo || ''}`.toLowerCase();
    return (!term || hay.includes(term)) && (!type || item.tipo === type);
  });
  $('people-count').textContent = data.length === all.length
    ? `${all.length} persona${all.length === 1 ? '' : 's'}`
    : `${data.length} de ${all.length}`;
  const body = $('people-body');
  if(!data.length){ body.innerHTML = '<tr><td colspan="6" class="empty">No hay personas con este filtro.</td></tr>'; return; }
  body.innerHTML = data.map(item => `<tr>
    <td><b>${esc(item.nombre)}</b></td>
    <td>${esc(item.dni)}</td>
    <td><span class="badge blue">${esc(item.tipo)}</span></td>
    <td>${esc(item.ciclo || item.detalle || '-')}<br>${item.ciclo && item.detalle ? `<small>${esc(item.detalle)}</small>` : ''}</td>
    <td><span class="directory-origin">${esc(sourceLabel(item))}</span></td>
    <td>${item.activo === false ? '<span class="badge red">Inactivo</span>' : '<span class="badge green">Activo</span>'}</td>
  </tr>`).join('');
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
    message('pending-msg','info','Cruzando DNI con alumnos, docentes y directorio institucional...');
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
  const tipo = $('person-type').value;
  if(!tipo){
    message('person-msg','err','Selecciona si la persona es alumno, docente o administrativo.');
    $('person-type').focus();
    return;
  }
  try{
    message('person-msg','info','Guardando persona y vinculando registros...');
    await adminApi('create_person',{
      dni,
      nombre:clean($('person-name').value),
      tipo,
      detalle:clean($('person-detail').value),
      ciclo:clean($('person-cycle')?.value)
    });
    await adminApi('cross_pending');
    const typeLabel = tipo === 'docente' ? 'Docente' : tipo === 'alumno' ? 'Alumno' : 'Administrativo';
    message('person-msg','ok',`${typeLabel} guardado y vinculado correctamente por DNI.`);
    form.reset();
    $('person-type').value = '';
    $('person-dni').readOnly = false;
    $('person-dni').dataset.pendingLink = '';
    updatePersonFieldLabels();
    await loadState();
  }catch(error){
    console.error(error);
    message('person-msg','err',error.message);
  }
}

function csvCell(value){
  const text = String(value == null ? '' : value).replace(/\"/g,'\"\"');
  return `\"${text}\"`;
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
  $('person-dni').addEventListener('input',event => { if(!event.target.readOnly) event.target.value = event.target.value.replace(/\D/g,'').slice(0,12); });
  $('person-type').addEventListener('change',updatePersonFieldLabels);
  $('people-search')?.addEventListener('input',renderPeople);
  $('people-type-filter')?.addEventListener('change',renderPeople);
  document.querySelector('.directory-quick')?.addEventListener('click',event => {
    const button = event.target.closest('[data-new-person]');
    if(!button) return;
    resetPersonForm(button.dataset.newPerson || '');
    focusPersonForm();
    $('person-dni').focus();
  });
  $('pending-body').addEventListener('click',event => {
    const button = event.target.closest('[data-link-pending]');
    if(!button) return;
    prefillPending(button.dataset.linkPending || '');
  });
  document.addEventListener('fullscreenchange',() => {
    if(!document.fullscreenElement && document.body.classList.contains('terminal-mode')){
      document.body.classList.remove('terminal-mode');
      $('fullscreen-terminal').textContent = 'Pantalla completa';
    }
  });
}

enhanceDirectoryUi();
bind();
ensureModeOptions();
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