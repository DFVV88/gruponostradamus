/* ==================================================
   Grupo Nostradamus - Acordeón de cuentas por cobrar
   Reorganiza la interfaz sin modificar cálculos, cuotas ni pagos.
================================================== */

let initialized = false;
let observer = null;

function createAccordion(id,title,subtitle,open = false){
  const details = document.createElement('details');
  details.id = id;
  details.className = 'rc-accordion';
  details.open = open;
  details.innerHTML = `
    <summary>
      <span class="rc-accordion-title">${title}</span>
      <small class="rc-accordion-subtitle">${subtitle}</small>
      <span class="rc-accordion-chevron" aria-hidden="true">›</span>
    </summary>
    <div class="rc-accordion-body"></div>`;
  return details;
}

function injectStyles(){
  if(document.getElementById('receivables-accordion-styles')) return;
  const style = document.createElement('style');
  style.id = 'receivables-accordion-styles';
  style.textContent = `
    .rc-head-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
    .rc-head-actions .btn{margin:0}
    .rc-accordion-stack{display:grid;gap:9px;margin-top:12px}
    .rc-accordion{overflow:hidden;border:1px solid #dce9ed;border-radius:16px;background:#fbfdfe}
    .rc-accordion[open]{background:#fff;box-shadow:0 8px 22px rgba(6,20,38,.045)}
    .rc-accordion>summary{display:grid;grid-template-columns:minmax(180px,1fr) minmax(160px,auto) 24px;align-items:center;gap:12px;padding:13px 15px;cursor:pointer;list-style:none;user-select:none}
    .rc-accordion>summary::-webkit-details-marker{display:none}
    .rc-accordion-title{color:#061426;font-family:'Baloo 2';font-size:19px;font-weight:800;line-height:1.05}
    .rc-accordion-subtitle{color:#647482;font-size:10px;font-weight:750;text-align:right;line-height:1.35}
    .rc-accordion-chevron{display:grid;place-items:center;width:23px;height:23px;border-radius:999px;background:#eef8fa;color:#075b65;font-size:20px;font-weight:900;transform:rotate(0deg);transition:transform .18s ease}
    .rc-accordion[open] .rc-accordion-chevron{transform:rotate(90deg)}
    .rc-accordion-body{padding:0 14px 14px}
    .rc-accordion-body>.rc-stats,.rc-accordion-body>.rc-groups{margin-bottom:0}
    .rc-accordion-body>.rc-group-title{margin-top:0}
    .rc-shortcut{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px;border:1px dashed #cfe1e6;border-radius:14px;background:#f8fcfd}
    .rc-shortcut div{color:#526170;font-size:11px;line-height:1.5}
    .rc-shortcut strong{display:block;margin-bottom:3px;color:#061426;font-size:13px}
    .rc-shortcut .btn{flex:0 0 auto;padding:8px 12px;font-size:10px;white-space:nowrap}
    #rc-accordion-list .rc-filters{margin-top:2px}
    #rc-accordion-list #receivables-message{margin-bottom:11px}
    @media(max-width:760px){
      .rc-head-actions{display:grid;grid-template-columns:1fr 1fr;margin-top:10px}
      .rc-head-actions #receivables-refresh{grid-column:1/-1}
      .rc-head-actions .btn{width:100%}
      .rc-accordion>summary{grid-template-columns:1fr 24px;gap:6px 10px}
      .rc-accordion-subtitle{grid-column:1/2;text-align:left}
      .rc-accordion-chevron{grid-column:2;grid-row:1/3}
      .rc-shortcut{display:block}
      .rc-shortcut .btn{width:100%;margin-top:10px}
    }
  `;
  document.head.appendChild(style);
}

function moveInto(details,nodes){
  const body = details.querySelector('.rc-accordion-body');
  nodes.filter(Boolean).forEach(node => body.appendChild(node));
}

function setText(selector,text){
  const element = document.querySelector(selector);
  if(element && element.textContent !== text) element.textContent = text;
}

function visibleRows(){
  return Array.from(document.querySelectorAll('#receivables-rows tr')).filter(row =>
    row.querySelector('[data-receivables-open]')
  );
}

function updateSummaries(){
  const programmed = document.getElementById('receivables-programmed')?.textContent || 'S/ 0.00';
  const overdue = document.getElementById('receivables-overdue')?.textContent || 'S/ 0.00';
  const upcoming = document.getElementById('receivables-upcoming')?.textContent || 'S/ 0.00';
  const debtors = document.getElementById('receivables-students')?.textContent || '0';
  const roomCount = document.querySelectorAll('#receivables-groups [data-receivables-group]').length;
  const rows = visibleRows();
  const noSchedule = rows.filter(row => row.querySelector('.rc-status.sin_cronograma')).length;
  const upcomingRows = rows.filter(row => row.querySelector('.rc-status.proximo')).length;

  setText('#rc-accordion-summary .rc-accordion-subtitle',`${programmed} programado · ${overdue} vencido · ${debtors} alumnos con deuda`);
  setText('#rc-accordion-groups .rc-accordion-subtitle',`${roomCount} salón${roomCount === 1 ? '' : 'es'} · selecciona uno para filtrar`);
  setText('#rc-accordion-upcoming .rc-accordion-subtitle',`${upcoming} por vencer en los próximos 7 días`);
  setText('#rc-accordion-no-schedule .rc-accordion-subtitle',`${noSchedule} visible${noSchedule === 1 ? '' : 's'} con el filtro actual`);
  setText('#rc-accordion-list .rc-accordion-subtitle',`${rows.length} alumno${rows.length === 1 ? '' : 's'} visible${rows.length === 1 ? '' : 's'}`);
  setText('#rc-upcoming-shortcut-text',`${upcomingRows} alumno${upcomingRows === 1 ? '' : 's'} próximo${upcomingRows === 1 ? '' : 's'} a vencer en la vista actual.`);
  setText('#rc-no-schedule-shortcut-text',`${noSchedule} alumno${noSchedule === 1 ? '' : 's'} sin cronograma en la vista actual.`);
}

