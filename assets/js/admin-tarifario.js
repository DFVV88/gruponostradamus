/* ==================================================
   Grupo Nostradamus - Tarifario por planes
   Etapa 1: precios administrables desde el panel existente.
================================================== */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId: 'nostrachat-grupo-nostradamus',
  storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId: '869749182265',
  appId: '1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const COLLECTION = 'programas_publicos';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PROGRAMS = [
  { id:'nostra-360-uni', nombre:'Nostra 360 UNI', ruta:'ciclo-anual-uni.html', orden:1, descripcion:'Preparación integral desde las bases hasta el nivel de admisión UNI.' },
  { id:'nostra-power-uni', nombre:'Nostra Power UNI', ruta:'ciclo-semianual-uni.html', orden:2, descripcion:'Corrección de debilidades y transformación del rendimiento.' },
  { id:'nostra-elite-uni', nombre:'Nostra Élite UNI', ruta:'ciclo-semestral-uni.html', orden:3, descripcion:'Perfeccionamiento para postulantes competitivos que estuvieron cerca de ingresar.' },
  { id:'nostra-prime-uni', nombre:'Nostra Prime UNI', ruta:'ciclo-repaso-uni.html', orden:4, descripcion:'Preparación decisiva para la etapa final del examen UNI.' },
  { id:'nostra-talentum-uni', nombre:'Nostra Talentum UNI', ruta:'ciclo-elite-uni.html', orden:5, descripcion:'Programa especial de alto rendimiento y máxima exigencia.' },
  { id:'ciclo-ien', nombre:'Ciclo IEN', ruta:'ciclo-ien.html', orden:6, descripcion:'Preparación académica progresiva para el ingreso escolar nacional UNI.' },
  { id:'proyecto-escolar', nombre:'Proyecto Escolar', ruta:'ciclo-proyecto-escolar.html', orden:7, descripcion:'Refuerzo, nivelación y formación escolar con acompañamiento continuo.' },
  { id:'paralelo-cepre-uni', nombre:'Paralelo CEPRE UNI', ruta:'ciclo-paralelo-cepre-uni.html', orden:8, descripcion:'Acompañamiento estratégico para estudiantes de CEPRE UNI.' },
  { id:'ciclo-verano-uni', nombre:'Ciclo Verano UNI', ruta:'ciclo-verano-uni.html', orden:9, descripcion:'Programa intensivo de vacaciones para avanzar y fortalecer bases.' }
];

let catalog = [];
let currentUser = null;
let busy = false;

function esc(value){
  return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}
