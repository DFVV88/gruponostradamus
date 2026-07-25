/* ==================================================
   Grupo Nostradamus - CTA global de matrícula y pago
   Unifica únicamente los botones que realmente llevan a la preinscripción.
================================================== */
(function () {
  'use strict';

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
      /preinscribirme|inscribirme|matricularme/.test(currentText);
  }

  function isPreinscriptionLink(link) {
    return !!(link && link.matches && link.matches(SELECTOR));
  }

  function updateButton(link) {
    if (!isPreinscriptionLink(link) || !isButtonLike(link)) return;

    var icon = link.querySelector('i,svg');
    var iconHtml = icon ? icon.outerHTML : '';
    var currentText = clean(link.textContent);

    if (currentText === LABEL && link.getAttribute('data-nostra-payment-cta') === '1') return;

    link.innerHTML = LABEL + (iconHtml ? ' ' + iconHtml : '');
    link.setAttribute('aria-label', LABEL);
    link.setAttribute('data-nostra-payment-cta', '1');
  }

  function apply(root) {
    var scope = root && root.querySelectorAll ? root : document;
    Array.prototype.forEach.call(scope.querySelectorAll(SELECTOR), updateButton);

    if (scope.matches && scope.matches(SELECTOR)) updateButton(scope);
  }

  function start() {
    apply(document);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') {
          if (isPreinscriptionLink(mutation.target)) updateButton(mutation.target);
          return;
        }

        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (node && node.nodeType === 1) apply(node);
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();
