/* ==================================================
   Grupo Nostradamus - CTA global de matrícula y pago
   Unifica los accesos reales al flujo de preinscripción.
   WhatsApp queda reservado para orientación e informes.
================================================== */
(function () {
  'use strict';

  var PRE = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var LABEL = 'Matricularme y pagar';
  var SELECTOR = 'a[href*="preinscripcion.html"]';

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function isButtonLike(link) {
    if (!link || link.tagName !== 'A') return false;

    var className = clean(link.className).toLowerCase();
    var currentText = clean(link.textContent).toLowerCase();
    var role = clean(link.getAttribute('role')).toLowerCase();

    return className.indexOf('btn') !== -1 ||
      className.indexOf('button') !== -1 ||
      role === 'button' ||
      /preinscribirme|inscribirme|matricularme|asegurar mi vacante/.test(currentText);
  }

  function setPaymentDestination(link, source) {
    if (!link) return;

    link.href = PRE;
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.setAttribute('data-nostra-pre-source', source || 'sitio');
  }

  function updateButton(link) {
    if (!link || !link.matches || !link.matches(SELECTOR) || !isButtonLike(link)) return;

    var icon = link.querySelector('i,svg');
    var iconHtml = icon ? icon.outerHTML : '';
    var alreadyCorrect = clean(link.textContent) === LABEL &&
      link.getAttribute('data-nostra-payment-cta') === '1';

    if (!alreadyCorrect) {
      link.innerHTML = LABEL + (iconHtml ? ' ' + iconHtml : '');
      link.setAttribute('aria-label', LABEL);
      link.setAttribute('data-nostra-payment-cta', '1');
    }
  }

  function normalizeHomeEntryPoints() {
    var path = window.location.pathname.toLowerCase();
    var file = path.split('/').pop() || 'index.html';
    var isHome = path === '/' || file === 'index.html' || file === '';
    if (!isHome) return;

    var headerButton = document.querySelector('.header-button a.th-btn');
    if (headerButton) {
      setPaymentDestination(headerButton, 'cabecera');
      updateButton(headerButton);
    }

    var heroActions = document.querySelector('#hero .nostra-home-actions');
    if (!heroActions) return;

    var primary = heroActions.querySelector('a.th-btn.style3') || heroActions.querySelector('a');
    if (primary) {
      primary.id = 'nostra-pre-hero';
      setPaymentDestination(primary, 'hero');
      updateButton(primary);
    }

    Array.prototype.forEach.call(
      heroActions.querySelectorAll('a[href*="preinscripcion.html"]'),
      function (link) {
        if (primary && link !== primary) link.remove();
      }
    );
  }

  function apply(root) {
    normalizeHomeEntryPoints();

    var scope = root && root.querySelectorAll ? root : document;
    Array.prototype.forEach.call(scope.querySelectorAll(SELECTOR), updateButton);
    if (scope.matches && scope.matches(SELECTOR)) updateButton(scope);
  }

  function start() {
    apply(document);

    [250, 700, 1400, 2600].forEach(function (delay) {
      window.setTimeout(function () { apply(document); }, delay);
    });

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (node && node.nodeType === 1) apply(node);
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.setTimeout(function () { observer.disconnect(); }, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();