/* ==================================================
   Grupo Nostradamus - Cargador global optimizado
   Carga únicamente los módulos necesarios por página.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var file = path.split('/').pop() || 'index.html';
  var isIq100 = path.indexOf('iq100.html') !== -1;
  var isHomePage = path === '/' || file === 'index.html' || file === '';
  var isCiclosCatalog = file === 'ciclos.html' || path.endsWith('/ciclos');
  var isCycleDetail = /^ciclo-.*\.html$/.test(file);
  var isNewsPage = file === 'blog.html' || file === 'noticias.html';
  var isCachimbosPage = file === 'cachimbos.html';
  var isCommercialLanding = file === 'ingresa-uni.html';

  if (isIq100) return;

  var VERSION = '2026-08-11-weekend-sync';
  var ADSENSE_CLIENT = 'ca-pub-9810053992087127';

  function assetAlreadyLoaded(urlPart) {
    return !!document.querySelector('script[src*="' + urlPart + '"]');
  }

  function loadJS(src) {
    var cleanSrc = src.split('?')[0];
    if (assetAlreadyLoaded(cleanSrc)) return;

    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadModules(modules) {
    modules.forEach(function (name) {
      loadJS('assets/js/' + name + '?v=' + VERSION);
    });
  }

  function loadAdSense() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  function addPrehideStyle(id, css) {
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function prehidePageContent() {
    if (isCiclosCatalog) {
      addPrehideStyle(
        'nostra-ciclos-legacy-prehide',
        '#course-sec .tab-menu1.filter-menu-active,#course-sec .filter-active{display:none!important;visibility:hidden!important}'
      );
    }

    if (!isHomePage) return;

    addPrehideStyle(
      'nostra-plataforma-legacy-prehide',
      '#nostra-plataforma-home{overflow-anchor:none!important}#nostra-plataforma-home:not([data-np-ready="1"]){min-height:360px!important}#nostra-plataforma-home:not([data-np-ready="1"])>.container>:not(.title-area){display:none!important}'
    );
    addPrehideStyle(
      'nostra-home-cycles-prehide',
      '#course-sec{overflow-anchor:none!important}#course-sec:not([data-nhc-ready="1"]){min-height:330px!important}#course-sec:not([data-nhc-ready="1"]) .filter-active{display:none!important;visibility:hidden!important}'
    );
    addPrehideStyle(
      'nostra-home-news-prehide',
      '#blog-sec{overflow-anchor:none!important}#blog-sec:not([data-nin-ready="1"]){min-height:330px!important}#blog-sec:not([data-nin-ready="1"])>.container>*{visibility:hidden!important}'
    );
    addPrehideStyle(
      'nostra-home-results-prehide',
      '.counter-area-2{overflow-anchor:none!important}.counter-area-2:not([data-nostra-results-ready="1"]){min-height:390px!important}.counter-area-2:not([data-nostra-results-ready="1"])>.container{visibility:hidden!important}'
    );
  }

  function loadEarlyPageModules() {
    if (isHomePage) {
      loadModules([
        'nostra-index-resultados-pro.js',
        'nostra-home-ruta-premium.js',
        'nostra-plataforma-accordion.js',
        'nostra-home-cycles-accordion.js',
        'nostra-index-noticias-pro.js'
      ]);
    }

    if (isCiclosCatalog) {
      loadModules([
        'nostra-ciclos-catalog-dynamic.js',
        'nostra-ciclos-cards-premium.js',
        'nostra-ciclos-links.js'
      ]);
    }
  }

  function loadGlobalModules() {
    loadModules([
      'nostra-activity-controller.js',
      'nostra-analytics.js',
      'nostra-seo-meta.js',
      'nostra-schema-jsonld.js',
      'nostra-ortografia-global.js',
      'nostra-ortografia-extra.js',
      'shared-header.js',
      'nostra-cycle-menu-labels.js',
      'nostrachat-menu-link.js',
      'nostra-cuenta-menu-link.js',
      'nostra-contact-whatsapp-fix.js',
      'nostra-uni-campus-only.js',
      'nostra-button-fix.js',
      'nostra-whatsapp-inscripcion.js',
      'nostra-content-polish.js',
      'nostra-page-polish.js',
      'nostra-mobile-menu-pro.js',
      'nostra-mobile-menu-clean-fix.js',
      'nostra-performance-pro.js',
      'nostra-social-seo.js',
      'nostra-header-footer-premium.js',
      'nostra-live-classes-fix.js',
      'nostra-registro-button.js',
      'nostra-matricula-pago-cta.js',
      'nostra-footer-universal.js'
    ]);
  }

  function loadHomeModules() {
    if (!isHomePage) return;

    loadModules([
      'nostrachat-index-section.js',
      'nostra-ingresantes-counter-pro.js',
      'nostra-faq-index-pro.js',
      'nostra-grid-fix.js',
      'nostra-offer-section-fix.js',
      'nostra-offer-uniform-override.js',
      'nostra-offer-hard-uniform.js',
      'nostra-video-slide-2-zoom-fix.js',
      'nostra-cuenta-home-button.js',
      'nostra-index-preinscripcion-cta.js',
      'nostra-index-contacto-v2.js'
    ]);
  }

  function loadCycleDetailModules() {
    if (!isCycleDetail) return;

    loadModules([
      'nostra-premium-uni-line.js',
      'nostra-ciclo-detalle-pro.js',
      'nostra-offer-section-fix.js',
      'nostra-offer-uniform-override.js',
      'nostra-offer-hard-uniform.js',
      'nostra-cycle-pricing.js',
      'nostra-cycle-description-meta.js',
      'nostra-cycle-sidebar-premium.js'
    ]);
  }

  function loadOtherPageModules() {
    if (isNewsPage) loadModules(['nostra-noticias-uni-pro.js']);
    if (isCachimbosPage) loadModules(['nostra-cachimbos-tabs.js']);

    if (isCommercialLanding) {
      loadModules([
        'nostra-offer-section-fix.js',
        'nostra-offer-uniform-override.js',
        'nostra-offer-hard-uniform.js'
      ]);
    }
  }

  function init() {
    prehidePageContent();
    loadEarlyPageModules();
    loadGlobalModules();
    loadHomeModules();
    loadCycleDetailModules();
    loadOtherPageModules();
    loadAdSense();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
