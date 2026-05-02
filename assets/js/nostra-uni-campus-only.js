/* ==================================================
   Grupo Nostradamus - Solo Sede UNI
   Elimina visualmente referencias, tarjetas y mapas de sedes antiguas:
   Los Olivos y Chorrillos. Mantiene únicamente Sede UNI.
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
      .nostra-uni-campus-focus .process-card2_title,
      .nostra-uni-campus-focus .box-title,
      .nostra-uni-campus-focus h2,
      .nostra-uni-campus-focus h3{
        text-align:center;
      }
    `;
    document.head.appendChild(style);
  }

  function closestCampusBlock(el) {
    if (!el || !el.closest) return null;
    return el.closest('.process-card2-wrap, .col-sm-6, .col-lg-4, .col-md-6, .col-xl-4, .contact-info, .contact-card, .feature-card, .location-card, .map-card, .widget, .th-blog, .course-single, .row > div') || el.parentElement;
  }

  function hideOldCampusTextBlocks() {
    var candidates = document.querySelectorAll('body *');
    candidates.forEach(function (el) {
      if (!el || !el.textContent) return;
      if (!OLD_CAMPUS.test(el.textContent)) return;

      var block = closestCampusBlock(el);
      if (!block || block === document.body || block === document.documentElement) return;

      var blockText = block.textContent || '';
      if (UNI_CAMPUS.test(blockText) && !OLD_CAMPUS.test(blockText.replace(/Sede\s+UNI/ig, ''))) return;

      block.classList.add('nostra-campus-hidden');
    });
  }

  function cleanCampusMenus() {
    document.querySelectorAll('a, li').forEach(function (el) {
      if (OLD_CAMPUS.test(el.textContent || '')) {
        var li = el.closest('li') || el;
        li.classList.add('nostra-campus-hidden');
      }
    });

    document.querySelectorAll('a[href*="sedes.html"]').forEach(function (a) {
      var txt = (a.textContent || '').trim().toLowerCase();
      if (txt === 'los olivos' || txt === 'chorrillos') {
        (a.closest('li') || a).classList.add('nostra-campus-hidden');
      }
    });
  }

  function cleanMaps() {
    var iframes = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'));
    if (!iframes.length) return;

    var mapBlocks = iframes.map(function (iframe) {
      return iframe.closest('.col-md-6, .col-lg-4, .col-xl-4, .col-sm-6, .contact-map, .map-sec, .map-area, .location-map, .row > div, section, div') || iframe;
    }).filter(Boolean);

    var uniqueBlocks = [];
    mapBlocks.forEach(function (block) {
      if (uniqueBlocks.indexOf(block) === -1) uniqueBlocks.push(block);
    });

    uniqueBlocks.forEach(function (block) {
      var text = block.textContent || '';
      var html = block.innerHTML || '';

      if (OLD_CAMPUS.test(text) || OLD_CAMPUS.test(html)) {
        block.classList.add('nostra-campus-hidden');
      }
    });

    // Si todavía quedan varios mapas y ninguno indica claramente UNI,
    // conserva el que esté más cerca de textos de sede UNI / Gerardo Unger.
    var visibleIframes = Array.from(document.querySelectorAll('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="googleusercontent"]'))
      .filter(function (iframe) {
        return !iframe.closest('.nostra-campus-hidden');
      });

    if (visibleIframes.length > 1) {
      var uniIframe = visibleIframes.find(function (iframe) {
        var block = iframe.closest('section, .row, .container, .contact-map, .map-sec, div') || iframe.parentElement;
        var context = block ? (block.textContent || '') + ' ' + (block.innerHTML || '') : '';
        return UNI_CAMPUS.test(context);
      });

      visibleIframes.forEach(function (iframe) {
        if (uniIframe && iframe === uniIframe) return;
        var block = iframe.closest('.col-md-6, .col-lg-4, .col-xl-4, .col-sm-6, .contact-map, .map-sec, .map-area, .location-map, .row > div, div') || iframe;
        if (block) block.classList.add('nostra-campus-hidden');
      });
    }
  }

  function focusUniSections() {
    document.querySelectorAll('section, .container').forEach(function (section) {
      var text = section.textContent || '';
      if (UNI_CAMPUS.test(text)) {
        section.classList.add('nostra-uni-campus-focus');
      }
    });
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
    hideOldCampusTextBlocks();
    cleanMaps();
    focusUniSections();
    renameCampusCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 400);
    setTimeout(init, 1200);
    setTimeout(init, 2500);
  });
})();
