/* ==================================================
   Grupo Nostradamus - Enlaces legales globales
   Inserta accesos visibles a términos, devoluciones, privacidad y reclamos.
================================================== */
(function () {
  'use strict';

  var LINKS = [
    { href:'terminos-y-condiciones.html', label:'Términos y condiciones' },
    { href:'politica-cambios-devoluciones.html', label:'Cambios y devoluciones' },
    { href:'politica-de-privacidad.html', label:'Política de privacidad' },
    { href:'libro-de-reclamaciones.html', label:'Libro de Reclamaciones' }
  ];

  function hasLink(container, href) {
    return !!container.querySelector('a[href="' + href + '"]');
  }

  function apply() {
    var containers = document.querySelectorAll('.nfh-bottom-links');
    if (!containers.length) return false;

    Array.prototype.forEach.call(containers, function (container) {
      LINKS.forEach(function (item) {
        if (hasLink(container, item.href)) return;

        var link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        link.setAttribute('data-nostra-legal-link', '1');
        container.appendChild(link);
      });
    });

    return true;
  }

  function start() {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (apply() || attempts >= 40) window.clearInterval(timer);
    }, 250);

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();