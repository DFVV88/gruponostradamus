/* ==================================================
   Grupo Nostradamus - Acordeón general de Finanzas
   Reorganiza los módulos visuales sin modificar datos ni operaciones.
================================================== */

let observer = null;
let updateQueued = false;
let controlsReady = false;
let eventsReady = false;

const moneyFormatter = new Intl.NumberFormat('es-PE',{
  style:'currency',
  currency:'PEN'
});

function clean(value){
  return String(value == null ? '' : value).replace(/\s+/g,' ').trim();
}

function parseMoney(value){
  let text = clean(value).replace(/[^0-9,.-]/g,'');
  if(!text) return 0;
  if(text.includes('.') && text.includes(',')) text = text.replace(/,/g,'');
  else if(text.includes(',') && !text.includes('.')) text = text.replace(',','.');
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value){
  return moneyFormatter.format(Number(value) || 0);
}

function setText(selector,text){
  const element = document.querySelector(selector);
  if(element && element.textContent !== text) element.textContent = text;
}

function injectStyles(){
  if(document.getElementById('finance-general-accordion-styles')) return;
  const style = document.createElement('style');
  style.id = 'finance-general-accordion-styles';
  style.textContent = `
    .finance-general-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0;padding:11px 13px;border:1px solid rgba(7,140,149,.16);border-radius:16px;background:#f8fcfd}
    .finance-general-controls div:first-child strong{display:block;color:#061426;font-size:13px}.finance-general-controls div:first-child span{display:block;margin-top:2px;color:#647482;font-size:10px}
    .finance-general-control-buttons{display:flex;gap:7px}.finance-general-control-buttons .btn{margin:0;padding:8px 12px;font-size:10px;white-space:nowrap}
    .finance-general-accordion{overflow:hidden;margin:10px 0;border:1px solid #dce9ed;border-radius:19px;background:#fbfdfe}
    .finance-general-accordion[open]{background:#fff;box-shadow:0 10px 28px rgba(6,20,38,.05)}
    .finance-general-accordion>summary{display:grid;grid-template-columns:minmax(210px,1fr) auto 25px;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;list-style:none;user-select:none}
    .finance-general-accordion>summary::-webkit-details-marker{display:none}
    .finance-general-copy strong{display:block;color:#061426;font-family:'Baloo 2';font-size:21px;line-height:1.05}.finance-general-copy small{display:block;margin-top:3px;color:#647482;font-size:10px;font-weight:750;line-height:1.4}
    .finance-general-summary-actions{display:flex;align-items:center;gap:7px}.finance-general-summary-actions:empty{display:none}.finance-general-summary-actions .btn{margin:0;padding:7px 11px;font-size:9px;white-space:nowrap}
    .finance-general-chevron{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#eef8fa;color:#075b65;font-size:20px;font-weight:950;transition:transform .18s ease}
    .finance-general-accordion[open] .finance-general-chevron{transform:rotate(90deg)}
    .finance-general-body{padding:0 14px 14px}
    .finance-general-body>.nf-account-section,.finance-general-body>.rc-section,.finance-general-body>.npay-section,.finance-general-body>.nrep-section,.finance-general-body>.nf-close-section,.finance-general-body>.nf-panel,.finance-general-body>.nf-audit-section{margin:0!important;border:0!important;box-shadow:none!important;background:transparent!important;padding:0!important}
    #finance-accordion-accounts .nf-account-head{display:none}
    #finance-accordion-close .nf-close-head{display:none}
    #finance-accordion-history .finance-general-body{padding-top:2px}
    #finance-accordion-history .nf-history-banner{margin:0}
    #finance-accordion-receivables .rc-section{margin:0!important}
    #finance-accordion-payables .npay-section{margin:0!important}
    #finance-accordion-reports .nrep-section{margin:0!important}
    @media(max-width:760px){
      .finance-general-controls{display:block}.finance-general-control-buttons{display:grid;grid-template-columns:1fr 1fr;margin-top:9px}.finance-general-control-buttons .btn{width:100%}
      .finance-general-accordion>summary{grid-template-columns:1fr 25px;gap:7px 10px}.finance-general-summary-actions{grid-column:1/2;justify-content:flex-start}.finance-general-chevron{grid-column:2;grid-row:1/3}.finance-general-copy small{font-size:9px}
      .finance-general-summary-actions .btn{width:auto}
    }
  `;
  document.head.appendChild(style);
}