function applyStatusShortcut(status){
  const select = document.getElementById('receivables-status');
  if(!select) return;
  select.value = status;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  const list = document.getElementById('rc-accordion-list');
  if(list) list.open = true;
  window.setTimeout(() => {
    updateSummaries();
    list?.scrollIntoView({behavior:'smooth',block:'start'});
  },60);
}

function bindEvents(panel){
  panel.addEventListener('click',event => {
    const shortcut = event.target.closest('[data-rc-status-shortcut]');
    if(shortcut){
      applyStatusShortcut(shortcut.dataset.rcStatusShortcut || '');
      return;
    }
    if(event.target.closest('#receivables-collapse-all')){
      panel.querySelectorAll('.rc-accordion').forEach(details => { details.open = false; });
      return;
    }
    if(event.target.closest('#receivables-expand-all')){
      panel.querySelectorAll('.rc-accordion').forEach(details => { details.open = true; });
      return;
    }
    if(event.target.closest('#receivables-groups [data-receivables-group]')){
      const list = document.getElementById('rc-accordion-list');
      if(list) list.open = true;
    }
  });

  panel.addEventListener('toggle',event => {
    if(event.target.matches('.rc-accordion')) updateSummaries();
  },true);
}

function build(){
  if(initialized) return true;
  const panel = document.getElementById('receivables-panel');
  if(!panel) return false;

  const head = panel.querySelector('.rc-head');
  const refresh = document.getElementById('receivables-refresh');
  const stats = panel.querySelector('.rc-stats');
  const groupTitle = panel.querySelector('.rc-group-title');
  const groupCards = document.getElementById('receivables-groups');
  const filters = panel.querySelector('.rc-filters');
  const message = document.getElementById('receivables-message');
  const table = panel.querySelector('.rc-table');
  if(!head || !stats || !groupCards || !filters || !message || !table) return false;

  injectStyles();

  let actions = head.querySelector('.rc-head-actions');
  if(!actions){
    actions = document.createElement('div');
    actions.className = 'rc-head-actions';
    if(refresh) actions.appendChild(refresh);
    actions.insertAdjacentHTML('beforeend',`
      <button type="button" class="btn btn-light" id="receivables-expand-all">Abrir secciones</button>
      <button type="button" class="btn btn-light" id="receivables-collapse-all">Cerrar secciones</button>`);
    head.appendChild(actions);
  }

  const stack = document.createElement('div');
  stack.className = 'rc-accordion-stack';
  stack.id = 'receivables-accordion-stack';

  const summary = createAccordion('rc-accordion-summary','Resumen de cobranza','Indicadores generales',true);
  const rooms = createAccordion('rc-accordion-groups','Deuda por salón','Salones y saldos pendientes');
  const upcoming = createAccordion('rc-accordion-upcoming','Próximos vencimientos','Cuotas que vencen en 7 días');
  const noSchedule = createAccordion('rc-accordion-no-schedule','Alumnos sin cronograma','Matriculados que todavía no tienen cuotas');
  const list = createAccordion('rc-accordion-list','Lista de alumnos y cuotas','Filtros y detalle completo');

  moveInto(summary,[stats]);
  moveInto(rooms,[groupTitle,groupCards]);
  moveInto(list,[filters,message,table]);

  upcoming.querySelector('.rc-accordion-body').innerHTML = `
    <div class="rc-shortcut">
      <div><strong>Seguimiento preventivo</strong><span id="rc-upcoming-shortcut-text">Consulta los alumnos cuyas cuotas vencen en los próximos siete días.</span></div>
      <button type="button" class="btn btn-blue" data-rc-status-shortcut="proximo">Mostrar próximos vencimientos</button>
    </div>`;
  noSchedule.querySelector('.rc-accordion-body').innerHTML = `
    <div class="rc-shortcut">
      <div><strong>Cronogramas pendientes</strong><span id="rc-no-schedule-shortcut-text">Ubica a los matriculados que aún necesitan programación de cuotas.</span></div>
      <button type="button" class="btn btn-blue" data-rc-status-shortcut="sin_cronograma">Mostrar alumnos sin cronograma</button>
    </div>`;

  [summary,rooms,upcoming,noSchedule,list].forEach(details => stack.appendChild(details));
  head.insertAdjacentElement('afterend',stack);

  bindEvents(panel);
  observer = new MutationObserver(() => window.requestAnimationFrame(updateSummaries));
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
  initialized = true;
  updateSummaries();
  return true;
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(build() || attempts > 80) window.clearInterval(timer);
  },200);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();
