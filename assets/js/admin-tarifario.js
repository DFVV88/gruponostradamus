/* ==================================================
   Grupo Nostradamus - Tarifario central por productos y planes
   Administra un producto a la vez: precios, horarios y promociones.
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
const PROGRAMS = [
  {id:'nostra-360-uni',nombre:'Nostra 360 UNI',ruta:'ciclo-anual-uni.html',orden:1,descripcion:'Preparación integral desde las bases hasta el nivel de admisión UNI.'},
  {id:'nostra-power-uni',nombre:'Nostra Power UNI',ruta:'ciclo-semianual-uni.html',orden:2,descripcion:'Corrección de debilidades y transformación del rendimiento.'},
  {id:'nostra-elite-uni',nombre:'Nostra Élite UNI',ruta:'ciclo-semestral-uni.html',orden:3,descripcion:'Perfeccionamiento para postulantes competitivos que estuvieron cerca de ingresar.'},
  {id:'nostra-prime-uni',nombre:'Nostra Prime UNI',ruta:'ciclo-repaso-uni.html',orden:4,descripcion:'Preparación decisiva para la etapa final del examen UNI.'},
  {id:'nostra-talentum-uni',nombre:'Nostra Talentum UNI',ruta:'ciclo-elite-uni.html',orden:5,descripcion:'Programa especial de alto rendimiento y máxima exigencia.'},
  {id:'ciclo-ien',nombre:'IEN UNI',ruta:'ciclo-ien.html',orden:6,descripcion:'Preparación académica progresiva para el Ingreso Escolar Nacional de la UNI.'},
  {id:'proyecto-escolar',nombre:'Proyecto Escolar',ruta:'ciclo-proyecto-escolar.html',orden:7,descripcion:'Refuerzo, nivelación y formación escolar con acompañamiento continuo.'},
  {id:'paralelo-cepre-uni',nombre:'Paralelo CEPRE UNI',ruta:'ciclo-paralelo-cepre-uni.html',orden:8,descripcion:'Acompañamiento estratégico para estudiantes de CEPRE UNI.'},
  {id:'ciclo-verano-uni',nombre:'Ciclo Verano UNI',ruta:'ciclo-verano-uni.html',orden:9,descripcion:'Programa intensivo de vacaciones para avanzar y fortalecer bases.'}
];

const MORNING_SCHEDULE = ['Lunes a Sábado','8:00 a.m. a 1:00 p.m.'];
const FULL_SCHEDULE = ['Lunes a Viernes','8:00 a.m. a 6:00 p.m.','Sábados','8:00 a.m. a 1:00 p.m.'];
const AFTERNOON_SCHEDULE = ['Lunes a Sábado','2:00 p.m. a 7:00 p.m.'];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let catalog = [];
let currentUser = null;
let selectedProgramId = '';
let busy = false;

function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
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
function slug(value){
  return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'plan';
}
function lineList(value,fallback,max){
  const list = Array.isArray(value) ? value : String(value == null ? '' : value).split(/\r?\n/);
  const normalized = list.map(clean).filter(Boolean).slice(0,max || 8);
  return normalized.length ? normalized : [...(fallback || [])];
}
function scheduleFallback(name){
  const normalized = clean(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(normalized.includes('full') || normalized.includes('unico')) return [...FULL_SCHEDULE];
  if(normalized.includes('tarde')) return [...AFTERNOON_SCHEDULE];
  if(normalized.includes('manana')) return [...MORNING_SCHEDULE];
  return ['Horario por confirmar'];
}
function dateLabel(value){
  if(!value) return '';
  const date = new Date(value + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE');
}
function promoActive(plan){
  if(plan.promocionActiva !== true || num(plan.precioPromocional) <= 0) return false;
  if(!plan.promocionHasta) return true;
  const end = new Date(plan.promocionHasta + 'T23:59:59');
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}
function normalizePlan(plan,index){
  const nombre = clean(plan?.nombre || plan?.titulo || ('Plan ' + (index + 1)));
  return {
    id:clean(plan?.id) || slug(nombre),
    nombre,
    activo:plan?.activo !== false,
    destacado:plan?.destacado === true,
    tipoCobro:plan?.tipoCobro === 'unico' ? 'unico' : 'mensual',
    precio:num(plan?.precio ?? plan?.pension ?? plan?.pagoUnico),
    matricula:num(plan?.matricula),
    horarioLineas:lineList(plan?.horarioLineas,scheduleFallback(nombre),6),
    beneficios:lineList(plan?.beneficios,[],8),
    promocionActiva:plan?.promocionActiva === true,
    precioPromocional:num(plan?.precioPromocional),
    promocionHasta:clean(plan?.promocionHasta)
  };
}
function legacyPlan(item){
  const price = num(item?.pension) || num(item?.pagoUnico);
  if(!price && !num(item?.matricula)) return [];
  return [normalizePlan({
    id:'plan-general',nombre:'Plan general',tipoCobro:num(item?.pagoUnico) > 0 ? 'unico' : 'mensual',
    precio:price,matricula:item?.matricula,activo:item?.publicado === true,
    promocionActiva:item?.promocionActiva,precioPromocional:item?.precioPromocional,
    promocionHasta:item?.promocionHasta,beneficios:[],horarioLineas:['Horario por confirmar']
  },0)];
}
function parseAmount(text){
  const normalized = clean(text).replace(/\s/g,'').replace(',','.');
  const match = normalized.match(/(?:S\/\.?|S\/)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  return match ? num(match[1]) : 0;
}
function pricingSection(root){
  return Array.from(root.querySelectorAll('section')).find(section => {
    const title = clean(section.querySelector('.title-area .sec-title')?.textContent).toLowerCase();
    const subtitle = clean(section.querySelector('.title-area .sub-title')?.textContent).toLowerCase();
    return section.querySelectorAll('.price-card').length > 0 &&
      (title.includes('nuestros planes para tu futuro') || subtitle.includes('precios academicos') || subtitle.includes('precios académicos'));
  }) || null;
}
function extractScheduleMap(root){
  const result = [];
  const pane = root.querySelector('#Coursedescription');
  if(!pane) return result;
  Array.from(pane.querySelectorAll('.price-card')).forEach(card => {
    if(card.querySelector('.price-card_content')) return;
    const title = clean(card.querySelector('.price-card_title')?.textContent);
    const lines = [];
    const price = card.querySelector('.price-card_price');
    if(price){
      const clone = price.cloneNode(true);
      clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      clone.querySelectorAll('.horario-ciclo,span,h4').forEach(node => {
        const text = clean(node.textContent);
        if(text) lines.push(text.replace(/^\(|\)$/g,''));
      });
      const raw = clone.textContent.split(/\n+/).map(clean).filter(Boolean);
      raw.forEach(line => { if(!lines.includes(line)) lines.push(line.replace(/^\(|\)$/g,'')); });
    }
    if(title && lines.length) result.push({title,lines:lines.slice(0,6)});
  });
  return result;
}
function scheduleForPlan(name,index,map){
  const normalized = clean(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let found = null;
  if(normalized.includes('full') || normalized.includes('unico')){
    found = map.find(item => /full|unico/i.test(item.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  }else if(normalized.includes('manana')){
    found = map.find(item => /manana/i.test(item.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  }else if(normalized.includes('tarde')){
    found = map.find(item => /tarde/i.test(item.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  }
  if(!found && map[index]) found = map[index];
  return found ? found.lines : scheduleFallback(name);
}
async function scrapePlans(program){
  try{
    const response = await fetch(program.ruta,{cache:'no-store'});
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html,'text/html');
    const section = pricingSection(parsed);
    if(!section) return [];
    const scheduleMap = extractScheduleMap(parsed);
    return Array.from(section.querySelectorAll('.price-card')).map((card,index) => {
      const nombre = clean(card.querySelector('.price-card_title')?.textContent) || ('Plan ' + (index + 1));
      const duration = clean(card.querySelector('.duration')?.textContent).toLowerCase();
      return normalizePlan({
        id:slug(nombre),nombre,activo:true,destacado:card.classList.contains('active'),
        tipoCobro:duration.includes('mensual') ? 'mensual' : 'unico',
        precio:parseAmount(card.querySelector('.price-card_price')?.textContent),
        horarioLineas:scheduleForPlan(nombre,index,scheduleMap),
        beneficios:Array.from(card.querySelectorAll('.checklist li')).map(li => clean(li.textContent))
      },index);
    }).filter(plan => plan.nombre && plan.precio > 0);
  }catch(error){
    console.warn('No se pudieron leer planes de ' + program.ruta,error);
    return [];
  }
}
async function mergeCatalog(remoteDocs){
  const remoteMap = new Map(remoteDocs.map(item => [item.id,item]));
  return Promise.all(PROGRAMS.map(async program => {
    const remote = remoteMap.get(program.id) || {};
    let planes = Array.isArray(remote.planes) ? remote.planes.map(normalizePlan) : legacyPlan(remote);
    if(!planes.length) planes = await scrapePlans(program);
    return {
      ...program,...remote,id:program.id,nombre:program.nombre,ruta:program.ruta,orden:program.orden,
      descripcion:clean(remote.descripcion || program.descripcion),publicado:remote.publicado !== false,
      fechaInicio:clean(remote.fechaInicio),duracion:clean(remote.duracion),planes
    };
  }));
}

function addStyles(){
  if(document.getElementById('nostra-admin-tarifario-all-style')) return;
  const style = document.createElement('style');
  style.id = 'nostra-admin-tarifario-all-style';
  style.textContent = `
    #nostra-pricing-admin-panel{margin:0;background:#fff}
    .np-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
    .np-head h2{font-family:'Baloo 2';font-size:34px;line-height:1;color:#061426;margin:0 0 6px}
    .np-head p{margin:0;color:#4b5d70;font-size:14px;line-height:1.5}
    .np-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .np-selector-wrap{display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:10px;align-items:end;padding:14px;border:1px solid #dce9ed;border-radius:17px;background:#f7fbfc;margin-bottom:13px}
    .np-selector-wrap label span{display:block;font-size:10px;font-weight:950;color:#061426;text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px}
    .np-selector-wrap select{width:100%;padding:11px 12px;border:1px solid #cfe1e5;border-radius:12px;background:#fff;font:inherit;color:#172033;font-weight:800}
    .np-product-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;color:#607080;font-size:12px;font-weight:800}
    .np-product-meta span{padding:6px 9px;border-radius:999px;background:#eef8fa;color:#075b65}
    .np-help{padding:12px 14px;border-radius:14px;background:#fff8e8;border:1px solid rgba(255,148,30,.28);color:#6a4700;font-size:12px;font-weight:800;line-height:1.5;margin-bottom:12px}
    .np-program{border:1px solid rgba(7,140,149,.18);border-radius:20px;padding:17px;background:#fff}
    .np-program-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .np-program-head h3{font-family:'Baloo 2';font-size:28px;line-height:1;color:#061426;margin:0 0 4px}
    .np-program-head small{color:#607080;font-weight:750}
    .np-program-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .np-check{display:flex!important;align-items:center;gap:7px;font-weight:900;color:#075b65;white-space:nowrap}
    .np-check input{width:auto!important}
    .np-general{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:13px 0}
    .np-general .wide{grid-column:1/-1}
    .np-program label span,.np-plan label span{display:block;font-size:10px;font-weight:950;color:#061426;margin:0 0 5px;text-transform:uppercase;letter-spacing:.3px}
    .np-program input,.np-program select,.np-program textarea{width:100%;border:1px solid #d7e7eb;border-radius:11px;padding:10px 11px;font:inherit;color:#172033;background:#fff}
    .np-program textarea{min-height:78px;resize:vertical}
    .np-plans{display:grid;gap:9px;margin-top:12px}
    .np-plan{border:1px solid #dcecef;border-radius:16px;padding:13px;background:#f9fdfe}
    .np-plan-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .np-plan-title{font-weight:950;color:#061426}
    .np-plan-grid{display:grid;grid-template-columns:1.2fr .75fr .75fr .75fr;gap:9px}
    .np-plan-grid .wide{grid-column:1/-1}
    .np-schedule textarea{min-height:105px}
    .np-schedule small{display:block;margin-top:5px;color:#667885;font-size:11px;font-weight:700;text-transform:none;letter-spacing:0}
    .np-promo{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr 1fr;gap:9px;align-items:end;padding:10px;border-radius:14px;background:#fff8e8;border:1px solid rgba(255,148,30,.25)}
    .np-preview{grid-column:1/-1;border-radius:13px;padding:10px 12px;background:#eef8fa;color:#075b65;font-size:12px;font-weight:850;line-height:1.45}
    .np-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px}
    .np-status{font-size:12px;color:#657584;font-weight:800}
    .np-remove{border:0;background:#fff2f2;color:#b42318;border-radius:999px;padding:7px 10px;font-weight:900;cursor:pointer}
    @media(max-width:900px){.np-selector-wrap{grid-template-columns:1fr}.np-head,.np-program-head,.np-footer{display:block}.np-actions,.np-program-tools{justify-content:flex-start;margin-top:10px}.np-plan-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:620px){.np-general,.np-plan-grid,.np-promo{grid-template-columns:1fr}.np-general .wide,.np-plan-grid .wide{grid-column:auto}}
  `;
  document.head.appendChild(style);
}
function setMessage(type,text){
  const element = document.getElementById('nostra-pricing-message');
  if(!element) return;
  element.className = 'msg ' + type;
  element.innerHTML = text;
}
function formatDate(value){
  if(!value) return 'sin guardar';
  try{
    const date = value.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? 'sin fecha' : date.toLocaleString('es-PE');
  }catch(_){ return 'sin fecha'; }
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
      <div><h2>Ciclos y planes</h2><p>Selecciona un producto y edita únicamente sus planes, precios, promociones, horarios y beneficios.</p></div>
      <div class="np-actions"><button class="btn btn-blue" id="nostra-pricing-reload">Actualizar</button></div>
    </div>
    <div class="np-selector-wrap">
      <label><span>Producto académico</span><select id="nostra-program-selector"><option value="">Cargando productos...</option></select></label>
      <div class="np-product-meta" id="nostra-product-meta"></div>
    </div>
    <div class="np-help"><b>Edición segura:</b> guarda un producto a la vez. Los precios públicos solo cambiarán después de pulsar el botón Guardar del producto seleccionado.</div>
    <div class="msg" id="nostra-pricing-message"></div>
    <div id="nostra-program-grid"><div>Cargando ciclos y planes...</div></div>`;
  const hero = admin.querySelector('.hero');
  if(hero) hero.insertAdjacentElement('afterend',panel);
  else admin.insertBefore(panel,admin.firstChild);
  document.getElementById('nostra-pricing-reload').addEventListener('click',loadCatalog);
  document.getElementById('nostra-program-selector').addEventListener('change',event => {
    selectedProgramId = event.target.value;
    try{ localStorage.setItem('nostraPricingProgram',selectedProgramId); }catch(_){ /* sin almacenamiento */ }
    renderSelectedProgram();
  });
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
function populateSelector(){
  const select = document.getElementById('nostra-program-selector');
  if(!select) return;
  const remembered = (() => { try{return localStorage.getItem('nostraPricingProgram') || '';}catch(_){return '';} })();
  if(!selectedProgramId) selectedProgramId = catalog.some(item => item.id === remembered) ? remembered : (catalog[0]?.id || '');
  select.innerHTML = catalog.map(program => '<option value="' + esc(program.id) + '">' + esc(program.nombre) + '</option>').join('');
  select.value = selectedProgramId;
}
function updateProductMeta(program){
  const meta = document.getElementById('nostra-product-meta');
  if(!meta) return;
  const active = program.planes.filter(plan => plan.activo !== false).length;
  const promos = program.planes.filter(promoActive).length;
  meta.innerHTML = '<span>' + active + ' planes activos</span>' + (promos ? '<span>' + promos + ' promociones</span>' : '') + '<span>' + esc(program.ruta) + '</span>';
}
function renderSelectedProgram(){
  const grid = document.getElementById('nostra-program-grid');
  if(!grid) return;
  const program = catalog.find(item => item.id === selectedProgramId) || catalog[0];
  if(!program){ grid.innerHTML = '<div class="np-help">No se encontraron productos.</div>'; return; }
  selectedProgramId = program.id;
  updateProductMeta(program);
  grid.innerHTML = programHtml(program);
  grid.querySelectorAll('[data-plan]').forEach(updatePlanPreview);
}
function programHtml(program){
  return `
    <article class="np-program" data-program="${esc(program.id)}">
      <div class="np-program-head">
        <div><h3>${esc(program.nombre)}</h3><small>${esc(program.ruta)}</small></div>
        <div class="np-program-tools">
          <label class="np-check"><input type="checkbox" data-program-field="publicado" ${program.publicado ? 'checked' : ''}> Producto publicado</label>
          <a class="mini" href="${esc(program.ruta)}" target="_blank" rel="noopener">Ver página</a>
        </div>
      </div>
      <div class="np-general">
        <label><span>Fecha de inicio</span><input type="date" data-program-field="fechaInicio" value="${esc(program.fechaInicio)}"></label>
        <label><span>Duración / información general</span><input data-program-field="duracion" value="${esc(program.duracion)}" placeholder="Ej. 5 meses"></label>
        <label class="wide"><span>Descripción comercial</span><textarea data-program-field="descripcion">${esc(program.descripcion)}</textarea></label>
      </div>
      <div class="np-plans">${program.planes.length ? program.planes.map((plan,index) => planHtml(program.id,plan,index)).join('') : '<div class="np-help">No se encontraron planes. Agrega el primero manualmente.</div>'}</div>
      <div class="np-footer">
        <span class="np-status">Última edición: ${esc(formatDate(program.updatedAt))}</span>
        <div><button class="btn btn-light" type="button" data-add-plan="${esc(program.id)}">+ Agregar plan</button> <button class="btn btn-primary" type="button" data-save-program="${esc(program.id)}">Guardar ${esc(program.nombre)}</button></div>
      </div>
    </article>`;
}
function planHtml(programId,plan,index){
  const p = normalizePlan(plan,index);
  return `
    <div class="np-plan" data-plan data-program-id="${esc(programId)}" data-plan-index="${index}" data-fixed-plan-id="${esc(p.id)}">
      <div class="np-plan-top">
        <span class="np-plan-title">Plan ${index + 1}</span>
        <div>
          <label class="np-check" style="display:inline-flex!important"><input type="checkbox" data-plan-field="activo" ${p.activo ? 'checked' : ''}> Activo</label>
          <label class="np-check" style="display:inline-flex!important;margin-left:9px"><input type="checkbox" data-plan-field="destacado" ${p.destacado ? 'checked' : ''}> Destacado</label>
          <button class="np-remove" type="button" data-remove-plan>Retirar</button>
        </div>
      </div>
      <div class="np-plan-grid">
        <label><span>Nombre del plan</span><input data-plan-field="nombre" value="${esc(p.nombre)}"></label>
        <label><span>Tipo de cobro</span><select data-plan-field="tipoCobro"><option value="mensual" ${p.tipoCobro === 'mensual' ? 'selected' : ''}>Mensual</option><option value="unico" ${p.tipoCobro === 'unico' ? 'selected' : ''}>Pago único</option></select></label>
        <label><span>Precio regular (S/)</span><input type="number" min="0" step="0.01" data-plan-field="precio" value="${p.precio || ''}"></label>
        <label><span>Matrícula (S/)</span><input type="number" min="0" step="0.01" data-plan-field="matricula" value="${p.matricula || ''}" placeholder="Opcional"></label>
        <label class="wide np-schedule"><span>Horario del plan — una línea por dato</span><textarea data-plan-field="horarioLineas">${esc(p.horarioLineas.join('\n'))}</textarea><small>Se mostrará dentro de la tarjeta pública del plan.</small></label>
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
  const get = field => element.querySelector('[data-plan-field="' + field + '"]');
  const nombre = clean(get('nombre')?.value) || ('Plan ' + (index + 1));
  return normalizePlan({
    id:element.dataset.fixedPlanId || slug(nombre),nombre,
    activo:!!get('activo')?.checked,destacado:!!get('destacado')?.checked,
    tipoCobro:get('tipoCobro')?.value,precio:get('precio')?.value,matricula:get('matricula')?.value,
    horarioLineas:get('horarioLineas')?.value,beneficios:get('beneficios')?.value,
    promocionActiva:!!get('promocionActiva')?.checked,
    precioPromocional:get('precioPromocional')?.value,promocionHasta:get('promocionHasta')?.value
  },index);
}
function readProgram(card){
  const base = catalog.find(item => item.id === card.dataset.program) || {};
  const get = field => card.querySelector('[data-program-field="' + field + '"]');
  return {
    ...base,publicado:!!get('publicado')?.checked,fechaInicio:clean(get('fechaInicio')?.value),
    duracion:clean(get('duracion')?.value),descripcion:clean(get('descripcion')?.value),
    planes:Array.from(card.querySelectorAll('[data-plan]')).map(readPlan)
  };
}
function updatePlanPreview(element){
  const preview = element.querySelector('[data-plan-preview]');
  if(!preview) return;
  const plan = readPlan(element,Number(element.dataset.planIndex || 0));
  let text = plan.nombre + ': ' + money(plan.precio) + ' ' + (plan.tipoCobro === 'mensual' ? 'mensual' : 'pago único');
  if(plan.matricula > 0) text += ' · Matrícula: ' + money(plan.matricula);
  if(plan.horarioLineas.length) text += ' · Horario: ' + plan.horarioLineas.join(' / ');
  if(promoActive(plan)) text += ' · Promoción: ' + money(plan.precioPromocional) + (plan.promocionHasta ? ' hasta ' + dateLabel(plan.promocionHasta) : '');
  preview.textContent = text;
}
function validate(program){
  if(program.publicado && !program.descripcion) return 'Agrega una descripción para ' + program.nombre + '.';
  const active = program.planes.filter(plan => plan.activo);
  if(program.publicado && !active.length) return program.nombre + ' necesita por lo menos un plan activo.';
  for(const plan of active){
    if(!plan.nombre) return 'Todos los planes necesitan un nombre.';
    if(plan.precio <= 0) return 'El plan “' + plan.nombre + '” necesita un precio mayor que cero.';
    if(!plan.horarioLineas.length) return 'Agrega el horario del plan “' + plan.nombre + '”.';
    if(plan.promocionActiva && plan.precioPromocional <= 0) return 'La promoción de “' + plan.nombre + '” necesita un precio promocional.';
    if(plan.promocionActiva && plan.precioPromocional >= plan.precio) return 'La promoción de “' + plan.nombre + '” debe ser menor que el precio regular.';
    if(plan.promocionActiva && !plan.promocionHasta) return 'Indica la fecha final de la promoción de “' + plan.nombre + '”.';
  }
  return '';
}
function payload(program,isNew){
  const data = {
    nombre:program.nombre,ruta:program.ruta,orden:program.orden,descripcion:program.descripcion,
    publicado:program.publicado,fechaInicio:program.fechaInicio,duracion:program.duracion,
    planes:program.planes.map((plan,index) => ({...normalizePlan(plan,index),orden:index + 1})),
    moneda:'PEN',esquemaPrecios:3,actualizadoPor:currentUser?.email || ADMIN_EMAIL,updatedAt:serverTimestamp()
  };
  if(isNew) data.createdAt = serverTimestamp();
  return data;
}
function addPlan(programId){
  const card = document.querySelector('[data-program="' + CSS.escape(programId) + '"]');
  if(!card) return;
  const host = card.querySelector('.np-plans');
  const index = host.querySelectorAll('[data-plan]').length;
  host.insertAdjacentHTML('beforeend',planHtml(programId,normalizePlan({nombre:'Nuevo plan',activo:true,precio:0,horarioLineas:['Horario por confirmar']},index),index));
  const added = host.querySelector('[data-plan]:last-child');
  if(added) updatePlanPreview(added);
}
function removePlan(button){
  const plan = button.closest('[data-plan]');
  if(!plan) return;
  if(!confirm('¿Retirar este plan? El cambio se aplicará cuando guardes el producto.')) return;
  plan.remove();
}
async function loadCatalog(){
  if(!currentUser) return;
  const grid = document.getElementById('nostra-program-grid');
  if(grid) grid.innerHTML = '<div>Cargando ciclos y planes...</div>';
  setMessage('info','Leyendo los tarifarios guardados y las páginas actuales...');
  try{
    const snapshot = await getDocs(collection(db,COLLECTION));
    const docs = snapshot.docs.map(item => ({id:item.id,...item.data()}));
    catalog = await mergeCatalog(docs);
    populateSelector();
    renderSelectedProgram();
    setMessage('ok','Tarifarios cargados. Selecciona un producto, revisa sus planes y guarda únicamente cuando estén correctos.');
  }catch(error){
    console.error('No se pudo cargar el tarifario:',error);
    catalog = await mergeCatalog([]);
    populateSelector();
    renderSelectedProgram();
    setMessage('err','Se cargaron los planes actuales de las páginas, pero Firebase no permitió consultar todos los tarifarios.');
  }
}
async function saveOne(id){
  if(busy || !currentUser) return;
  const card = document.querySelector('[data-program="' + CSS.escape(id) + '"]');
  if(!card) return;
  const program = readProgram(card);
  const error = validate(program);
  if(error) return setMessage('err',error);
  if(!confirm('¿Guardar los planes, precios y horarios de ' + program.nombre + '?')) return;
  const button = card.querySelector('[data-save-program]');
  try{
    busy = true;
    if(button){ button.disabled = true; button.textContent = 'Guardando...'; }
    setMessage('info','Guardando ' + program.nombre + '...');
    const existing = catalog.find(item => item.id === id);
    await setDoc(doc(db,COLLECTION,id),payload(program,!existing?.updatedAt),{merge:true});
    setMessage('ok','✅ ' + program.nombre + ' fue guardado. Su página pública mostrará estos datos.');
    await loadCatalog();
  }catch(errorSave){
    console.error('Error guardando programa:',errorSave);
    setMessage('err',errorSave?.code === 'permission-denied'
      ? 'Firebase todavía no permite modificar este producto. Debes ampliar la regla de programas_publicos.'
      : 'No se pudo guardar. Revisa la conexión e intenta nuevamente.');
  }finally{
    busy = false;
    if(button){ button.disabled = false; button.textContent = 'Guardar ' + program.nombre; }
  }
}

onAuthStateChanged(auth,user => {
  const email = String(user?.email || '').toLowerCase();
  if(!user || email !== ADMIN_EMAIL){ currentUser = null; return; }
  currentUser = user;
  ensurePanel();
  loadCatalog();
});