function createAccordion({id,title,subtitle,open=false,actionHtml=''}){
  const details = document.createElement('details');
  details.id = id;
  details.className = 'finance-general-accordion';
  details.open = open;
  details.innerHTML = `
    <summary>
      <span class="finance-general-copy"><strong>${title}</strong><small>${subtitle}</small></span>
      <span class="finance-general-summary-actions">${actionHtml}</span>
      <span class="finance-general-chevron" aria-hidden="true">›</span>
    </summary>
    <div class="finance-general-body"></div>`;
  return details;
}

function wrapNode(node,config){
  if(!node || document.getElementById(config.id)) return false;
  const accordion = createAccordion(config);
  node.parentNode.insertBefore(accordion,node);
  accordion.querySelector('.finance-general-body').appendChild(node);
  return true;
}

function ensureControls(panel){
  if(controlsReady || document.getElementById('finance-general-controls')){
    controlsReady = true;
    return;
  }
  const stats = panel.querySelector(':scope > .nf-stats');
  if(!stats) return;
  const controls = document.createElement('div');
  controls.id = 'finance-general-controls';
  controls.className = 'finance-general-controls';
  controls.innerHTML = `
    <div><strong>Vista financiera organizada</strong><span>Abre solamente el módulo que necesitas consultar.</span></div>
    <div class="finance-general-control-buttons">
      <button type="button" class="btn btn-light" id="finance-general-expand">Abrir todos</button>
      <button type="button" class="btn btn-light" id="finance-general-collapse">Cerrar todos</button>
    </div>`;
  stats.insertAdjacentElement('afterend',controls);
  controlsReady = true;
}

function directChild(panel,selector){
  return Array.from(panel.children).find(child => child.matches(selector)) || null;
}

function buildAvailable(){
  const panel = document.getElementById('nostra-finance-panel');
  if(!panel) return false;
  injectStyles();
  ensureControls(panel);

  wrapNode(directChild(panel,'#finance-history-banner'),{
    id:'finance-accordion-history',
    title:'Información de carga histórica',
    subtitle:'Operaciones de enero a julio de 2026 · consulta opcional',
    open:false
  });

  wrapNode(directChild(panel,'.nf-account-section'),{
    id:'finance-accordion-accounts',
    title:'Caja y cuentas',
    subtitle:'Saldos operativos por cada cuenta',
    open:true
  });

  wrapNode(directChild(panel,'#receivables-panel'),{
    id:'finance-accordion-receivables',
    title:'Cuentas por cobrar de alumnos',
    subtitle:'Cuotas, vencimientos y morosidad por alumno y salón',
    open:false
  });

  wrapNode(directChild(panel,'#finance-payables-section'),{
    id:'finance-accordion-payables',
    title:'Cuentas por pagar',
    subtitle:'Obligaciones, vencimientos y pagos a terceros',
    open:false
  });

  wrapNode(directChild(panel,'#finance-reports-section'),{
    id:'finance-accordion-reports',
    title:'Reportes financieros',
    subtitle:'Resumen mensual, resultado y posición gerencial',
    open:false
  });

  wrapNode(directChild(panel,'#finance-close-section'),{
    id:'finance-accordion-close',
    title:'Cierre diario y conciliación',
    subtitle:'Historial de cierres y comparación de saldos',
    open:false,
    actionHtml:'<button type="button" class="btn btn-primary" id="finance-close-summary-open">Realizar cierre diario</button>'
  });

  wrapNode(directChild(panel,'.nf-panel'),{
    id:'finance-accordion-movements',
    title:'Historial de movimientos',
    subtitle:'Filtros, búsqueda e ingresos y egresos registrados',
    open:false
  });

  wrapNode(directChild(panel,'#finance-audit-section'),{
    id:'finance-accordion-audit',
    title:'Auditoría y anulaciones',
    subtitle:'Movimientos activos, anulados y trazabilidad protegida',
    open:false
  });

  bindEvents(panel);
  ensureObserver(panel);
  updateSummaries();

  return [
    'finance-accordion-history',
    'finance-accordion-accounts',
    'finance-accordion-receivables',
    'finance-accordion-payables',
    'finance-accordion-reports',
    'finance-accordion-close',
    'finance-accordion-movements',
    'finance-accordion-audit'
  ].every(id => document.getElementById(id));
}

function visibleTableRows(selector){
  return Array.from(document.querySelectorAll(selector)).filter(row =>
    row.cells && row.cells.length > 1 && !row.querySelector('td[colspan]')
  );
}

