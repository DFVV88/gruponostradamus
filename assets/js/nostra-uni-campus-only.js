/* ==================================================
   Grupo Nostradamus - Solo Sede UNI
   Limpieza segura: oculta únicamente tarjetas, enlaces o mapas
   de Los Olivos y Chorrillos. Nunca oculta la columna de ciclos.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var file = (path.split('/').pop() || '').toLowerCase();
  var isCyclePage = /^ciclo-.*\.html$/.test(file);
  var OLD_CAMPUS = /(los\s+olivos|chorrillos|alfredo\s+mendiola|defensores\s+del\s+morro)/i;
  var UNI_CAMPUS = /(sede\s+uni|gerardo\s+unger|san\s+mart[ií]n\s+de\s+porres|smp)/i;

  function injectStyles() {
    if (document.getElementById('nostra-uni-campus-only-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-uni-campus-only-style';
    style.textContent = `
      .nostra-campus-hidden{display:none !important;visibility:hidden !important;height:0 !important;margin:0 !important;padding:0 !important;overflow:hidden !important;}
      .nostra-uni-campus-focus .row{justify-content:center !important;}
      body.nostra-cycle-page-safe .col-xxl-3.col-lg-4,
      body.nostra-cycle-page-safe #nostra-cycle-panel-host{
        display:block !important;
        visibility:visible !important;
        opacity:1 !important;
        height:auto !important;
        overflow:visible !important;
      }
    `;
    document.head.appendChild(style);
  }

  function restoreCycleColumn() {
    if (!isCyclePage) return;
    document.body.classList.add('nostra-cycle-page-safe');

    var sidebar = document.querySelector('.sidebar-area');
    if (sidebar) {
      sidebar.classList.remove('nostra-campus-hidden');
      var column = sidebar.closest('.col-xxl-3.col-lg-4, .col-lg-4');
      if (column) column.classList.remove('nostra-campus-hidden');
    }

    var host = document.getElementById('nostra-cycle-panel-host');
    if (host) host.classList.remove('nostra-campus-hidden');
  }

  function cleanCampusMenus() {
    document.querySelectorAll('a, li').forEach(function (el) {
      if (!OLD_CAMPUS.test(el.textContent || '')) return;
      var li = el.closest('li') || el;

      /* En ciclos solo se oculta el ítem puntual; nunca la columna lateral. */
      if (isCyclePage && li.closest('.sidebar-area')) {
        li.classList.add('nostra-campus-hidden');
        return;
      }

      li.classList.add('nostra-campus-hidden');
    });
  }

  function cleanCampusCards() {
    var safeSelectors = [
      '.process-card2-wrap',
      '.process-card2',
      '.contact-card',
      '.contact-info',
      '.location-card',
      '.map-card',
      '.feature-card',
      '.widget_nav_menu li',
      '.footer-widget li'
    ];

    safeSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (block) {
        var text = block.textContent || '';
        if (OLD_CAMPUS.test(text)) block.classList.add('nostra-campus-hidden');
      });
    });
  }

  function mapBlock(iframe) {
    if (isCyclePage) {
      return iframe.closest('.info-list li, .widget_info li, .sidebar-area li, .process-card2-wrap, .contact-card, .location-card, .map-card') || iframe.parentElement;
    }

    return iframe.closest('.process-card2-wrap, .contact-card, .location-card, .map-card, .col-sm-6, .col-md-6, .col-lg-4, .col-xl-4') || iframe.parentElement;
  }

  function cleanMaps() {
    var iframes = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'));
    if (!iframes.length) return;

    iframes.forEach(function (iframe) {
      var block = mapBlock(iframe);
      if (!block) return;

      var context = (block.textContent || '') + ' ' + (block.innerHTML || '');
      if (OLD_CAMPUS.test(context)) block.classList.add('nostra-campus-hidden');
    });

    var visible = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'))
      .filter(function (iframe) { return !iframe.closest('.nostra-campus-hidden'); });

    if (visible.length > 1) {
      var selected = visible.find(function (iframe) {
        var block = mapBlock(iframe);
        var context = block ? (block.textContent || '') + ' ' + (block.innerHTML || '') : '';
        return UNI_CAMPUS.test(context);
      }) || visible[0];

      visible.forEach(function (iframe) {
        if (iframe === selected) return;
        var block = mapBlock(iframe);
        if (block) block.classList.add('nostra-campus-hidden');
      });
    }
  }

  function renameCampusCopy() {
    document.querySelectorAll('h1,h2,h3,h4,span,p,a').forEach(function (el) {
      if (!el || !el.childNodes || el.childNodes.length !== 1) return;
      var text = el.textContent || '';
      var clean = text
        .replace(/Nuestras sedes/gi, 'Nuestra sede')
        .replace(/Sedes/gi, 'Sede')
        .replace(/Encuentra tu\s*sede ideal/gi, 'Visita nuestra sede UNI')
        .replace(/Encuentra tu\s*sedes ideal/gi, 'Visita nuestra sede UNI');
      if (clean !== text) el.textContent = clean;
    });
  }

  function init() {
    injectStyles();
    restoreCycleColumn();
    cleanCampusMenus();
    cleanCampusCards();
    cleanMaps();
    restoreCycleColumn();
    renameCampusCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
    setTimeout(restoreCycleColumn, 3000);
  });
})();