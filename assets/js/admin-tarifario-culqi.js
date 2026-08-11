/* ==================================================
   Grupo Nostradamus - Preparación de tarifario para Culqi
   Amplía el panel existente sin reemplazarlo:
   modalidad, turno, concepto inicial y pagos posteriores.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const COLLECTION = 'programas_publicos';
const INITIAL_TYPES = new Set([
  'matricula_y_primera_cuota',
  'solo_matricula',
  'primera_cuota',
  'pago_total'
]);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let remotePrograms = new Map();
let saving = false;

function clean(value){
  return String(value == null ? '' : value).replace(/\s+/g,' ').trim();
}
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){
  const amount = num(value);
  return 'S/ ' + (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
}
function lineList(value,max){
  const list = Array.isArray(value) ? value : String(value == null ? '' : value).split(/\r?\n/);
  return list.map(clean).filter(Boolean).slice(0,max || 10);
}
function normalized(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function inferModalidad(name){
  const value = normalized(name);
  if(value.includes('virtual')) return 'Virtual';
  if(value.includes('mixto') || value.includes('hibrido')) return 'Mixta';
  if(value.includes('presencial')) return 'Presencial';
  return 'Presencial';
}
function inferTurno(name){
  const value = normalized(name);
  if(value.includes('sabatino') || value.includes('sabado')) return 'Sabatino';
  if(value.includes('dominical') || value.includes('domingo')) return 'Dominical';
  if(value.includes('manana')) return 'Mañana';
  if(value.includes('tarde')) return 'Tarde';
  if(value.includes('noche')) return 'Noche';
  if(value.includes('full') || value.includes('unico')) return 'FULL';
  return 'Por confirmar';
}
function promotionIsActive(plan){
  if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
  if(!plan.promocionHasta) return true;
  const end = new Date(plan.promocionHasta + 'T23:59:59');
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}
function defaultInitialType(type,matricula){
  if(type === 'unico') return 'pago_total';
  return num(matricula) > 0 ? 'matricula_y_primera_cuota' : 'primera_cuota';
}
function initialType(value,type,matricula){
  return INITIAL_TYPES.has(value) ? value : defaultInitialType(type,matricula);
}
function conceptLabel(value,type){
  const labels = {
    matricula_y_primera_cuota:'Matrícula + primera pensión',
    solo_matricula:'Solo matrícula',
    primera_cuota:type === 'unico' ? 'Pago único del programa' : 'Primera pensión',
    pago_total:'Pago completo del programa'
  };
  return labels[value] || labels[defaultInitialType(type,0)];
}
function calculateInitial(plan){
  const appliedPrice = promotionIsActive(plan) ? num(plan.precioPromocional) : num(plan.precio);
  const matricula = num(plan.matricula);
  const mode = initialType(plan.cobroInicial,plan.tipoCobro,matricula);
  let total = appliedPrice;
  if(mode === 'solo_matricula') total = matricula;
  if(mode === 'matricula_y_primera_cuota' || mode === 'pago_total') total = matricula + appliedPrice;
  return {
    precioAplicado:appliedPrice,
    promocionAplicada:promotionIsActive(plan),
    cobroInicial:mode,
    conceptoInicial:conceptLabel(mode,plan.tipoCobro),
    totalInicial:Math.round(total * 100) / 100
  };
}
function defaultLaterPayments(plan){
  const calc = calculateInitial(plan);
  if(plan.tipoCobro === 'unico'){
    if(calc.cobroInicial === 'solo_matricula') return 'Queda pendiente el pago único del programa.';
    return 'No registra pagos posteriores por este plan.';
  }
  if(calc.cobroInicial === 'solo_matricula') return 'Primera pensión y pensiones mensuales según el cronograma académico.';
  return 'Pensiones mensuales posteriores según el cronograma académico.';
}
function getField(root,name){
  return root.querySelector('[data-plan-field="' + name + '"]');
}
function remotePlanFor(element){
  const program = remotePrograms.get(element.dataset.programId || '');
  const plans = Array.isArray(program && program.planes) ? program.planes : [];
  return plans.find(plan => clean(plan && plan.id) === clean(element.dataset.fixedPlanId)) || {};
}
function addStyles(){
  if(document.getElementById('nostra-admin-tarifario-culqi-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra-admin-tarifario-culqi-style';
  style.textContent = `
    .np-culqi-block{grid-column:1/-1;padding:12px;border-radius:15px;background:linear-gradient(180deg,#eefbfc,#fff);border:1px solid rgba(7,140,149,.22)}
    .np-culqi-block__title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;color:#061426;font-size:13px;font-weight:950}
    .np-culqi-block__title small{color:#607080;font-size:11px;font-weight:750}
    .np-culqi-grid{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:9px}
    .np-culqi-grid .wide{grid-column:1/-1}
    .np-culqi-preview{margin-top:10px;padding:10px 12px;border-radius:12px;background:#061426;color:#fff;font-size:12px;font-weight:800;line-height:1.5}
    .np-culqi-preview strong{color:#58e0e8}
    @media(max-width:900px){.np-culqi-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:620px){.np-culqi-grid{grid-template-columns:1fr}.np-culqi-grid .wide{grid-column:auto}}
  `;
  document.head.appendChild(style);
}
function enhancePlan(element){
  if(!element || element.dataset.culqiReady === '1') return;
  const existing = remotePlanFor(element);
  const name = clean(getField(element,'nombre')?.value);
  const type = getField(element,'tipoCobro')?.value === 'unico' ? 'unico' : 'mensual';
  const matricula = num(getField(element,'matricula')?.value);
  const modalidad = clean(existing.modalidad) || inferModalidad(name);
  const turno = clean(existing.turno) || inferTurno(name);
  const cobro = initialType(clean(existing.cobroInicial),type,matricula);
  const later = clean(existing.detallePagosPosteriores) || defaultLaterPayments({
    ...existing,
    nombre:name,
    tipoCobro:type,
    matricula:matricula,
    precio:num(getField(element,'precio')?.value),
    precioPromocional:num(getField(element,'precioPromocional')?.value),
    promocionActiva:!!getField(element,'promocionActiva')?.checked,
    promocionHasta:clean(getField(element,'promocionHasta')?.value),
    cobroInicial:cobro
  });

  const block = document.createElement('div');
  block.className = 'np-culqi-block';
  block.innerHTML = `
    <div class="np-culqi-block__title"><span>Configuración del pago inicial</span><small>Fuente oficial para preinscripción y Culqi</small></div>
    <div class="np-culqi-grid">
      <label><span>Modalidad</span><select data-culqi-field="modalidad"><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Mixta">Mixta</option></select></label>
      <label><span>Turno</span><input data-culqi-field="turno" value="${esc(turno)}" placeholder="Ej. Mañana, Tarde o FULL"></label>
      <label><span>¿Qué se cobra al inicio?</span><select data-culqi-field="cobroInicial"><option value="matricula_y_primera_cuota">Matrícula + primera pensión</option><option value="solo_matricula">Solo matrícula</option><option value="primera_cuota">Primera pensión / importe del plan</option><option value="pago_total">Pago completo del programa</option></select></label>
      <label class="wide"><span>Pagos posteriores</span><input data-culqi-field="detallePagosPosteriores" value="${esc(later)}" placeholder="Ej. Pensiones mensuales posteriores según cronograma"></label>
    </div>
    <div class="np-culqi-preview" data-culqi-preview></div>`;

  const schedule = element.querySelector('.np-schedule');
  if(schedule) schedule.insertAdjacentElement('beforebegin',block);
  else element.querySelector('.np-plan-grid')?.appendChild(block);

  block.querySelector('[data-culqi-field="modalidad"]').value = modalidad;
  block.querySelector('[data-culqi-field="cobroInicial"]').value = cobro;
  block.addEventListener('input',() => updateCulqiPreview(element));
  block.addEventListener('change',() => updateCulqiPreview(element));
  element.addEventListener('input',() => updateCulqiPreview(element));
  element.addEventListener('change',() => updateCulqiPreview(element));
  element.dataset.culqiReady = '1';
  updateCulqiPreview(element);
}
function readPlan(element,index){
  const nombre = clean(getField(element,'nombre')?.value) || ('Plan ' + (index + 1));
  const tipoCobro = getField(element,'tipoCobro')?.value === 'unico' ? 'unico' : 'mensual';
  const matricula = num(getField(element,'matricula')?.value);
  const extra = field => element.querySelector('[data-culqi-field="' + field + '"]');
  const plan = {
    id:clean(element.dataset.fixedPlanId) || ('plan-' + (index + 1)),
    nombre:nombre,
    activo:!!getField(element,'activo')?.checked,
    destacado:!!getField(element,'destacado')?.checked,
    tipoCobro:tipoCobro,
    precio:num(getField(element,'precio')?.value),
    matricula:matricula,
    modalidad:clean(extra('modalidad')?.value) || inferModalidad(nombre),
    turno:clean(extra('turno')?.value) || inferTurno(nombre),
    cobroInicial:initialType(clean(extra('cobroInicial')?.value),tipoCobro,matricula),
    detallePagosPosteriores:clean(extra('detallePagosPosteriores')?.value),
    horarioLineas:lineList(getField(element,'horarioLineas')?.value,6),
    beneficios:lineList(getField(element,'beneficios')?.value,8),
    promocionActiva:!!getField(element,'promocionActiva')?.checked,
    precioPromocional:num(getField(element,'precioPromocional')?.value),
    promocionHasta:clean(getField(element,'promocionHasta')?.value),
    orden:index + 1
  };
  if(!plan.detallePagosPosteriores) plan.detallePagosPosteriores = defaultLaterPayments(plan);
  const calc = calculateInitial(plan);
  return {
    ...plan,
    conceptoInicial:calc.conceptoInicial,
    precioAplicadoReferencia:calc.precioAplicado,
    promocionAplicadaReferencia:calc.promocionAplicada,
    totalInicialReferencia:calc.totalInicial
  };
}
function updateCulqiPreview(element){
  const preview = element.querySelector('[data-culqi-preview]');
  if(!preview) return;
  const index = Number(element.dataset.planIndex || 0);
  const plan = readPlan(element,index);
  const calc = calculateInitial(plan);
  preview.innerHTML = '<strong>Pago inicial:</strong> ' + esc(calc.conceptoInicial) +
    ' · <strong>Total actual: ' + money(calc.totalInicial) + '</strong>' +
    ' · ' + esc(plan.modalidad) + ' / ' + esc(plan.turno) +
    '<br>Después: ' + esc(plan.detallePagosPosteriores);
}
function enhanceAll(){
  addStyles();
  document.querySelectorAll('#nostra-program-grid [data-plan]').forEach(enhancePlan);
  const help = document.querySelector('#nostra-pricing-admin-panel .np-help');
  if(help && help.dataset.culqiHelp !== '1'){
    help.insertAdjacentHTML('beforeend','<br><b>Pago inicial:</b> define exactamente qué importe verá el alumno y qué monto será validado nuevamente por el backend antes de cobrar con Culqi.');
    help.dataset.culqiHelp = '1';
  }
}
function setMessage(type,text){
  const box = document.getElementById('nostra-pricing-message');
  if(!box) return;
  box.className = 'msg ' + type;
  box.innerHTML = text;
}
async function loadRemotePrograms(){
  try{
    const snapshot = await getDocs(collection(db,COLLECTION));
    remotePrograms = new Map(snapshot.docs.map(item => [item.id,{id:item.id,...item.data()}]));
  }catch(error){
    console.warn('No se pudo leer la configuración ampliada del tarifario:',error);
  }
  window.setTimeout(enhanceAll,0);
}
function validateProgram(program){
  if(program.publicado && !program.descripcion) return 'Agrega una descripción comercial al programa.';
  const active = program.planes.filter(plan => plan.activo);
  if(program.publicado && !active.length) return 'El programa necesita al menos un plan activo.';
  for(const plan of active){
    if(plan.precio <= 0) return 'El plan “' + plan.nombre + '” necesita un precio mayor que cero.';
    if(!plan.modalidad) return 'Selecciona la modalidad de “' + plan.nombre + '”.';
    if(!plan.turno) return 'Indica el turno de “' + plan.nombre + '”.';
    const calc = calculateInitial(plan);
    if(calc.totalInicial <= 0) return 'El pago inicial de “' + plan.nombre + '” debe ser mayor que cero.';
    if(plan.cobroInicial === 'solo_matricula' && plan.matricula <= 0) return '“' + plan.nombre + '” está configurado como solo matrícula, pero la matrícula está en cero.';
    if(plan.promocionActiva && plan.precioPromocional <= 0) return 'La promoción de “' + plan.nombre + '” necesita un precio.';
    if(plan.promocionActiva && plan.precioPromocional >= plan.precio) return 'La promoción de “' + plan.nombre + '” debe ser menor al precio regular.';
    if(plan.promocionActiva && !plan.promocionHasta) return 'Indica la fecha final de la promoción de “' + plan.nombre + '”.';
  }
  return '';
}
async function saveEnhancedProgram(button){
  if(saving || !currentUser) return;
  const card = button.closest('[data-program]');
  if(!card) return;
  enhanceAll();
  const programId = clean(card.dataset.program);
  const existing = remotePrograms.get(programId) || {};
  const getProgramField = field => card.querySelector('[data-program-field="' + field + '"]');
  const program = {
    ...existing,
    id:programId,
    nombre:clean(card.querySelector('.np-program-head h3')?.textContent) || clean(existing.nombre),
    ruta:clean(card.querySelector('.np-program-head small')?.textContent) || clean(existing.ruta),
    orden:num(existing.orden),
    descripcion:clean(getProgramField('descripcion')?.value),
    publicado:!!getProgramField('publicado')?.checked,
    fechaInicio:clean(getProgramField('fechaInicio')?.value),
    duracion:clean(getProgramField('duracion')?.value),
    planes:Array.from(card.querySelectorAll('[data-plan]')).map(readPlan)
  };
  const error = validateProgram(program);
  if(error) return setMessage('err',error);
  if(!confirm('¿Guardar los precios y la configuración del pago inicial de ' + program.nombre + '?')) return;

  try{
    saving = true;
    button.disabled = true;
    button.textContent = 'Guardando configuración...';
    setMessage('info','Guardando tarifario y pago inicial oficial...');
    const payload = {
      nombre:program.nombre,
      ruta:program.ruta,
      orden:program.orden,
      descripcion:program.descripcion,
      publicado:program.publicado,
      fechaInicio:program.fechaInicio,
      duracion:program.duracion,
      planes:program.planes,
      moneda:'PEN',
      esquemaPrecios:4,
      actualizadoPor:currentUser.email,
      updatedAt:serverTimestamp()
    };
    if(!existing.updatedAt) payload.createdAt = serverTimestamp();
    await setDoc(doc(db,COLLECTION,programId),payload,{merge:true});
    remotePrograms.set(programId,{...existing,...payload,updatedAt:new Date()});
    setMessage('ok','✅ Tarifario guardado. El formulario de preinscripción utilizará estos montos y esta definición de pago inicial.');
    window.setTimeout(() => document.getElementById('nostra-pricing-reload')?.click(),350);
  }catch(errorSave){
    console.error('No se pudo guardar el tarifario ampliado:',errorSave);
    setMessage('err',errorSave?.code === 'permission-denied'
      ? 'Firebase no permitió guardar el tarifario. Revisa la regla de programas_publicos.'
      : 'No se pudo guardar la configuración. Revisa la conexión e intenta nuevamente.');
  }finally{
    saving = false;
    button.disabled = false;
    button.textContent = 'Guardar ' + program.nombre;
  }
}

document.addEventListener('click',event => {
  const button = event.target.closest && event.target.closest('[data-save-program]');
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  saveEnhancedProgram(button);
},true);

const observer = new MutationObserver(() => window.setTimeout(enhanceAll,0));
observer.observe(document.documentElement,{childList:true,subtree:true});

onAuthStateChanged(auth,user => {
  const email = clean(user?.email).toLowerCase();
  if(!user || email !== ADMIN_EMAIL){
    currentUser = null;
    return;
  }
  currentUser = user;
  loadRemotePrograms();
  enhanceAll();
});
