/* ==================================================
   Grupo Nostradamus - Conversiones GA4
   ID GA4 correcto: G-SHGP6KW962
   Nota: GA4 y GTM se cargan directo en los HTML.
   Este archivo solo registra eventos comerciales.
================================================== */
(function () {
  var GA_ID = 'G-SHGP6KW962';

  function ensureGtagFallback() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function cleanText(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  function getLinkText(link) {
    return cleanText(link.getAttribute('aria-label') || link.textContent || link.href || 'sin_texto');
  }

  function getPageName() {
    var path = window.location.pathname || '/';
    if (path === '/' || path.endsWith('/')) return 'home';
    return path.split('/').pop().replace('.html', '') || 'home';
  }

  function sendEvent(eventName, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, Object.assign({
      send_to: GA_ID,
      page_name: getPageName(),
      page_path: window.location.pathname,
      page_url: window.location.href
    }, params || {}));
  }

  function trackWhatsAppClick(link) {
    sendEvent('click_whatsapp', {
      event_category: 'lead',
      event_label: getLinkText(link),
      link_url: link.href,
      conversion_type: 'whatsapp'
    });
  }

  function trackCommercialClick(link) {
    sendEvent('click_comercial', {
      event_category: 'conversion',
      event_label: getLinkText(link),
      link_url: link.href
    });
  }

  function trackLiveClassesClick(link) {
    sendEvent('click_clases_en_vivo', {
      event_category: 'engagement',
      event_label: getLinkText(link),
      link_url: link.href
    });
  }

  function installClickTracking() {
    if (window.__nostraClickTrackingInstalled) return;
    window.__nostraClickTrackingInstalled = true;

    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link || !link.href) return;

      var href = link.href.toLowerCase();
      var text = (link.textContent || '').toLowerCase();

      if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
        trackWhatsAppClick(link);
        return;
      }

      if (href.indexOf('clases-en-vivo.html') !== -1 || href.indexOf('teams.microsoft.com') !== -1 || text.indexOf('clases en vivo') !== -1) {
        trackLiveClassesClick(link);
        return;
      }

      if (
        text.indexOf('matric') !== -1 ||
        text.indexOf('informes') !== -1 ||
        text.indexOf('vacante') !== -1 ||
        text.indexOf('quiero ingresar') !== -1 ||
        href.indexOf('ingresa-uni.html') !== -1
      ) {
        trackCommercialClick(link);
      }
    }, true);
  }

  function init() {
    ensureGtagFallback();
    installClickTracking();
    sendEvent('nostra_analytics_ready', {
      event_category: 'system',
      event_label: 'conversiones_activas'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
