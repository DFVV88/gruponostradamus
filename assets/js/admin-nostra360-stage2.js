/* ==================================================
   Grupo Nostradamus - Parte 2
   Editor de precios, promociones y horarios de Nostra 360 UNI.
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
const DESCRIPTION = 'Preparación integral desde las bases hasta el nivel de admisión UNI.';

const MORNING_SCHEDULE = ['Lunes a Sábado','8:00 a.m. a 1:00 p.m.','Más dos tardes RM y RV'];
const FULL_SCHEDULE = ['Lunes a Viernes','8:00 a.m. a 6:00 p.m.','Sábados','8:00 a.m. a 1:00 p.m.'];

const DEFAULT_PLANS = [
  {id:'presencial-turno-manana',nombre:'Presencial - Turno Mañana',tipoCobro:'mensual',precio:400,matricula:0,activo:true,destacado:false,promocionActiva:false,precioPromocional:0,promocionHasta:'',horarioLineas:MORNING_SCHEDULE,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos']},
  {id:'presencial-full',nombre:'Presencial - FULL',tipoCobro:'mensual',precio:500,matricula:0,activo:true,destacado:true,promocionActiva:false,precioPromocional:0,promocionHasta:'',horarioLineas:FULL_SCHEDULE,beneficios:['Clases en aulas equipadas','Atención personalizada','Materiales impresos','Experiencia práctica']},
  {id:'virtual-turno-manana',nombre:'Virtual - Turno Mañana',tipoCobro:'mensual',precio:200,matricula:0,activo:true,destacado:false,promocionActiva:false,precioPromocional:0,promocionHasta:'',horarioLineas:MORNING_SCHEDULE,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria']},
  {id:'virtual-full',nombre:'Virtual - FULL',tipoCobro:'mensual',precio:300,matricula:0,activo:true,destacado:true,promocionActiva:false,precioPromocional:0,promocionHasta:'',horarioLineas:FULL_SCHEDULE,beneficios:['Acceso a materiales 24/7','Plataforma interactiva','Flexibilidad horaria','Interacción en tiempo real']}
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let saving = false;

function clean(value){ return String(value == null ? '' : value).trim(); }
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',','.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }
function lineList(value,fallback,max){
  const list = Array.isArray(value) ? value : clean(value).split(/\r?\n/);
  const normalized = list.map(clean).filter(Boolean).slice(0,max || 8);
  return normalized.length ? normalized : [...fallback];
}
function normalizePlan(plan,index){
  const fallback = DEFAULT_PLANS[index];
  return {
    id:clean(plan?.id) || fallback.id,
    nombre:clean(plan?.nombre) || fallback.nombre,
    tipoCobro:plan?.tipoCobro === 'unico' ? 'unico' : 'mensual',
    precio:num(plan?.precio ?? fallback.precio),
    matricula:num(plan?.matricula),
    activo:plan?.activo !== false,
    destacado:plan?.destacado === true,
    promocionActiva:plan?.promocionActiva === true,
    precioPromocional:num(plan?.precioPromocional),
    promocionHasta:clean(plan?.promocionHasta),
    horarioLineas:lineList(plan?.horarioLineas,fallback.horarioLineas,6),
    beneficios:lineList(plan?.beneficios,fallback.beneficios,8)
  };
}
function setMessage(type,text){
  const box = document.getElementById('nostra-pricing-message');
  if(!box) return;
  box.className = 'msg ' + type;
  box.innerHTML = text;
}
function planHtml(plan,index){
  const p = normalizePlan(plan,index);
  return `
  <div class="np-plan" data-plan data-plan-index="${index}" data-fixed-plan-id="${esc(p.id)}">
    <div class="np-plan-top"><span class="np-plan-title">Plan ${index + 1}</span><div>
      <label class="np-check" style="display:inline-flex!important"><input type="checkbox" data-plan-field="activo" ${p.activo ? 'checked' : ''}> Activo</label>
      <label class="np-check" style="display:inline-flex!important;margin-left:9px"><input type="checkbox" data-plan-field="destacado" ${p.destacado ? 'checked' : ''}> Destacado</label>
    </div></div>
    <div class="np-plan-grid">
      <label><span>Nombre del plan</span><input data-plan-field="nombre" value="${esc(p.nombre)}"></label>
      <label><span>Tipo de cobro</span><select data-plan-field="tipoCobro"><option value="mensual" ${p.tipoCobro === 'mensual' ? 'selected' : ''}>Mensual</option><option value="unico" ${p.tipoCobro === 'unico' ? 'selected' : ''}>Pago único</option></select></label>
      <label><span>Precio regular (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precio" value="${p.precio || ''}"></label>
      <label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-plan-field="matricula" value="${p.matricula || ''}" placeholder="Opcional"></label>
      <label class="wide np-schedule-editor">
        <span>Horario del plan — una línea por dato</span>
        <textarea data-plan-field="horarioLineas" placeholder="Lunes a Sábado&#10;8:00 a.m. a 1:00 p.m.&#10;Más dos tardes RM y RV">${esc(p.horarioLineas.join('\n'))}</textarea>
        <small>Este horario aparecerá en la tarjeta de precios. En los dos planes presenciales también actualizará la sección Descripción.</small>
      </label>
      <label class="wide"><span>Beneficios — uno por línea</span><textarea data-plan-field="beneficios">${esc(p.beneficios.join('\n'))}</textarea></label>
      <div class="np-promo">
        <label class="np-check"><input type="checkbox" data-plan-field="promocionActiva" ${p.promocionActiva ? 'checked' : ''}> Promoción</label>
        <label><span>Precio promocional (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precioPromocional" value="${p.precioPromocional || ''}"></label>
        <label><span>Válida hasta</span><input type="date" data-plan-field="promocionHasta" value="${esc(p.promocionHasta)}"></label>
      </div>
      <div class="np-preview" data-plan-preview></div>
    </div>
  </div>`;
}
function readPlan(element,index){
  const get = field => element.querySelector(`[data-plan-field="${field}"]`);
  return normalizePlan({
    id:element.dataset.fixedPlanId || DEFAULT_PLANS[index].id,
    nombre:get('nombre')?.value,
    tipoCobro:get('tipoCobro')?.value,
    precio:get('precio')?.value,
    matricula:get('matricula')?.value,
    activo:!!get('activo')?.checked,
    destacado:!!get('destacado')?.checked,
    promocionActiva:!!get('promocionActiva')?.checked,
    precioPromocional:get('precioPromocional')?.value,
    promocionHasta:get('promocionHasta')?.value,
    horarioLineas:get('horarioLineas')?.value,
    beneficios:get('beneficios')?.value
  },index);
}
function updatePreview(element){
  const index = Number(element.dataset.planIndex || 0);
  const plan = readPlan(element,index);
  const preview = element.querySelector('[data-plan-preview]');
  if(!preview) return;
  let text = `${plan.nombre}: ${money(plan.precio)} ${plan.tipoCobro === 'mensual' ? 'mensual' : 'pago único'}`;
  if(plan.matricula > 0) text += ` · Matrícula: ${money(plan.matricula)}`;
  if(plan.horarioLineas.length) text += ` · Horario: ${plan.horarioLineas.join(' / ')}`;
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
    descripcion:clean(get('descripcion')?.value) || DESCRIPTION,
    publicado:!!get('publicado')?.checked,
    fechaInicio:clean(get('fechaInicio')?.value),
    duracion:clean(get('duracion')?.value),
    planes:Array.from(card.querySelectorAll('[data-plan]')).slice(0,4).map(readPlan)
  };
}
function validate(program){
  if(program.planes.length !== 4) return 'Nostra 360 debe conservar exactamente sus cuatro planes.';
  const active = program.planes.filter(plan => plan.activo);
  if(program.publicado && !active.length) return 'Debe existir por lo menos un plan activo.';
  for(const plan of active){
    if(plan.precio <= 0) return `El plan “${plan.nombre}” necesita un precio mayor que cero.`;
    if(!plan.horarioLineas.length) return `Agrega el horario del plan “${plan.nombre}”.`;
    if(plan.promocionActiva && plan.precioPromocional <= 0) return `La promoción de “${plan.nombre}” necesita un precio.`;
    if(plan.promocionActiva && plan.precioPromocional >= plan.precio) return `La promoción de “${plan.nombre}” debe ser menor que el precio regular.`;
    if(plan.promocionActiva && !plan.promocionHasta) return `Indica la fecha final de la promoción de “${plan.nombre}”.`;
  }
  return '';
}
function payload(program,isNew){
  const data = {
    nombre:PROGRAM_NAME,ruta:PROGRAM_ROUTE,orden:1,descripcion:program.descripcion,
    publicado:program.publicado,fechaInicio:program.fechaInicio,duracion:program.duracion,
    planes:program.planes.map((plan,index) => ({...plan,orden:index + 1})),
    moneda:'PEN',esquemaPrecios:3,actualizadoPor:currentUser?.email || ADMIN_EMAIL,
    updatedAt:serverTimestamp()
  };
  if(isNew) data.createdAt = serverTimestamp();
  return data;
}
function addLocalStyles(){
  if(document.getElementById('nostra360-admin-schedule-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra360-admin-schedule-style';
  style.textContent = '.np-schedule-editor textarea{min-height:112px}.np-schedule-editor small{display:block;margin-top:6px;color:#607080;font-weight:750;line-height:1.4;text-transform:none;letter-spacing:0}';
  document.head.appendChild(style);
}
function prepare(card,data){
  const panel = document.getElementById('nostra-pricing-admin-panel');
  const grid = document.getElementById('nostra-program-grid');
  if(!panel || !grid || !card) return;
  addLocalStyles();

  grid.querySelectorAll('.np-program').forEach(item => { item.style.display = item === card ? '' : 'none'; });
  panel.querySelector('.np-head h2').textContent = 'Parte 2 · Precios y horarios de Nostra 360 UNI';
  panel.querySelector('.np-head p').textContent = 'Edita precios, promociones, beneficios y horarios de los cuatro planes. Guarda todo desde este mismo panel.';
  const help = panel.querySelector('.np-help');
  if(help) help.innerHTML = '<b>Horario:</b> escribe una línea por dato. Los cambios aparecerán en las tarjetas de precios y en la sección Descripción de los planes presenciales.';
  const saveAll = document.getElementById('nostra-pricing-save-all');
  if(saveAll) saveAll.style.display = 'none';
  const add = card.querySelector('[data-add-plan]');
  if(add) add.style.display = 'none';

  const source = data || {};
  const published = card.querySelector('[data-program-field="publicado"]');
  const start = card.querySelector('[data-program-field="fechaInicio"]');
  const duration = card.querySelector('[data-program-field="duracion"]');
  const description = card.querySelector('[data-program-field="descripcion"]');
  if(published) published.checked = source.publicado !== false;
  if(start) start.value = clean(source.fechaInicio);
  if(duration) duration.value = clean(source.duracion);
  if(description) description.value = clean(source.descripcion) || DESCRIPTION;

  const plans = Array.isArray(source.planes) && source.planes.length === 4 ? source.planes : DEFAULT_PLANS;
  const host = card.querySelector('.np-plans');
  if(host) host.innerHTML = plans.map(planHtml).join('');
  card.querySelectorAll('[data-plan]').forEach(element => {
    updatePreview(element);
    element.addEventListener('input',() => updatePreview(element));
    element.addEventListener('change',() => updatePreview(element));
  });

  const status = card.querySelector('.np-status');
  if(status){
    const saved = source.updatedAt?.toDate ? source.updatedAt.toDate().toLocaleString('es-PE') : 'Todavía no guardado';
    status.textContent = 'Última edición: ' + saved;
  }

  const oldButton = card.querySelector('[data-save-program]');
  if(oldButton){
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    button.disabled = false;
    button.textContent = 'Guardar precios y horarios';
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.addEventListener('click',event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      save(card,button);
    });
  }
  card.dataset.nostra360Stage2 = 'ready';
}
async function mount(card){
  if(!card || card.dataset.nostra360Stage2 === 'loading' || card.dataset.nostra360Stage2 === 'ready') return;
  card.dataset.nostra360Stage2 = 'loading';
  setMessage('info','Verificando precios y horarios guardados de Nostra 360...');
  try{
    const snapshot = await getDoc(doc(db,COLLECTION,PROGRAM_ID));
    if(snapshot.exists()){
      prepare(card,snapshot.data());
      setMessage('ok','✅ Se cargaron los últimos precios y horarios. Puedes modificarlos y volver a guardar.');
    }else{
      prepare(card,{publicado:true,planes:DEFAULT_PLANS});
      setMessage('info','Se muestran los precios y horarios verificados como base. El primer guardado creará el tarifario.');
    }
  }catch(error){
    console.warn('No se pudo leer programas_publicos:',error);
    prepare(card,{publicado:true,planes:DEFAULT_PLANS});
    setMessage('err',error?.code === 'permission-denied'
      ? 'Firebase no permitió acceder a “programas_publicos”. Revisa las reglas antes de guardar.'
      : 'No se pudo comprobar Firebase. Se mantienen los datos verificados como respaldo.');
  }
}
async function save(card,button){
  if(saving || !currentUser) return;
  const program = readProgram(card);
  const error = validate(program);
  if(error) return setMessage('err',error);
  if(!confirm('¿Guardar estos precios y horarios de Nostra 360 UNI?')) return;

  try{
    saving = true;
    button.disabled = true;
    button.textContent = 'Guardando...';
    setMessage('info','Guardando precios, promociones y horarios de Nostra 360...');
    const ref = doc(db,COLLECTION,PROGRAM_ID);
    let exists = false;
    try{ exists = (await getDoc(ref)).exists(); }catch(_){ /* setDoc mostrará el permiso real */ }
    await setDoc(ref,payload(program,!exists),{merge:true});
    setMessage('ok','✅ Precios y horarios guardados correctamente. Actualiza la página de Nostra 360 para verificar los cambios.');
    const status = card.querySelector('.np-status');
    if(status) status.textContent = 'Última edición: ahora';
  }catch(errorSave){
    console.error('No se pudo guardar Nostra 360:',errorSave);
    setMessage('err',errorSave?.code === 'permission-denied'
      ? 'No se pudo guardar porque Firebase rechazó el permiso. Los valores escritos permanecen en pantalla.'
      : 'No se pudo guardar. Revisa la conexión e intenta nuevamente.');
  }finally{
    saving = false;
    button.disabled = false;
    button.textContent = 'Guardar precios y horarios';
  }
}
function findCard(){
  if(!currentUser) return;
  const grid = document.getElementById('nostra-program-grid');
  const card = grid?.querySelector(`[data-program="${PROGRAM_ID}"]`);
  if(card) mount(card);
}

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL){ currentUser = null; return; }
  currentUser = user;
  findCard();
  const timer = setInterval(findCard,500);
  setTimeout(() => clearInterval(timer),30000);
});

document.addEventListener('click',event => {
  if(event.target.closest('#nostra-pricing-reload')){
    setTimeout(() => {
      const card = document.querySelector(`[data-program="${PROGRAM_ID}"]`);
      if(card){ card.removeAttribute('data-nostra360-stage2'); mount(card); }
    },900);
  }
},true);
