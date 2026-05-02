/* ==================================================
   Grupo Nostradamus - Contacto directo a WhatsApp
   Evita enviar al usuario a contacto.html desde el header.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var whatsappUrl = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, quiero solicitar informes.');

  function patchContactLinks() {
    document.querySelectorAll('a').forEach(function (a) {
      var label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var href = (a.getAttribute('href') || '').toLowerCase();

      var isHeaderContact = a.closest('.nostra-premium-header') && label === 'contacto';
      var isOldHeaderContact = (label === 'contacto') && (href.indexOf('contacto.html') !== -1 || href === 'contacto');

      if (isHeaderContact || isOldHeaderContact) {
        a.setAttribute('href', whatsappUrl);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('aria-label', 'Solicitar informes por WhatsApp');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchContactLinks);
  } else {
    patchContactLinks();
  }

  window.addEventListener('load', function () {
    patchContactLinks();
    setTimeout(patchContactLinks, 500);
    setTimeout(patchContactLinks, 1500);
  });
})();
