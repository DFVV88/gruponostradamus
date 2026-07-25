/* ==================================================
   Grupo Nostradamus - Corrección CTA principal del hero
   Convierte el botón principal en acceso real a matrícula y pago.
================================================== */
(function () {
  'use strict';

  var PRE = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var LABEL = 'Matricularme y pagar';

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function apply() {
    var actions = document.querySelector('#hero .nostra-home-actions');
    if (!actions) return false;

    var primary = actions.querySelector('a.th-btn.style3') || actions.querySelector('a');
    if (!primary) return false;

    primary.id = 'nostra-pre-hero';
    primary.href = PRE;
    primary.removeAttribute('target');
    primary.removeAttribute('rel');
    primary.setAttribute('data-nostra-pre-source', 'hero');
    primary.setAttribute('data-nostra-payment-cta', '1');
    primary.setAttribute('aria-label', LABEL);
    primary.innerHTML = LABEL;

    Array.prototype.forEach.call(actions.querySelectorAll('a[href*="preinscripcion.html"]'), function (link) {
      if (link !== primary) link.remove();
    });

    return true;
  }

  function start() {
    apply();
    [250, 700, 1400, 2600].forEach(function (delay) {
      window.setTimeout(apply, delay);
    });

    var hero = document.getElementById('hero');
    if (!hero) return;

    var observer = new MutationObserver(function () {
      apply();
    });

    observer.observe(hero, { childList:true, subtree:true, attributes:true, attributeFilter:['href','class'] });
    window.setTimeout(function () { observer.disconnect(); }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();
