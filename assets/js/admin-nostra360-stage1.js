/* ==================================================
   Grupo Nostradamus - Etapa 1B / Parte 2
   Administración segura y exclusiva de Nostra 360 UNI.
   Lee y escribe programas_publicos/nostra-360-uni.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

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
const PROGRAM_ID = 'nostra-360-uni';
const PROGRAM_NAME = 'Nostra 360 UNI';
const PROGRAM_ROUTE = 'ciclo-anual-uni.html';

const DEFAULT_PLANS = [
  {
    id:'presencial-turno-manana', nombre:'Presencial - Turno Mañana', tipoCobro:'mensual', precio:400,
    matricula:0, activo:true, destacado:false, promocionActiva:false, precioPromocional:0,
    promocionHasta:'', beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos']
  },
  {
    id:'presencial-full', nombre:'Presencial - FULL', tipoCobro:'mensual', precio:500,
    matricula:0, activo:true, destacado:true, promocionActiva:false, precioPromocional:0,
    promocionHasta:'', beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos','Experiencia práctica']
  },
  {
    id:'virtual-turno-manana', nombre:'Virtual - Turno Mañana', tipoCobro:'mensual', precio:200,
    matricula:0, activo:true, destacado:false, promocionActiva:false, precioPromocional:0,
    promocionHasta:'', beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria']
  },
  {
    id:'virtual-full', nombre:'Virtual - FULL', tipoCobro:'mensual', precio:300,
    matricula:0, activo:true, destacado:true, promocionActiva:false, precioPromocional:0,
    promocionHasta:'', beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria','Interacción en tiempo real']
  }
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let saving = false;
let lastCard = null;
let reloadTimer = null;

function clean(value){ return String(value == null ? '' : value).trim(); }
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'"]/g,c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }
function normalizeBenefits(value){
  if(Array.isArray(value)) return value.map(clean).filter(Boolean).slice(0,8);
  return clean(value).split(/\r?\n/).map(clean).filter(Boolean).slice(0,8);
}
function normalizePlan(plan,index){
  const fallback = DEFAULT_PLANS[index] || DEFAULT_PLANS[0];
  return {
    id:clean(plan?.id || fallback.id),
    nombre:clean(plan?.nombre || fallback.nombre),
    activo:plan?.activo !== false,
    destacado:plan?.destacado === true,
    tipoCobro:plan?.tipoCobro === 'unico' ? 'unico' : 'mensual',
    precio:num(plan?.precio ?? fallback.precio),
    matricula:num(plan?.matricula),
    beneficios:normalizeBenefits(plan?.beneficios?.length ? plan.beneficios : fallback.beneficios),
    promocionActiva:plan?.promocionActiva === true,
    precioPromocional:num(plan?.precioPromocional),
    promocionHasta:clean(plan?.promocionHasta)
  };
}
function setMessage(type,text){
  const el = document.getElementById('nostra-pricing-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.innerHTML = text;
}
function formatSaved(value){
  if(!value) return 'Todavía no guardado';
  try{
    const date = value.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'Todavía no guardado' : date.toLocaleString('es-PE');
  }catch(_){ return 'Todavía no guardado'; }
}
function planHtml(plan,index){
  const p = normalizePlan(plan,index);
  return `
    <div class="np-plan" data-plan data-program-id="${PROGRAM_ID}" data-plan-index="${index}" data-fixed-plan-id="${esc(p.id)}">
      <div class="np-plan-top">
        <span class="np-plan-title">Plan ${index + 1}</span>
        <div>
          <label class="np-check" style="display:inline-flex!important"><input type="checkbox" data-plan-field="activo" ${p.activo ? 'checked' : ''}> Activo</label>
          <label class="np-check" style="display:inline-flex!important;margin-left:9px"><input type="checkbox" data-plan-field="destacado" ${p.destacado ? 'checked' : ''}> Destacado</label>
        </div>
      </div>
      <div class="np-plan-grid">
        <label><span>Nombre del plan</span><input data-plan-field="nombre" value="${esc(p.nombre)}"></label>
        <label><span>Tipo de cobro</span><select data-plan-field="tipoCobro"><option value="mensual" ${p.tipoCobro === 'mensual' ? 'selected' : ''}>Mensual</option><option value="unico" ${p.tipoCobro === 'unico' ? 'selected' : ''}>Pago único</option></select></label>
        <label><span>Precio regular (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precio" value="${p.precio || ''}"></label>
        <label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-plan-field="matricula" value="${p.matricula || ''}" placeholder="Opcional"></label>
        <label class="wide"><span>Beneficios — uno por línea</span><textarea data-plan-field="beneficios">${esc(p.beneficios.join('\n'))}</textarea></label>
        <div class="np-promo">
          <label class="np-check"><input type="checkbox" data-plan-field="promocionActiva" ${p.promocionActiva ? 'checked' : ''}> Promoción</label>
          <label><span>Precio promocional (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precioPromocional" value="${p.precioPromocional || ''}"></label>
          <label><span>Válida hasta</span><input type="date" data-plan-field="promocionHasta" value="${esc(p.promocionHasta)}"></label>
        </div>
        <div class="np-preview" data-plan-preview>${esc(p.nombre)}: ${money(p.precio)} ${p.tipoCobro === 'mensual' ? 'mensual' : 'pago único'}</div>
      </div>
    </div>`;
}
function readPlan(el,index){
  const get = field => el.querySelector(`[data-plan-field="${field}"]`);
  const fixedId = clean(el.dataset.fixedPlanId) || DEFAULT_PLANS[index].id;
  return normalizePlan({
    id:fixedId,
    nombre:get('nombre')?.value,
    activo:!!get('activo')?.checked,
    destacado:!!get('destacado')?.checked,
    tipoCobro:get('tipoCobro')?.value,
    precio:get('precio')?.value,
    matricula:get('matricula')?.value,
    beneficios:get('beneficios')?.value,
    promocionActiva:!!get('promocionActiva')?.checked,
    precioPromocional:get('precioPromocional')?.value,
    promocionHasta:get('promocionHasta')?.value
  },index);
}
function updatePreview(planEl){
  const preview = planEl.querySelector('[data-plan-preview]');
  if(!preview) return;
  const index = Number(planEl.dataset.planIndex || 0);
  const plan = readPlan(planEl,index);
  let text = `${plan.nombre}: ${money(plan.precio)} ${plan.tipoCobro === 'mensual' ? 'mensual' : 'pago único'}`;
  if(plan.matricula > 0) text += ` · Matrícula: ${money(plan.matricula)}`;
  if(plan.promocionActiva && plan.precioPromocional > 0){
    text += ` · Promoción: ${money(plan.precioPromocional)}`;
    if(plan.promocionHasta) text += ` hasta ${plan.promocionHasta}`;
  }
  preview.textContent = text;
}
function readProgram(card){
  const get = field => card.querySelector(`[data-program-field="${field}"]`);
  return {
    nombre:PROGRAM_NAME,
    ruta:PROGRAM_ROUTE,
    orden:1,
    descripcion:clean(get('descripcion')?.value) || 'Preparación integral desde las bases hasta el nivel de admisión UNI.',
    publicado:!!get('publicado')?.checked,
    fechaInicio:clean(get('fechaInicio')?.value),
    duracion:clean(get('duracion')?.value),
    planes:Array.from(card.querySelectorAll('[data-plan]')).slice(0,4).map(readPlan)
  };
}
function validate(program){
  if(!program.descripcion) return 'Agrega una descripción de Nostra 360 UNI.';
  if(program.planes.length !== 4) return 'Nostra 360 debe conservar exactamente sus cuatro planes.';
  const active = program.planes.filter(plan => plan.activo);
  if(program.publicado && !active.length) return 'Debe existir por lo menos un plan activo.';
  for(const plan of active){
    if(plan.precio <= 0) return `El plan “${plan.nombre}” necesita un precio mayor que cero.`;
    if(plan.promocionActiva && plan.precioPromocional <= 0) return `La promoción de “${plan.nombre}” necesita un precio.`;
    if(plan.promocionActiva && plan.precioPromocional >= plan.precio) return `La promoción de “${plan.nombre}” debe ser menor que su precio regular.`;
    if(plan.promocionActiva && !plan.promocionHasta) return `Indica hasta cuándo estará vigente la promoción de “${plan.nombre}”.`;
  }
  return '';
}
function payload(program,isNew){
  const data = {
    nombre:PROGRAM_NAME,
    ruta:PROGRAM_ROUTE,
    orden:1,
    descripcion:program.descripcion,
    publicado:program.publicado,
    fechaInicio:program.fechaInicio,
    duracion:program.duracion,
    planes:program.planes.map((plan,index) => ({...plan,orden:index + 1})),
    moneda:'PEN',
    esquemaPrecios:2,
    actualizadoPor:currentUser?.email || ADMIN_EMAIL,
    updatedAt:serverTimestamp()
  };
  if(isNew) data.createdAt = serverTimestamp();
  return data;
}
function preparePanel(card,data){
  if(!card) return;
  lastCard = card;
  const panel = document.getElementById('nostra-pricing-admin-panel');
  const grid = document.getElementById('nostra-program-grid');
  if(!panel || !grid) return;

  grid.querySelectorAll('.np-program').forEach(item => { item.style.display = item === card ? '' : 'none'; });
  const heading = panel.querySelector('.np-head h2');
  const copy = panel.querySelector('.np-head p');
  const help = panel.querySelector('.np-help');
  if(heading) heading.textContent = 'Parte 2 · Guardar precios de Nostra 360 UNI';
  if(copy) copy.textContent = 'Edita los cuatro planes y guarda. Solo este ciclo está habilitado durante esta prueba.';
  if(help) help.innerHTML = '<b>Seguridad:</b> la página pública solo puede leer precios. Únicamente tu cuenta administradora podrá guardar Nostra 360 cuando se publique la regla de Firebase.';

  const saveAll = document.getElementById('nostra-pricing-save-all');
  if(saveAll) saveAll.style.display = 'none';
  const addButton = card.querySelector('[data-add-plan]');
  if(addButton) addButton.style.display = 'none';
  card.querySelectorAll('[data-remove-plan]').forEach(button => button.remove());

  const general = data || {};
  const programPublished = card.querySelector('[data-program-field="publicado"]');
  const start = card.querySelector('[data-program-field="fechaInicio"]');
  const duration = card.querySelector('[data-program-field="duracion"]');
  const description = card.querySelector('[data-program-field="descripcion"]');
  if(programPublished) programPublished.checked = general.publicado !== false;
  if(start) start.value = clean(general.fechaInicio);
  if(duration) duration.value = clean(general.duracion);
  if(description) description.value = clean(general.descripcion) || 'Preparación integral desde las bases hasta el nivel de admisión UNI.';

  const plans = Array.isArray(general.planes) && general.planes.length === 4 ? general.planes : DEFAULT_PLANS;
  const host = card.querySelector('.np-plans');
  if(host) host.innerHTML = plans.map(planHtml).join('');
  card.querySelectorAll('[data-plan]').forEach(plan => {
    plan.addEventListener('input',() => updatePreview(plan));
    plan.addEventListener('change',() => updatePreview(plan));
  });

  const footerStatus = card.querySelector('.np-status');
  if(footerStatus) footerStatus.textContent = 'Última edición: ' + formatSaved(general.updatedAt);

  const oldButton = card.querySelector('[data-save-program]');
  if(oldButton){
    const button = oldButton.cloneNode(true);
    button.disabled = false;
    button.textContent = 'Guardar Nostra 360 UNI';
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.title = 'Guardar los cuatro planes en Firebase';
    oldButton.replaceWith(button);
    button.addEventListener('click',event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      saveNostra360(card,button);
    });
  }
  card.dataset.nostra360Stage2 = '1';
}
async function loadNostra360(card){
  setMessage('info','Verificando si ya existen precios guardados de Nostra 360...');
  try{
    const snapshot = await getDoc(doc(db,COLLECTION,PROGRAM_ID));
    if(snapshot.exists()){
      preparePanel(card,snapshot.data());
      setMessage('ok','✅ Se cargaron los últimos precios guardados de Nostra 360. Ya puedes editarlos y pulsar “Guardar Nostra 360 UNI”.');
    }else{
      preparePanel(card,{publicado:true,planes:DEFAULT_PLANS});
      setMessage('info','No existe todavía un tarifario guardado. Se muestran los cuatro precios verificados como base. El primer guardado creará el registro.');
    }
  }catch(error){
    console.warn('Permiso pendiente para programas_publicos:',error);
    preparePanel(card,{publicado:true,planes:DEFAULT_PLANS});
    if(error?.code === 'permission-denied'){
      setMessage('err','Firebase todavía no permite leer o guardar “programas_publicos”. El código ya está preparado; falta publicar la regla segura indicada para la Parte 2. Tus campos permanecen editables.');
    }else{
      setMessage('err','No se pudo verificar Firebase en este momento. Se mantienen los precios verificados como respaldo.');
    }
  }
}
async function saveNostra360(card,button){
  if(saving || !currentUser) return;
  const program = readProgram(card);
  const error = validate(program);
  if(error) return setMessage('err',error);
  if(!confirm('¿Guardar estos precios de Nostra 360 UNI? La subpágina pública utilizará estos valores.')) return;

  const original = button.textContent;
  try{
    saving = true;
    button.disabled = true;
    button.textContent = 'Guardando...';
    setMessage('info','Guardando los cuatro planes de Nostra 360...');
    const ref = doc(db,COLLECTION,PROGRAM_ID);
    const existing = await getDoc(ref);
    await setDoc(ref,payload(program,!existing.exists()),{merge:true});
    const saved = await getDoc(ref);
    preparePanel(card,saved.exists() ? saved.data() : program);
    setMessage('ok','✅ Precios de Nostra 360 guardados correctamente. Actualiza la subpágina del ciclo para comprobar el cambio.');
  }catch(errorSave){
    console.error('No se pudo guardar Nostra 360:',errorSave);
    if(errorSave?.code === 'permission-denied'){
      setMessage('err','No se pudo guardar porque la regla de Firebase aún no está publicada. No se perdió ningún valor: publica la regla segura y vuelve a pulsar Guardar.');
    }else{
      setMessage('err','No se pudo guardar Nostra 360. Revisa la conexión e intenta nuevamente.');
    }
  }finally{
    saving = false;
    const currentButton = card.querySelector('[data-save-program]');
    if(currentButton){ currentButton.disabled = false; currentButton.textContent = original; }
  }
}
function findAndLoad(){
  if(!currentUser) return;
  const grid = document.getElementById('nostra-program-grid');
  const card = grid?.querySelector(`[data-program="${PROGRAM_ID}"]`);
  if(!card) return;
  if(card !== lastCard || card.dataset.nostra360Stage2 !== '1') loadNostra360(card);
}
function scheduleReload(){
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    lastCard = null;
    findAndLoad();
  },500);
}

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL){ currentUser = null; return; }
  currentUser = user;
  findAndLoad();
  const timer = setInterval(findAndLoad,500);
  setTimeout(() => clearInterval(timer),30000);
  const root = document.getElementById('admin-panel');
  if(root && window.MutationObserver){
    const observer = new MutationObserver(scheduleReload);
    observer.observe(root,{childList:true,subtree:true});
    setTimeout(() => observer.disconnect(),120000);
  }
});

document.addEventListener('click',event => {
  if(event.target.closest('#nostra-pricing-reload')) scheduleReload();
},true);