function updateSummaries(){
  const accountCards = Array.from(document.querySelectorAll('#finance-account-grid [data-finance-account]'));
  const accountTotal = accountCards.reduce((sum,card) => {
    const balance = card.querySelector(':scope > b')?.textContent || '0';
    return sum + parseMoney(balance);
  },0);
  setText('#finance-accordion-accounts .finance-general-copy small',`${accountCards.length} cuentas · saldo total ${money(accountTotal)}`);

  const programmed = clean(document.getElementById('receivables-programmed')?.textContent) || money(0);
  const overdue = clean(document.getElementById('receivables-overdue')?.textContent) || money(0);
  const debtors = clean(document.getElementById('receivables-students')?.textContent) || '0';
  setText('#finance-accordion-receivables .finance-general-copy small',`${programmed} programado · ${overdue} vencido · ${debtors} alumnos con deuda`);

  const payablePending = clean(document.getElementById('finance-payable-pending')?.textContent) || money(0);
  const payableOverdue = clean(document.getElementById('finance-payable-overdue')?.textContent) || money(0);
  const payableCount = clean(document.getElementById('finance-payable-count')?.textContent) || '0';
  setText('#finance-accordion-payables .finance-general-copy small',`${payablePending} por pagar · ${payableOverdue} vencido · ${payableCount} obligaciones abiertas`);

  const reportMonth = clean(document.getElementById('finance-report-title')?.textContent) || 'Mes actual';
  const reportIncome = clean(document.getElementById('finance-report-income')?.textContent) || money(0);
  const reportResult = clean(document.getElementById('finance-report-result')?.textContent) || money(0);
  setText('#finance-accordion-reports .finance-general-copy small',`${reportMonth} · ingresos ${reportIncome} · resultado ${reportResult}`);

  const movementRows = visibleTableRows('#finance-rows tr');
  const period = clean(document.getElementById('finance-period-label')?.textContent) || 'Periodo actual';
  setText('#finance-accordion-movements .finance-general-copy small',`${movementRows.length} movimientos visibles · ${period}`);

  const closeCount = clean(document.getElementById('finance-close-count')?.textContent) || '0';
  const closeLast = clean(document.getElementById('finance-close-last')?.textContent) || '-';
  const closeDifference = clean(document.getElementById('finance-close-last-difference')?.textContent) || money(0);
  setText('#finance-accordion-close .finance-general-copy small',`${closeCount} cierres · último: ${closeLast} · diferencia ${closeDifference}`);

  const active = clean(document.getElementById('finance-audit-active-count')?.textContent) || '0';
  const voided = clean(document.getElementById('finance-audit-void-count')?.textContent) || '0';
  const total = clean(document.getElementById('finance-audit-total-count')?.textContent) || '0';
  setText('#finance-accordion-audit .finance-general-copy small',`${active} activos · ${voided} anulados · ${total} registrados`);
}

function queueUpdate(){
  if(updateQueued) return;
  updateQueued = true;
  window.requestAnimationFrame(() => {
    updateQueued = false;
    updateSummaries();
  });
}

function ensureObserver(panel){
  if(observer) return;
  observer = new MutationObserver(queueUpdate);
  observer.observe(panel,{childList:true,subtree:true,characterData:true});
}

function setAll(open){
  document.querySelectorAll('#nostra-finance-panel > .finance-general-accordion').forEach(details => {
    details.open = open;
  });
}

function bindEvents(panel){
  if(eventsReady) return;
  eventsReady = true;

  panel.addEventListener('click',event => {
    if(event.target.closest('#finance-general-expand')){
      setAll(true);
      return;
    }
    if(event.target.closest('#finance-general-collapse')){
      setAll(false);
      return;
    }
    if(event.target.closest('#finance-close-summary-open')){
      event.preventDefault();
      event.stopPropagation();
      const accordion = document.getElementById('finance-accordion-close');
      if(accordion) accordion.open = true;
      window.setTimeout(() => document.getElementById('finance-close-open')?.click(),40);
    }
  });

  document.addEventListener('click',event => {
    if(event.target.closest('[data-finance-account]')){
      const movements = document.getElementById('finance-accordion-movements');
      if(movements) movements.open = true;
    }
  },true);
}

function initialize(){
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if(buildAvailable() || attempts > 100) window.clearInterval(timer);
  },200);
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
else initialize();