function clean(value){ return String(value == null ? '' : value).trim(); }
function num(value){
  const parsed = Number(String(value == null ? '' : value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}
function money(value){ return 'S/ ' + num(value).toFixed(2); }
function slug(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'plan';
}
function dateLabel(value){
  if(!value) return '';
  const d = new Date(value + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-PE');
}
function promoActive(plan){
  if(!plan.promocionActiva || num(plan.precioPromocional) <= 0) return false;
  if(!plan.promocionHasta) return true;
  const end = new Date(plan.promocionHasta + 'T23:59:59');
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}
function normalizeBenefits(value){
  if(Array.isArray(value)) return value.map(clean).filter(Boolean).slice(0,8);
  return clean(value).split(/\r?\n/).map(clean).filter(Boolean).slice(0,8);
}
function normalizePlan(plan, index){
  const nombre = clean(plan?.nombre || plan?.titulo || ('Plan ' + (index + 1)));
  return {
    id: clean(plan?.id) || slug(nombre),
    nombre,
    activo: plan?.activo !== false,
    destacado: plan?.destacado === true,
    tipoCobro: ['mensual','unico'].includes(plan?.tipoCobro) ? plan.tipoCobro : 'mensual',
    precio: num(plan?.precio ?? plan?.pension ?? plan?.pagoUnico),
    matricula: num(plan?.matricula),
    beneficios: normalizeBenefits(plan?.beneficios),
    promocionActiva: plan?.promocionActiva === true,
    precioPromocional: num(plan?.precioPromocional),
    promocionHasta: clean(plan?.promocionHasta)
  };
}
function legacyPlan(item){
  const price = num(item?.pension) || num(item?.pagoUnico);
  if(!price && !num(item?.matricula)) return [];
  return [normalizePlan({
    id:'plan-general',
    nombre:'Plan general',
    tipoCobro:num(item?.pagoUnico) > 0 ? 'unico' : 'mensual',
    precio:price,
    matricula:item?.matricula,
    activo:item?.publicado === true,
    promocionActiva:item?.promocionActiva,
    precioPromocional:item?.precioPromocional,
    promocionHasta:item?.promocionHasta,
    beneficios:[]
  },0)];
}

function parseAmount(text){
  const normalized = clean(text).replace(/\s/g,'').replace(',', '.');
  const match = normalized.match(/(?:S\/\.?|S\/)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  return match ? num(match[1]) : 0;
}
async function scrapePlans(program){
  try{
    const response = await fetch(program.ruta, { cache:'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const cards = Array.from(parsed.querySelectorAll('.price-card'));
    return cards.map((card, index) => {
      const nombre = clean(card.querySelector('.price-card_title')?.textContent) || ('Plan ' + (index + 1));
      const duration = clean(card.querySelector('.duration')?.textContent).toLowerCase();
      const priceText = clean(card.querySelector('.price-card_price')?.textContent);
      return normalizePlan({
        id:slug(nombre),
        nombre,
        activo:true,
        destacado:card.classList.contains('active'),
        tipoCobro:duration.includes('mensual') ? 'mensual' : 'unico',
        precio:parseAmount(priceText),
        beneficios:Array.from(card.querySelectorAll('.checklist li')).map(li => clean(li.textContent))
      }, index);
    }).filter(plan => plan.nombre);
  }catch(error){
    console.warn('No se pudieron leer planes de ' + program.ruta, error);
    return [];
  }
}
async function mergeCatalog(remoteDocs){
  const remoteMap = new Map(remoteDocs.map(item => [item.id, item]));
  return Promise.all(PROGRAMS.map(async program => {
    const remote = remoteMap.get(program.id) || {};
    let planes = Array.isArray(remote.planes) ? remote.planes.map(normalizePlan) : legacyPlan(remote);
    if(!planes.length) planes = await scrapePlans(program);
    return {
      ...program,
      ...remote,
      id:program.id,
      nombre:program.nombre,
      ruta:program.ruta,
      orden:program.orden,
      descripcion:clean(remote.descripcion || program.descripcion),
      publicado:remote.publicado !== false,
      fechaInicio:clean(remote.fechaInicio),
      duracion:clean(remote.duracion),
      planes
    };
  }));
}

function addStyles(){
  if(document.getElementById('nostra-admin-pricing-v2-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra-admin-pricing-v2-style';
  style.textContent = `
    #nostra-pricing-admin-panel{margin:0 0 22px;background:linear-gradient(180deg,#fff,#f6fcfd)}
    .np-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}
    .np-head h2{font-family:'Baloo 2';font-size:40px;line-height:1;color:#061426;margin:0 0 7px}
    .np-head p{margin:0;color:#4b5d70;font-size:16px;line-height:1.55;max-width:790px}
    .np-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}
    .np-compliance{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0 20px}
    .np-compliance div{background:#f4fbfd;border:1px solid rgba(7,140,149,.14);border-radius:16px;padding:12px;font-size:13px;font-weight:850;color:#34495e}
    .np-compliance b{display:block;color:#061426;margin-bottom:4px}
    .np-help{padding:16px;border-radius:18px;background:#fff8e8;border:1px solid rgba(255,148,30,.3);color:#6a4700;font-weight:800;line-height:1.55;margin-bottom:16px}
    .np-grid{display:grid;gap:16px}
    .np-program{border:1px solid rgba(7,140,149,.18);border-radius:22px;padding:18px;background:#fff;box-shadow:0 12px 30px rgba(6,20,38,.06)}
    .np-program-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
    .np-program-head h3{font-family:'Baloo 2';font-size:29px;line-height:1;color:#061426;margin:0 0 4px}
    .np-program-head small{color:#607080;font-weight:750}
    .np-program-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .np-check{display:flex!important;align-items:center;gap:7px;font-weight:900;color:#075b65;white-space:nowrap}
    .np-check input{width:auto!important}
    .np-general{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
    .np-general .wide{grid-column:1/-1}
    .np-program label span,.np-plan label span{display:block;font-size:11px;font-weight:950;color:#061426;margin:0 0 5px;text-transform:uppercase;letter-spacing:.25px}
    .np-program input,.np-program select,.np-program textarea{width:100%;border:1px solid #d7e7eb;border-radius:12px;padding:10px 11px;font:inherit;color:#172033;background:#fff}
    .np-program textarea{min-height:68px;resize:vertical}
    .np-plans{display:grid;gap:11px;margin-top:13px}
    .np-plan{border:1px solid #dcecef;border-radius:17px;padding:13px;background:#f9fdfe}
    .np-plan-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .np-plan-title{font-weight:950;color:#061426}
    .np-plan-grid{display:grid;grid-template-columns:1.2fr .75fr .75fr .75fr;gap:9px}
    .np-plan-grid .wide{grid-column:1/-1}
    .np-promo{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr 1fr;gap:9px;align-items:end;padding:10px;border-radius:14px;background:#fff8e8;border:1px solid rgba(255,148,30,.25)}
    .np-promo .np-check{align-self:center}
    .np-preview{grid-column:1/-1;border-radius:13px;padding:10px 12px;background:#eef8fa;color:#075b65;font-weight:850;line-height:1.45}
    .np-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px}
    .np-status{font-size:12px;color:#657584;font-weight:800}
    .np-remove{border:0;background:#fff2f2;color:#b42318;border-radius:999px;padding:7px 10px;font-weight:900;cursor:pointer}
    @media(max-width:1000px){.np-compliance{grid-template-columns:1fr 1fr}.np-head{display:block}.np-actions{justify-content:flex-start;margin-top:12px}.np-plan-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:650px){.np-general,.np-plan-grid,.np-compliance,.np-promo{grid-template-columns:1fr}.np-general .wide,.np-plan-grid .wide{grid-column:auto}.np-program-head,.np-footer{display:block}.np-program-tools{justify-content:flex-start;margin-top:10px}.np-footer .btn{margin-top:8px}}
  `;
  document.head.appendChild(style);
}
function setMessage(type,text){
  const el = document.getElementById('nostra-pricing-message');
  if(!el) return;
  el.className = 'msg ' + type;
  el.innerHTML = text;
}
function ensurePanel(){
  if(document.getElementById('nostra-pricing-admin-panel')) return;
  addStyles();
  const admin = document.getElementById('admin-panel');
  if(!admin) return;
  const panel = document.createElement('section');
  panel.id = 'nostra-pricing-admin-panel';
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="np-head">
      <div>
        <h2>Precios de ciclos y planes</h2>
        <p>Cambia aquí el valor de cada modalidad. El precio se mostrará en el panel que ya existe al final de la subpágina de cada ciclo.</p>
      </div>
      <div class="np-actions">
        <a class="btn btn-light" href="ciclos.html" target="_blank" rel="noopener">Ver ciclos</a>
        <button class="btn btn-blue" id="nostra-pricing-reload">Actualizar</button>
        <button class="btn btn-green" id="nostra-pricing-save-all">Guardar todo</button>
      </div>
    </div>
    <div class="np-compliance">
      <div><b>1. Ciclos y planes</b>En implementación</div>
      <div><b>2. Páginas legales</b>Pendiente</div>
      <div><b>3. Libro de Reclamaciones</b>Pendiente</div>
      <div><b>4. Culqi en pruebas</b>Pendiente</div>
    </div>
    <div class="np-help">Los planes actuales se leen de las subpáginas existentes. Cambia el precio, activa una promoción y pulsa guardar. No se realiza ningún cobro todavía.</div>
    <div class="msg" id="nostra-pricing-message"></div>
    <div class="np-grid" id="nostra-program-grid"><div>Cargando ciclos y planes...</div></div>`;
  const hero = admin.querySelector('.hero');
  if(hero) hero.insertAdjacentElement('afterend',panel);
  else admin.insertBefore(panel,admin.firstChild);

  document.getElementById('nostra-pricing-reload').addEventListener('click',loadCatalog);
  document.getElementById('nostra-pricing-save-all').addEventListener('click',saveAll);
  const grid = document.getElementById('nostra-program-grid');
  grid.addEventListener('click',event => {
    const save = event.target.closest('[data-save-program]');
    const add = event.target.closest('[data-add-plan]');
    const remove = event.target.closest('[data-remove-plan]');
    if(save) saveOne(save.dataset.saveProgram);
    if(add) addPlan(add.dataset.addPlan);
    if(remove) removePlan(remove);
  });
  grid.addEventListener('input',event => {
    const plan = event.target.closest('[data-plan]');
    if(plan) updatePlanPreview(plan);
  });
  grid.addEventListener('change',event => {
    const plan = event.target.closest('[data-plan]');
    if(plan) updatePlanPreview(plan);
  });
}
function formatDate(value){
  if(!value) return 'sin guardar';
  try{
    const date = value.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'sin fecha' : date.toLocaleString('es-PE');
  }catch(_){ return 'sin fecha'; }
}
function renderCatalog(){
  const grid = document.getElementById('nostra-program-grid');
  if(!grid) return;
  grid.innerHTML = catalog.map(program => `
    <article class="np-program" data-program="${esc(program.id)}">
      <div class="np-program-head">
        <div><h3>${esc(program.nombre)}</h3><small>${esc(program.ruta)}</small></div>
        <div class="np-program-tools">
          <label class="np-check"><input type="checkbox" data-program-field="publicado" ${program.publicado ? 'checked' : ''}> Ciclo activo</label>
          <a class="mini" href="${esc(program.ruta)}" target="_blank" rel="noopener">Ver página</a>
        </div>
      </div>
      <div class="np-general">
        <label><span>Fecha de inicio</span><input type="date" data-program-field="fechaInicio" value="${esc(program.fechaInicio)}"></label>
        <label><span>Duración / horario general</span><input data-program-field="duracion" value="${esc(program.duracion)}" placeholder="Ej. 5 meses · lunes a sábado"></label>
        <label class="wide"><span>Descripción</span><textarea data-program-field="descripcion">${esc(program.descripcion)}</textarea></label>
      </div>
      <div class="np-plans">
        ${program.planes.length ? program.planes.map((plan,index) => planHtml(program.id,plan,index)).join('') : '<div class="np-help">No se encontraron planes en esta página. Agrega uno manualmente.</div>'}
      </div>
      <div class="np-footer">
        <span class="np-status">Última edición: ${esc(formatDate(program.updatedAt))}</span>
        <div><button class="btn btn-light" data-add-plan="${esc(program.id)}">+ Agregar plan</button> <button class="btn btn-primary" data-save-program="${esc(program.id)}">Guardar ${esc(program.nombre)}</button></div>
      </div>
    </article>`).join('');
  grid.querySelectorAll('[data-plan]').forEach(updatePlanPreview);
}
function planHtml(programId,plan,index){
  return `
    <div class="np-plan" data-plan data-program-id="${esc(programId)}" data-plan-index="${index}">
      <div class="np-plan-top">
        <span class="np-plan-title">Plan ${index + 1}</span>
        <div>
          <label class="np-check" style="display:inline-flex!important"><input type="checkbox" data-plan-field="activo" ${plan.activo ? 'checked' : ''}> Activo</label>
          <label class="np-check" style="display:inline-flex!important;margin-left:9px"><input type="checkbox" data-plan-field="destacado" ${plan.destacado ? 'checked' : ''}> Destacado</label>
          <button class="np-remove" type="button" data-remove-plan>Retirar</button>
        </div>
      </div>
      <div class="np-plan-grid">
        <label><span>Nombre del plan</span><input data-plan-field="nombre" value="${esc(plan.nombre)}" placeholder="Ej. Presencial - FULL"></label>
        <label><span>Tipo de cobro</span><select data-plan-field="tipoCobro"><option value="mensual" ${plan.tipoCobro === 'mensual' ? 'selected' : ''}>Mensual</option><option value="unico" ${plan.tipoCobro === 'unico' ? 'selected' : ''}>Pago único</option></select></label>
        <label><span>Precio regular (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precio" value="${esc(plan.precio || '')}"></label>
        <label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-plan-field="matricula" value="${esc(plan.matricula || '')}" placeholder="Opcional"></label>
        <label class="wide"><span>Beneficios — uno por línea</span><textarea data-plan-field="beneficios">${esc(plan.beneficios.join('\n'))}</textarea></label>
        <div class="np-promo">
          <label class="np-check"><input type="checkbox" data-plan-field="promocionActiva" ${plan.promocionActiva ? 'checked' : ''}> Promoción</label>
          <label><span>Precio promocional (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precioPromocional" value="${esc(plan.precioPromocional || '')}"></label>
          <label><span>Válida hasta</span><input type="date" data-plan-field="promocionHasta" value="${esc(plan.promocionHasta)}"></label>
        </div>
        <div class="np-preview" data-plan-preview></div>
      </div>
    </div>`;
}
function readPlan(el,index){
  const get = field => el.querySelector(`[data-plan-field="${field}"]`);
  const nombre = clean(get('nombre')?.value) || ('Plan ' + (index + 1));
  return normalizePlan({
    id:slug(nombre),
    nombre,
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
function readProgram(card){
  const base = catalog.find(item => item.id === card.dataset.program) || {};
  const get = field => card.querySelector(`[data-program-field="${field}"]`);
  const planes = Array.from(card.querySelectorAll('[data-plan]')).map(readPlan);
  return {
    ...base,
    publicado:!!get('publicado')?.checked,
    fechaInicio:clean(get('fechaInicio')?.value),
    duracion:clean(get('duracion')?.value),
    descripcion:clean(get('descripcion')?.value),
    planes
  };
}
function updatePlanPreview(planEl){
  const preview = planEl.querySelector('[data-plan-preview]');
  if(!preview) return;
  const plan = readPlan(planEl,Number(planEl.dataset.planIndex || 0));
  let text = `${plan.nombre}: ${money(plan.precio)} ${plan.tipoCobro === 'mensual' ? 'mensual' : 'pago único'}`;
  if(plan.matricula > 0) text += ` · Matrícula: ${money(plan.matricula)}`;
  if(promoActive(plan)) text += ` · Promoción: ${money(plan.precioPromocional)}${plan.promocionHasta ? ' hasta ' + dateLabel(plan.promocionHasta) : ''}`;
  preview.textContent = text;
}
function validate(program){
  if(program.publicado && !program.descripcion) return 'Agrega una descripción para ' + program.nombre + '.';
  const active = program.planes.filter(plan => plan.activo);
  if(program.publicado && !active.length) return program.nombre + ' necesita por lo menos un plan activo.';
  for(const plan of active){
    if(!plan.nombre) return 'Todos los planes necesitan un nombre.';
    if(plan.precio <= 0) return 'El plan “' + plan.nombre + '” necesita un precio mayor que cero.';
    if(plan.promocionActiva && plan.precioPromocional <= 0) return 'La promoción de “' + plan.nombre + '” necesita un precio promocional.';
    if(plan.promocionActiva && plan.precioPromocional >= plan.precio) return 'La promoción de “' + plan.nombre + '” debe ser menor que el precio regular.';
  }
  return '';
}
function payload(program,isNew){
  const data = {
    nombre:program.nombre,
    ruta:program.ruta,
    orden:program.orden,
    descripcion:program.descripcion,
    publicado:program.publicado,
    fechaInicio:program.fechaInicio,
    duracion:program.duracion,
    planes:program.planes.map((plan,index) => ({...normalizePlan(plan,index),orden:index + 1})),
    moneda:'PEN',
    esquemaPrecios:2,
    actualizadoPor:currentUser?.email || ADMIN_EMAIL,
    updatedAt:serverTimestamp()
  };
  if(isNew) data.createdAt = serverTimestamp();
  return data;
}
function addPlan(programId){
  const card = document.querySelector(`[data-program="${CSS.escape(programId)}"]`);
  if(!card) return;
  const plans = card.querySelector('.np-plans');
  const index = plans.querySelectorAll('[data-plan]').length;
  plans.insertAdjacentHTML('beforeend',planHtml(programId,normalizePlan({nombre:'Nuevo plan',activo:true,tipoCobro:'mensual'},index),index));
  const added = plans.querySelector('[data-plan]:last-child');
  if(added) updatePlanPreview(added);
}
function removePlan(button){
  const plan = button.closest('[data-plan]');
  if(!plan) return;
  if(!confirm('¿Retirar este plan del ciclo? El cambio se aplicará cuando guardes.')) return;
  plan.remove();
}
async function loadCatalog(){
  if(!currentUser) return;
  const grid = document.getElementById('nostra-program-grid');
  if(!grid) return;
  grid.innerHTML = '<div>Cargando ciclos y planes...</div>';
  setMessage('info','Leyendo los precios guardados y los paneles actuales de cada ciclo...');
  try{
    const snap = await getDocs(collection(db,COLLECTION));
    const docs = snap.docs.map(item => ({id:item.id,...item.data()}));
    catalog = await mergeCatalog(docs);
    renderCatalog();
    setMessage('ok',docs.length ? 'Tarifario cargado. Revisa cada plan antes de guardar.' : 'Se importaron como base los planes que ya existen en las subpáginas.');
  }catch(error){
    console.error('No se pudo cargar el tarifario:',error);
    catalog = await mergeCatalog([]);
    renderCatalog();
    setMessage('err','Se pudieron leer los paneles actuales, pero Firebase no permitió consultar “programas_publicos”. Revisa las reglas antes de guardar.');
  }
}
async function saveOne(id){
  if(busy || !currentUser) return;
  const card = document.querySelector(`[data-program="${CSS.escape(id)}"]`);
  if(!card) return;
  const program = readProgram(card);
  const error = validate(program);
  if(error) return setMessage('err',error);
  try{
    busy = true;
    setMessage('info','Guardando ' + program.nombre + '...');
    const existing = catalog.find(item => item.id === id);
    await setDoc(doc(db,COLLECTION,id),payload(program,!existing?.updatedAt),{merge:true});
    setMessage('ok',program.nombre + ' fue guardado. Su subpágina mostrará estos precios.');
    await loadCatalog();
  }catch(errorSave){
    console.error('Error guardando programa:',errorSave);
    setMessage('err','No se pudo guardar. Firebase debe permitir escritura administrativa en “programas_publicos”.');
  }finally{ busy = false; }
}
async function saveAll(){
  if(busy || !currentUser) return;
  const programs = Array.from(document.querySelectorAll('[data-program]')).map(readProgram);
  const error = programs.map(validate).find(Boolean);
  if(error) return setMessage('err',error);
  if(!confirm('¿Guardar todos los ciclos y planes mostrados?')) return;
  try{
    busy = true;
    setMessage('info','Guardando todos los precios...');
    const batch = writeBatch(db);
    programs.forEach(program => {
      const existing = catalog.find(item => item.id === program.id);
      batch.set(doc(db,COLLECTION,program.id),payload(program,!existing?.updatedAt),{merge:true});
    });
    await batch.commit();
    setMessage('ok','Todos los precios fueron guardados correctamente.');
    await loadCatalog();
  }catch(errorSave){
    console.error('Error guardando tarifario:',errorSave);
    setMessage('err','No se pudo guardar el tarifario. Revisa las reglas de Firestore.');
  }finally{ busy = false; }
}

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL){ currentUser = null; return; }
  currentUser = user;
  ensurePanel();
  loadCatalog();
});
