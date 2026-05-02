/* ==================================================
   Grupo Nostradamus - Solo Sede UNI
   Limpieza segura: oculta únicamente tarjetas, enlaces o mapas
   de Los Olivos y Chorrillos. No toca contenido de ciclos.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var OLD_CAMPUS = /(los\s+olivos|chorrillos|alfredo\s+mendiola|defensores\s+del\s+morro)/i;
  var UNI_CAMPUS = /(sede\s+uni|gerardo\s+unger|san\s+mart[ií]n\s+de\s+porres|smp)/i;

  function injectStyles() {
    if (document.getElementById('nostra-uni-campus-only-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-uni-campus-only-style';
    style.textContent = `
      .nostra-campus-hidden{display:none !important; visibility:hidden !important; height:0 !important; margin:0 !important; padding:0 !important; overflow:hidden !important;}
      .nostra-uni-campus-focus .row{justify-content:center !important;}
    `;
    document.head.appendChild(style);
  }

  function cleanCampusMenus() {
    document.querySelectorAll('a, li').forEach(function (el) {
      if (OLD_CAMPUS.test(el.textContent || '')) {
        var li = el.closest('li') || el;
        li.classList.add('nostra-campus-hidden');
      }
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
        if (OLD_CAMPUS.test(text)) {
          block.classList.add('nostra-campus-hidden');
        }
      });
    });
  }

  function cleanMaps() {
    var iframes = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'));
    if (!iframes.length) return;

    iframes.forEach(function (iframe) {
      var block = iframe.closest('.process-card2-wrap, .contact-card, .location-card, .map-card, .col-sm-6, .col-md-6, .col-lg-4, .col-xl-4') || iframe.parentElement;
      if (!block) return;

      var context = (block.textContent || '') + ' ' + (block.innerHTML || '');
      if (OLD_CAMPUS.test(context)) {
        block.classList.add('nostra-campus-hidden');
      }
    });

    var visible = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'))
      .filter(function (iframe) { return !iframe.closest('.nostra-campus-hidden'); });

    if (visible.length > 1) {
      var selected = visible.find(function (iframe) {
        var block = iframe.closest('.process-card2-wrap, .contact-card, .location-card, .map-card, .col-sm-6, .col-md-6, .col-lg-4, .col-xl-4') || iframe.parentElement;
        var context = block ? (block.textContent || '') + ' ' + (block.innerHTML || '') : '';
        return UNI_CAMPUS.test(context);
      }) || visible[0];

      visible.forEach(function (iframe) {
        if (iframe === selected) return;
        var block = iframe.closest('.process-card2-wrap, .contact-card, .location-card, .map-card, .col-sm-6, .col-md-6, .col-lg-4, .col-xl-4') || iframe.parentElement;
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
    cleanCampusMenus();
    cleanCampusCards();
    cleanMaps();
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
  });
})();
