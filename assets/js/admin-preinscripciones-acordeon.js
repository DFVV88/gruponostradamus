/* ==================================================
   Grupo Nostradamus - Preinscripciones compactas
   Organiza listas y salones en acordeones accesibles.
================================================== */
(function(){
  'use strict';

  const VIEW_ID = 'admin-view-preinscripciones';
  const STORAGE_KEY = 'nostraPreinscripcionesAccordion';
  const TOP_KEYS = ['general','academico'];
  let initialized = false;
  let initialStateApplied = false;
  let observer = null;
  let userChangedState = false;

  function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }

  function isMobile(){
    return window.matchMedia && window.matchMedia('(max-width: 700px)').matches;
  }

  function readState(){
    try{
      const value = sessionStorage.getItem(STORAGE_KEY);
      return TOP_KEYS.includes(value) ? value : '';
    }catch(_){
      return '';
    }
  }

  function writeState(value){
    try{
      if(value) sessionStorage.setItem(STORAGE_KEY,value);
      else sessionStorage.removeItem(STORAGE_KEY);
    }catch(_){ /* Solo se guarda la sección abierta, nunca datos del alumno. */ }
  }

  function injectStyles(){
    if(document.getElementById('nap-accordion-styles')) return;
    const style = document.createElement('style');
    style.id = 'nap-accordion-styles';
    style.textContent = `
      .nap-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 4px;padding:12px 14px;border:1px solid rgba(7,140,149,.14);border-radius:17px;background:#f8fcfd}
      .nap-tools-copy strong{display:block;color:#061426;font-size:12px}.nap-tools-copy span{display:block;margin-top:2px;color:#71808c;font-size:10px;line-height:1.4}
      .nap-tools-actions{display:flex;gap:7px}.nap-tools-actions button{border:1px solid #d7e7eb;border-radius:999px;padding:7px 11px;background:#fff;color:#075b65;font:inherit;font-size:10px;font-weight:950;cursor:pointer}.nap-tools-actions button:hover{border-color:#078c95;background:#eef9fa}
      .nap-accordion{margin-top:13px;border:1px solid rgba(7,140,149,.16);border-radius:21px;background:#fff;box-shadow:0 12px 34px rgba(6,20,38,.05);overflow:hidden}
      .nap-accordion-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;border:0;background:linear-gradient(180deg,#fff,#f9fcfd);color:#061426;text-align:left;font:inherit;cursor:pointer}
      .nap-accordion-toggle:hover{background:#f4fbfc}.nap-accordion.open>.nap-accordion-toggle{background:linear-gradient(135deg,#f5fbfc,#eef9fa)}
      .nap-accordion-title{display:flex;align-items:center;gap:12px;min-width:0}.nap-accordion-icon{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;background:#eaf8f9;color:#075b65;font-weight:950}
      .nap-accordion-copy{min-width:0}.nap-accordion-copy strong{display:block;font-family:'Baloo 2';font-size:20px;line-height:1.05}.nap-accordion-copy small{display:block;margin-top:3px;color:#71808c;font-size:10px;line-height:1.4}
      .nap-accordion-side{display:flex;align-items:center;gap:10px;flex:0 0 auto}.nap-count{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:25px;padding:0 9px;border-radius:999px;background:#061426;color:#fff;font-size:10px;font-weight:950}.nap-chevron{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:#fff;border:1px solid #dce9ed;color:#075b65;font-size:15px;font-weight:950;transition:transform .18s ease}.nap-accordion.open .nap-chevron{transform:rotate(180deg)}
      .nap-accordion-content{display:none;padding:0 13px 13px}.nap-accordion.open>.nap-accordion-content{display:block}.nap-accordion-content>.panel,.nap-accordion-content>.npm-section{margin-top:0;box-shadow:none;border-radius:16px;border-color:#e1ecef}
      .nap-subaccordion{margin-top:11px;border:1px solid #e1ecef;border-radius:16px;overflow:hidden;background:#fbfdfe}.nap-subtoggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border:0;background:#f7fbfc;color:#061426;text-align:left;font:inherit;font-size:11px;font-weight:950;cursor:pointer}.nap-subtoggle span:last-child{transition:transform .18s ease}.nap-subaccordion.open>.nap-subtoggle span:last-child{transform:rotate(180deg)}.nap-subcontent{display:none;padding:11px}.nap-subaccordion.open>.nap-subcontent{display:block}.nap-subcontent>.npm-groups,.nap-subcontent>.npm-filters{margin-bottom:0}.nap-subcontent>.msg{margin-top:10px}.nap-subcontent>.npm-table{margin-top:10px}
      .nap-alert-dot{width:8px;height:8px;border-radius:50%;background:#ff941e;box-shadow:0 0 0 4px rgba(255,148,30,.14)}
      @media(max-width:700px){.nap-tools{display:block}.nap-tools-actions{margin-top:10px}.nap-tools-actions button{flex:1}.nap-accordion-toggle{padding:14px}.nap-accordion-copy small{white-space:normal}.nap-count{display:none}.nap-accordion-content{padding:0 8px 8px}.nap-accordion-content>.panel,.nap-accordion-content>.npm-section{padding:14px}.nap-subcontent{padding:8px}}
    `;
    document.head.appendChild(style);
  }

  function createTools(view){
    if(document.getElementById('nap-tools')) return;
    const tools = document.createElement('div');
    tools.id = 'nap-tools';
    tools.className = 'nap-tools';
    tools.innerHTML = `
      <div class="nap-tools-copy"><strong>Vista compacta de Preinscripciones</strong><span>Abre únicamente la lista que necesitas revisar.</span></div>
      <div class="nap-tools-actions"><button type="button" data-nap-expand>Expandir todo</button><button type="button" data-nap-collapse>Contraer todo</button></div>`;
    const heading = view.querySelector('.admin-pro-section-head');
    if(heading) heading.insertAdjacentElement('afterend',tools);
    else view.insertBefore(tools,view.firstChild);
  }

  function countGeneral(){
    const rows = document.querySelectorAll('#rows tr');
    return Array.from(rows).filter(row => row.querySelector('[data-open],[data-pay]')).length;
  }

  function countAcademic(){
    const node = document.getElementById('npm-total');
    const value = Number(clean(node?.textContent));
    return Number.isFinite(value) ? value : 0;
  }

  function wrapperTemplate(key,title,description,icon){
    const wrapper = document.createElement('section');
    wrapper.className = 'nap-accordion';
    wrapper.dataset.napAccordion = key;
    wrapper.innerHTML = `
      <button type="button" class="nap-accordion-toggle" aria-expanded="false">
        <span class="nap-accordion-title"><span class="nap-accordion-icon">${icon}</span><span class="nap-accordion-copy"><strong>${title}</strong><small>${description}</small></span></span>
        <span class="nap-accordion-side"><span class="nap-regularization-indicator" hidden><span class="nap-alert-dot"></span></span><span class="nap-count">0</span><span class="nap-chevron">⌄</span></span>
      </button>
      <div class="nap-accordion-content"></div>`;
    return wrapper;
  }

  function wrapNode(node,key,title,description,icon){
    if(!node || node.closest('[data-nap-accordion]')) return null;
    const wrapper = wrapperTemplate(key,title,description,icon);
    node.parentNode.insertBefore(wrapper,node);
    wrapper.querySelector('.nap-accordion-content').appendChild(node);
    wrapper.querySelector('.nap-accordion-toggle').addEventListener('click',() => {
      userChangedState = true;
      const willOpen = !wrapper.classList.contains('open');
      setOnlyOpen(willOpen ? key : '');
    });
    return wrapper;
  }

  function setOpen(wrapper,open){
    if(!wrapper) return;
    wrapper.classList.toggle('open',open);
    wrapper.querySelector(':scope > .nap-accordion-toggle')?.setAttribute('aria-expanded',open ? 'true' : 'false');
  }

  function setOnlyOpen(key){
    document.querySelectorAll(`#${VIEW_ID} [data-nap-accordion]`).forEach(wrapper => {
      setOpen(wrapper,wrapper.dataset.napAccordion === key);
    });
    writeState(key);
  }

  function setAll(open){
    userChangedState = true;
    document.querySelectorAll(`#${VIEW_ID} [data-nap-accordion]`).forEach(wrapper => setOpen(wrapper,open));
    writeState(open ? 'general' : '');
  }

  function makeSubaccordion(nodes,title,openByDefault){
    const usable = nodes.filter(Boolean);
    if(!usable.length || usable[0].closest('.nap-subaccordion')) return;
    const first = usable[0];
    const wrapper = document.createElement('section');
    wrapper.className = `nap-subaccordion${openByDefault ? ' open' : ''}`;
    wrapper.innerHTML = `<button type="button" class="nap-subtoggle" aria-expanded="${openByDefault ? 'true' : 'false'}"><span>${title}</span><span>⌄</span></button><div class="nap-subcontent"></div>`;
    first.parentNode.insertBefore(wrapper,first);
    const content = wrapper.querySelector('.nap-subcontent');
    usable.forEach(node => content.appendChild(node));
    wrapper.querySelector('.nap-subtoggle').addEventListener('click',() => {
      const open = !wrapper.classList.contains('open');
      wrapper.classList.toggle('open',open);
      wrapper.querySelector('.nap-subtoggle').setAttribute('aria-expanded',open ? 'true' : 'false');
    });
  }

  function organizeAcademicPanel(){
    const panel = document.getElementById('admin-payments-enrollments');
    if(!panel || panel.dataset.napOrganized === '1') return;
    const groups = panel.querySelector('.npm-groups');
    const filters = panel.querySelector('.npm-filters');
    const message = panel.querySelector('#npm-message');
    const table = panel.querySelector('.npm-table');
    makeSubaccordion([groups],'Grupos y salones',false);
    makeSubaccordion([filters,message,table],'Listado académico por alumno',true);
    panel.dataset.napOrganized = '1';
  }

  function setTextIfChanged(node,value){
    if(node && node.textContent !== value) node.textContent = value;
  }

  function updateCounts(){
    const general = document.querySelector('[data-nap-accordion="general"] .nap-count');
    const academic = document.querySelector('[data-nap-accordion="academico"] .nap-count');
    setTextIfChanged(general,String(countGeneral()));
    setTextIfChanged(academic,String(countAcademic()));

    const message = clean(document.getElementById('npm-message')?.textContent).toLowerCase();
    const hasRegularization = message.includes('regulariz') || message.includes('requiere');
    const indicator = document.querySelector('[data-nap-accordion="academico"] .nap-regularization-indicator');
    if(indicator) indicator.hidden = !hasRegularization;

    if(hasRegularization && !userChangedState && !readState()){
      setOnlyOpen('academico');
    }
  }

  function bindTools(){
    document.querySelector('[data-nap-expand]')?.addEventListener('click',() => setAll(true));
    document.querySelector('[data-nap-collapse]')?.addEventListener('click',() => setAll(false));
  }

  function setup(){
    const view = document.getElementById(VIEW_ID);
    if(!view) return false;
    const generalPanel = Array.from(view.children).find(node => node.classList?.contains('panel') && node.id !== 'admin-payments-enrollments');
    const academicPanel = document.getElementById('admin-payments-enrollments');
    if(!generalPanel || !academicPanel) return false;

    injectStyles();
    createTools(view);
    wrapNode(generalPanel,'general','Lista general de preinscritos','Busca alumnos, revisa fichas y valida pagos.','◎');
    wrapNode(academicPanel,'academico','Alumnos, pagos y salones','Control académico, regularización financiera y matrícula por grupo.','▦');
    organizeAcademicPanel();

    if(!initialized){
      bindTools();
      initialized = true;
    }

    if(!initialStateApplied){
      const saved = readState();
      if(saved) setOnlyOpen(saved);
      else if(isMobile()) setOnlyOpen('');
      else setOnlyOpen('general');
      initialStateApplied = true;
    }
    updateCounts();
    return true;
  }

  function observe(){
    if(observer) return;
    observer = new MutationObserver(() => {
      if(!setup()) return;
      updateCounts();
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  function initialize(){
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if(setup() || attempts > 80) clearInterval(timer);
    },200);
    observe();
  }

  document.addEventListener('click',event => {
    const payment = event.target.closest('[data-pay],[data-npm-payment]');
    if(payment){
      const accordion = document.querySelector('[data-nap-accordion="academico"]');
      if(accordion && !accordion.classList.contains('open')) setOnlyOpen('academico');
    }
  },true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize);
  else initialize();
})();
