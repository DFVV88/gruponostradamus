/* ==================================================
   Grupo Nostradamus - Panel administrativo profesional
   Organiza los módulos existentes sin modificar su lógica.
================================================== */
(function(){
  'use strict';

  var VIEW_META = {
    resumen:{title:'Resumen',description:'Vista general de la gestión académica y comercial.'},
    ciclos:{title:'Ciclos y planes',description:'Administra precios, matrículas, horarios, beneficios y promociones.'},
    preinscripciones:{title:'Preinscripciones',description:'Revisa solicitudes, valida pagos y aprueba matrículas.'},
    cuentas:{title:'NostraCUENTAS',description:'Administra accesos institucionales de alumnos y docentes.'}
  };

  var shellReady = false;
  var syncQueued = false;
  var currentView = 'resumen';
  var observer = null;

  function el(tag,className,html){
    var node = document.createElement(tag);
    if(className) node.className = className;
    if(html != null) node.innerHTML = html;
    return node;
  }

  function todayLabel(){
    try{
      return new Date().toLocaleDateString('es-PE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    }catch(_){ return ''; }
  }

  function navButton(view,icon,label){
    return '<button type="button" data-admin-view="' + view + '"><span class="admin-pro-nav-icon">' + icon + '</span><span>' + label + '</span></button>';
  }

  function sectionHead(title,text,note){
    return '<div class="admin-pro-section-head"><div><h2>' + title + '</h2><p>' + text + '</p></div>' +
      (note ? '<span class="admin-pro-section-note">' + note + '</span>' : '') + '</div>';
  }

  function buildSidebar(){
    var aside = el('aside','admin-pro-sidebar');
    aside.innerHTML =
      '<div class="admin-pro-sidebar-brand">' +
        '<img src="assets/img/logo.png" alt="Grupo Nostradamus">' +
        '<div><strong>NostraADMIN</strong><small>Centro de gestión</small></div>' +
      '</div>' +
      '<nav class="admin-pro-nav" aria-label="Navegación administrativa">' +
        '<div class="admin-pro-nav-label">Principal</div>' +
        navButton('resumen','⌂','Resumen') +
        navButton('ciclos','▦','Ciclos y planes') +
        '<div class="admin-pro-nav-label">Gestión</div>' +
        navButton('preinscripciones','◎','Preinscripciones') +
        navButton('cuentas','◇','NostraCUENTAS') +
      '</nav>' +
      '<div class="admin-pro-sidebar-foot"><b>Grupo Nostradamus</b><br>Los cambios de tarifas se publican desde Firebase y conservan historial administrativo.</div>';
    return aside;
  }

  function buildTopbar(){
    var top = el('header','admin-pro-topbar');
    top.innerHTML =
      '<div class="admin-pro-topbar-left">' +
        '<button type="button" class="admin-pro-menu-toggle" aria-label="Abrir menú">☰</button>' +
        '<div><h1 id="admin-pro-view-title">Resumen</h1><p id="admin-pro-view-description">Vista general de la gestión académica y comercial.</p></div>' +
      '</div>' +
      '<div class="admin-pro-topbar-actions">' +
        '<a class="btn btn-light" href="index.html" target="_blank" rel="noopener">Ver web</a>' +
        '<a class="btn btn-light" href="preinscripcion.html" target="_blank" rel="noopener">Formulario</a>' +
      '</div>';
    return top;
  }

  function buildQuickGrid(){
    var grid = el('div','admin-pro-quick-grid');
    grid.innerHTML =
      '<button class="admin-pro-quick-card" type="button" data-admin-view="ciclos"><span class="icon">▦</span><strong>Ciclos y planes</strong><span>Edita precios, matrículas, promociones, beneficios y horarios.</span><em>Abrir tarifario →</em></button>' +
      '<button class="admin-pro-quick-card" type="button" data-admin-view="preinscripciones"><span class="icon">◎</span><strong>Preinscripciones</strong><span>Revisa solicitudes, pagos pendientes y matrículas listas.</span><em>Revisar solicitudes →</em></button>' +
      '<button class="admin-pro-quick-card" type="button" data-admin-view="cuentas"><span class="icon">◇</span><strong>NostraCUENTAS</strong><span>Activa, bloquea o revisa accesos institucionales.</span><em>Administrar cuentas →</em></button>';
    return grid;
  }

  function setupShell(){
    if(shellReady) return;
    var admin = document.getElementById('admin-panel');
    if(!admin || document.getElementById('admin-pro-shell')) return;

    var hero = Array.prototype.slice.call(admin.children).find(function(node){ return node.classList && node.classList.contains('hero'); });
    var stats = Array.prototype.slice.call(admin.children).find(function(node){ return node.classList && node.classList.contains('stats'); });
    var prePanel = Array.prototype.slice.call(admin.children).find(function(node){
      return node.classList && node.classList.contains('panel') && !node.id;
    });

    var shell = el('div','admin-pro-shell');
    shell.id = 'admin-pro-shell';
    var sidebar = buildSidebar();
    var main = el('div','admin-pro-main');
    var topbar = buildTopbar();
    var views = el('div','admin-pro-views');

    var overview = el('section','admin-pro-view');
    overview.id = 'admin-view-resumen';
    overview.dataset.adminViewPanel = 'resumen';
    if(hero){
      hero.className = 'admin-pro-overview-hero';
      var date = el('span','admin-pro-date',todayLabel());
      hero.appendChild(date);
      overview.appendChild(hero);
    }else{
      overview.appendChild(el('div','admin-pro-overview-hero','<h1>Gestión administrativa</h1><p>Administra Grupo Nostradamus desde un solo lugar.</p><span class="admin-pro-date">' + todayLabel() + '</span>'));
    }
    if(stats) overview.appendChild(stats);
    overview.appendChild(buildQuickGrid());

    var cycles = el('section','admin-pro-view');
    cycles.id = 'admin-view-ciclos';
    cycles.dataset.adminViewPanel = 'ciclos';
    cycles.innerHTML = sectionHead('Ciclos y planes','Edita un producto a la vez para mantener el panel ordenado.','Cambios guardados en Firebase') +
      '<div class="admin-pro-empty" id="admin-cycles-placeholder">Cargando el editor de ciclos y planes...</div>';

    var pre = el('section','admin-pro-view');
    pre.id = 'admin-view-preinscripciones';
    pre.dataset.adminViewPanel = 'preinscripciones';
    pre.innerHTML = sectionHead('Preinscripciones','Busca alumnos, valida pagos y administra el proceso de matrícula.','Hasta 200 registros recientes');
    if(prePanel) pre.appendChild(prePanel);

    var accounts = el('section','admin-pro-view');
    accounts.id = 'admin-view-cuentas';
    accounts.dataset.adminViewPanel = 'cuentas';
    accounts.innerHTML = sectionHead('NostraCUENTAS','Gestiona las cuentas institucionales sin mezclar esta información con el tarifario.','Microsoft 365') +
      '<div class="admin-pro-empty" id="admin-accounts-placeholder">Cargando NostraCUENTAS...</div>';

    views.appendChild(overview);
    views.appendChild(cycles);
    views.appendChild(pre);
    views.appendChild(accounts);
    main.appendChild(topbar);
    main.appendChild(views);
    shell.appendChild(sidebar);
    shell.appendChild(main);
    admin.insertBefore(shell,admin.firstChild);

    var overlay = el('button','admin-pro-overlay');
    overlay.type = 'button';
    overlay.setAttribute('aria-label','Cerrar menú');
    document.body.appendChild(overlay);

    shellReady = true;
    document.body.classList.add('admin-dashboard-ready');
    bindNavigation();
    startObserver(admin);

    var saved = '';
    try{ saved = localStorage.getItem('nostraAdminView') || ''; }catch(_){ /* sin almacenamiento */ }
    showView(VIEW_META[saved] ? saved : 'resumen');
    queueSync();
  }

  function bindNavigation(){
    document.addEventListener('click',function(event){
      var target = event.target.closest('[data-admin-view]');
      if(target){
        event.preventDefault();
        showView(target.dataset.adminView);
      }

      if(event.target.closest('.admin-pro-menu-toggle')){
        document.body.classList.toggle('admin-menu-open');
      }
      if(event.target.closest('.admin-pro-overlay')){
        document.body.classList.remove('admin-menu-open');
      }

      var planTop = event.target.closest('.np-plan-top');
      if(planTop && !event.target.closest('input,select,textarea,label,button,a')){
        var plan = planTop.closest('.np-plan');
        if(plan) plan.classList.toggle('admin-plan-collapsed');
      }

      var collapse = event.target.closest('[data-admin-collapse-plans]');
      if(collapse){
        var panel = document.getElementById('nostra-pricing-admin-panel');
        if(panel) panel.querySelectorAll('.np-plan').forEach(function(plan){ plan.classList.add('admin-plan-collapsed'); });
      }
      var expand = event.target.closest('[data-admin-expand-plans]');
      if(expand){
        var pricing = document.getElementById('nostra-pricing-admin-panel');
        if(pricing) pricing.querySelectorAll('.np-plan').forEach(function(plan){ plan.classList.remove('admin-plan-collapsed'); });
      }
    });

    document.addEventListener('input',function(event){
      var plan = event.target.closest('.np-plan');
      if(plan) updatePlanSummary(plan);
    });
    document.addEventListener('change',function(event){
      var plan = event.target.closest('.np-plan');
      if(plan) updatePlanSummary(plan);
    });
  }

  function showView(view){
    if(!VIEW_META[view]) view = 'resumen';
    currentView = view;
    document.querySelectorAll('[data-admin-view-panel]').forEach(function(panel){
      panel.classList.toggle('active',panel.dataset.adminViewPanel === view);
    });
    document.querySelectorAll('.admin-pro-nav [data-admin-view]').forEach(function(button){
      button.classList.toggle('active',button.dataset.adminView === view);
    });
    var title = document.getElementById('admin-pro-view-title');
    var description = document.getElementById('admin-pro-view-description');
    if(title) title.textContent = VIEW_META[view].title;
    if(description) description.textContent = VIEW_META[view].description;
    document.body.classList.remove('admin-menu-open');
    try{ localStorage.setItem('nostraAdminView',view); }catch(_){ /* sin almacenamiento */ }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function startObserver(admin){
    if(observer) return;
    observer = new MutationObserver(queueSync);
    observer.observe(admin,{childList:true,subtree:true});
  }

  function queueSync(){
    if(syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(function(){
      syncQueued = false;
      syncModules();
    });
  }

  function syncModules(){
    if(!shellReady) return;
    var cycles = document.getElementById('admin-view-ciclos');
    var accounts = document.getElementById('admin-view-cuentas');
    var pricingPanel = document.getElementById('nostra-pricing-admin-panel');
    var accountsPanel = document.getElementById('nostra-accounts-panel');

    if(pricingPanel && cycles && pricingPanel.parentElement !== cycles){
      var placeholder = document.getElementById('admin-cycles-placeholder');
      if(placeholder) placeholder.remove();
      cycles.appendChild(pricingPanel);
    }
    if(accountsPanel && accounts && accountsPanel.parentElement !== accounts){
      var accountPlaceholder = document.getElementById('admin-accounts-placeholder');
      if(accountPlaceholder) accountPlaceholder.remove();
      accounts.appendChild(accountsPanel);
    }

    if(pricingPanel) decoratePricingPanel(pricingPanel);
  }

  function decoratePricingPanel(panel){
    var head = panel.querySelector('.np-head');
    if(head){
      var title = head.querySelector('h2');
      var paragraph = head.querySelector('p');
      if(title) title.textContent = 'Ciclos y planes';
      if(paragraph) paragraph.textContent = 'Abre únicamente el plan que deseas editar. Los demás permanecen cerrados para mantener una vista limpia.';
      var actions = head.querySelector('.np-actions');
      if(actions && !actions.querySelector('[data-admin-collapse-plans]')){
        var collapse = el('button','btn btn-light','Cerrar planes');
        collapse.type = 'button';
        collapse.dataset.adminCollapsePlans = '1';
        var expand = el('button','btn btn-light','Abrir planes');
        expand.type = 'button';
        expand.dataset.adminExpandPlans = '1';
        actions.insertBefore(collapse,actions.firstChild);
        actions.insertBefore(expand,collapse.nextSibling);
      }
    }

    var compliance = panel.querySelector('.np-compliance');
    if(compliance && !compliance.closest('.admin-project-status')){
      var details = el('details','admin-project-status');
      var summary = el('summary','','Estado de implementación');
      compliance.parentNode.insertBefore(details,compliance);
      details.appendChild(summary);
      details.appendChild(compliance);
    }

    panel.querySelectorAll('.np-plan').forEach(function(plan,index){
      decoratePlan(plan,index);
    });
  }

  function decoratePlan(plan,index){
    var top = plan.querySelector('.np-plan-top');
    var title = plan.querySelector('.np-plan-title');
    if(!top || !title) return;

    if(!plan.dataset.adminPlanReady){
      plan.dataset.adminPlanReady = '1';
      if(index !== 0) plan.classList.add('admin-plan-collapsed');
      title.innerHTML = '<span class="admin-plan-chevron">›</span><span class="admin-plan-summary"><span class="admin-plan-summary-name">Plan</span><span class="admin-plan-summary-price"></span><span class="admin-plan-summary-badge"></span></span>';
    }
    updatePlanSummary(plan);
  }

  function value(plan,field){
    var input = plan.querySelector('[data-plan-field="' + field + '"]');
    if(!input) return '';
    if(input.type === 'checkbox') return input.checked;
    return String(input.value || '').trim();
  }

  function money(valueText){
    var amount = Number(String(valueText || '').replace(',','.'));
    if(!Number.isFinite(amount)) amount = 0;
    return 'S/ ' + (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  }

  function updatePlanSummary(plan){
    var name = plan.querySelector('.admin-plan-summary-name');
    var price = plan.querySelector('.admin-plan-summary-price');
    var badge = plan.querySelector('.admin-plan-summary-badge');
    if(!name || !price || !badge) return;

    var planName = value(plan,'nombre') || 'Plan sin nombre';
    var regular = value(plan,'precio');
    var promoOn = value(plan,'promocionActiva') === true;
    var promo = value(plan,'precioPromocional');
    var active = value(plan,'activo') !== false;

    name.textContent = planName;
    price.textContent = promoOn && Number(promo) > 0 ? money(promo) + ' promo' : money(regular);
    badge.classList.toggle('off',!active || !promoOn);
    badge.textContent = !active ? 'Inactivo' : (promoOn && Number(promo) > 0 ? 'Promoción' : 'Activo');
  }

  function init(){
    setupShell();
    var attempts = 0;
    var timer = setInterval(function(){
      setupShell();
      queueSync();
      attempts += 1;
      if(shellReady && attempts > 12) clearInterval(timer);
      if(attempts > 40) clearInterval(timer);
    },350);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
