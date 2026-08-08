/* ==================================================
   Grupo Nostradamus - Subacordeones financieros
   Organiza visualmente Etapas 9, 10 y 11 sin modificar datos ni operaciones.
================================================== */

let ready = false;
let observer = null;
let queued = false;

const clean = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();

function injectStyles(){
  if(document.getElementById('finance-inner-accordion-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-inner-accordion-styles';
  style.textContent = `
    .finance-inner-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0 11px;padding:9px 11px;border:1px solid #e1ecef;border-radius:14px;background:#f8fcfd}
    .finance-inner-controls span{color:#647482;font-size:9px;font-weight:800}.finance-inner-controls div{display:flex;gap:6px}.finance-inner-controls .btn{margin:0;padding:7px 10px;font-size:9px;white-space:nowrap}
    .finance-inner-stack{display:grid;gap:8px;margin-top:9px}
    .finance-inner-accordion{overflow:hidden;border:1px solid #dce9ed;border-radius:16px;background:#fbfdfe}
    .finance-inner-accordion[open]{background:#fff;box-shadow:0 8px 22px rgba(6,20,38,.04)}
    .finance-inner-accordion>summary{display:grid;grid-template-columns:minmax(180px,1fr) auto 22px;align-items:center;gap:10px;padding:11px 13px;cursor:pointer;list-style:none;user-select:none}
    .finance-inner-accordion>summary::-webkit-details-marker{display:none}
    .finance-inner-title strong{display:block;color:#061426;font-size:12px}.finance-inner-title small{display:block;margin-top:2px;color:#71808c;font-size:9px;font-weight:750;line-height:1.35}
    .finance-inner-meta{color:#075b65;font-size:9px;font-weight:900;white-space:nowrap}
    .finance-inner-chevron{display:grid;place-items:center;width:22px;height:22px;border-radius:999px;background:#eef8fa;color:#075b65;font-size:18px;font-weight:950;transition:transform .18s ease}
    .finance-inner-accordion[open] .finance-inner-chevron{transform:rotate(90deg)}
    .finance-inner-body{padding:0 11px 11px}.finance-inner-body>.nrep-panel,.finance-inner-body>.nrep-card{margin:0!important;border:0!important;box-shadow:none!important;background:transparent!important;padding:0!important}
    .finance-inner-body>.nrep-panel>h4,.finance-inner-body>.nrep-card>h4{display:none}
    .finance-inner-body>.npay-filters{margin-top:2px}
    #finance-teachers-section .nteach-sub{margin:0}.finance-inner-stack .nteach-sub>summary{padding:11px 13px}
    @media(max-width:720px){
      .finance-inner-controls{display:block}.finance-inner-controls div{display:grid;grid-template-columns:1fr 1fr;margin-top:8px}.finance-inner-controls .btn{width:100%}
      .finance-inner-accordion>summary{grid-template-columns:1fr 22px}.finance-inner-meta{grid-column:1/2}.finance-inner-chevron{grid-column:2;grid-row:1/3}
    }
  `;
  document.head.appendChild(style);
}

function createControls(section,label){
  if(!section || section.querySelector(':scope > .finance-inner-controls')) return;
  const anchor = section.querySelector(':scope > .nteach-stats, :scope > .npay-stats, :scope > .nrep-kpis');
  if(!anchor) return;
  const controls = document.createElement('div');
  controls.className = 'finance-inner-controls';
  controls.innerHTML = `
    <span>${label}</span>
    <div>
      <button type="button" class="btn btn-light" data-fin-inner-expand>Mostrar secciones</button>
      <button type="button" class="btn btn-light" data-fin-inner-collapse>Ocultar secciones</button>
    </div>`;
  anchor.insertAdjacentElement('afterend',controls);
}

function createDetails(id,title,subtitle=''){
  const details = document.createElement('details');
  details.id = id;
  details.className = 'finance-inner-accordion';
  details.innerHTML = `
    <summary>
      <span class="finance-inner-title"><strong>${title}</strong><small>${subtitle}</small></span>
      <span class="finance-inner-meta"></span>
      <span class="finance-inner-chevron" aria-hidden="true">›</span>
    </summary>
    <div class="finance-inner-body"></div>`;
  return details;
}

function ensureStack(section,id){
  let stack = document.getElementById(id);
  if(stack) return stack;
  stack = document.createElement('div');
  stack.id = id;
  stack.className = 'finance-inner-stack';
  section.appendChild(stack);
  return stack;
}

function moveInto(details,nodes){
  const body = details.querySelector('.finance-inner-body');
  nodes.filter(Boolean).forEach(node => body.appendChild(node));
}

function enhanceTeachers(){
  const section = document.getElementById('finance-teachers-section');
  if(!section) return false;
  createControls(section,'Indicadores visibles · abre solo el detalle docente que necesites.');
  const tabs = section.querySelector(':scope > .nteach-tabs');
  if(tabs){
    tabs.classList.add('finance-inner-stack');
    tabs.querySelectorAll(':scope > .nteach-sub').forEach(details => {
      details.open = false;
    });
  }
  return true;
}

function enhancePayables(){
  const section = document.getElementById('finance-payables-section');
  if(!section) return false;
  createControls(section,'Resumen visible · el listado completo permanece plegado.');
  if(!document.getElementById('finance-payables-list-accordion')){
    const filters = section.querySelector(':scope > .npay-filters');
    const message = section.querySelector(':scope > #finance-payable-message');
    const table = section.querySelector(':scope > .npay-table');
    if(filters && table){
      const details = createDetails('finance-payables-list-accordion','Obligaciones y seguimiento','Filtros, vencimientos, estados y acciones de pago');
      const controls = section.querySelector(':scope > .finance-inner-controls');
      (controls || section.querySelector(':scope > .npay-stats')).insertAdjacentElement('afterend',details);
      moveInto(details,[filters,message,table]);
    }
  }
  return true;
}

function reportPanelByTitle(section,text){
  return Array.from(section.querySelectorAll(':scope > .nrep-panel')).find(panel =>
    clean(panel.querySelector(':scope > h4')?.textContent).toLowerCase().startsWith(text.toLowerCase())
  ) || null;
}

function enhanceReports(){
  const section = document.getElementById('finance-reports-section');
  if(!section) return false;
  createControls(section,'Resumen mensual visible · análisis detallado por secciones.');
  const stack = ensureStack(section,'finance-report-inner-stack');

  if(!document.getElementById('finance-report-compare-accordion')){
    const node = section.querySelector(':scope > #finance-report-comparison');
    if(node){
      const details = createDetails('finance-report-compare-accordion','Comparación mensual','Variación frente al mes anterior');
      moveInto(details,[node]);
      stack.appendChild(details);
    }
  }

  const manager = section.querySelector(':scope > .nrep-manager');
  if(manager){
    const cards = Array.from(manager.querySelectorAll(':scope > .nrep-card'));
    if(cards[0] && !document.getElementById('finance-report-manager-accordion')){
      const details = createDetails('finance-report-manager-accordion','Resumen gerencial','Saldo, cuentas por cobrar, cuentas por pagar y posición referencial');
      moveInto(details,[cards[0]]);
      stack.appendChild(details);
    }
    if(cards[1] && !document.getElementById('finance-report-close-accordion')){
      const details = createDetails('finance-report-close-accordion','Conciliación de cierres','Cierres del mes, último cierre y diferencias');
      moveInto(details,[cards[1]]);
      stack.appendChild(details);
    }
    if(!manager.children.length) manager.remove();
  }

  if(!document.getElementById('finance-report-categories-accordion')){
    const node = section.querySelector(':scope > .nrep-grid');
    if(node){
      const details = createDetails('finance-report-categories-accordion','Ingresos y egresos por categoría','Distribución del movimiento mensual por concepto');
      moveInto(details,[node]);
      stack.appendChild(details);
    }
  }

  if(!document.getElementById('finance-report-accounts-accordion')){
    const node = reportPanelByTitle(section,'Movimiento por cuenta');
    if(node){
      const details = createDetails('finance-report-accounts-accordion','Movimiento por cuentas','Entradas, salidas, neto y operaciones por cuenta');
      moveInto(details,[node]);
      stack.appendChild(details);
    }
  }

  if(!document.getElementById('finance-report-daily-accordion')){
    const node = reportPanelByTitle(section,'Flujo diario');
    if(node){
      const details = createDetails('finance-report-daily-accordion','Flujo diario del mes','Evolución diaria de ingresos y egresos');
      moveInto(details,[node]);
      stack.appendChild(details);
    }
  }
  return true;
}

function updateMeta(){
  const set = (id,text) => {
    const node = document.querySelector(`#${id} .finance-inner-meta`);
    if(node && node.textContent !== text) node.textContent = text;
  };
  const payableCount = clean(document.getElementById('finance-payable-count')?.textContent) || '0';
  const payablePending = clean(document.getElementById('finance-payable-pending')?.textContent) || 'S/ 0.00';
  set('finance-payables-list-accordion',`${payableCount} abiertas · ${payablePending}`);

  const compare = clean(document.getElementById('finance-report-title')?.textContent) || 'Mes actual';
  set('finance-report-compare-accordion',compare);
  const receivable = clean(document.getElementById('finance-report-receivable')?.textContent) || 'S/ 0.00';
  const payable = clean(document.getElementById('finance-report-payable')?.textContent) || 'S/ 0.00';
  set('finance-report-manager-accordion',`CxC ${receivable} · CxP ${payable}`);
  const closures = clean(document.getElementById('finance-report-closures')?.textContent) || '0';
  set('finance-report-close-accordion',`${closures} cierres`);
  const income = clean(document.getElementById('finance-report-income')?.textContent) || 'S/ 0.00';
  const expense = clean(document.getElementById('finance-report-expense')?.textContent) || 'S/ 0.00';
  set('finance-report-categories-accordion',`Ingresos ${income} · Egresos ${expense}`);
}

function openAll(section,open){
  section.querySelectorAll('.finance-inner-accordion, .nteach-sub').forEach(details => {
    details.open = open;
  });
}

function bindEvents(){
  if(ready) return;
  ready = true;
  document.addEventListener('click',event => {
    const expand = event.target.closest('[data-fin-inner-expand]');
    const collapse = event.target.closest('[data-fin-inner-collapse]');
    if(expand || collapse){
      const section = event.target.closest('#finance-teachers-section,#finance-payables-section,#finance-reports-section');
      if(section) openAll(section,Boolean(expand));
    }
  });
  document.addEventListener('change',event => {
    if(event.target.matches('#finance-payable-search,#finance-payable-type,#finance-payable-category,#finance-payable-status')){
      const details = document.getElementById('finance-payables-list-accordion');
      if(details) details.open = true;
    }
  },true);
}

function enhance(){
  injectStyles();
  const a = enhanceTeachers();
  const b = enhancePayables();
  const c = enhanceReports();
  bindEvents();
  updateMeta();
  return a && b && c;
}

function queue(){
  if(queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    enhance();
  });
}

function initialize(){
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if(enhance() || attempts > 100) clearInterval(timer);
  },200);
  const panel = document.getElementById('nostra-finance-panel') || document.body;
  observer = new MutationObserver(queue);
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
