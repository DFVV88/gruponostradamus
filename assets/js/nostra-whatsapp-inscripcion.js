/* ==================================================
   Grupo Nostradamus - Q10 a WhatsApp
   Cambia automáticamente los enlaces antiguos de Q10 Preinscripción
   para que abran WhatsApp de informes/matrícula.
================================================== */
(function () {
  var Q10_PREINSCRIPCION = 'gruponostradamus.q10.com/Preinscripcion';
  var WHATSAPP_INSCRIPCION = 'https://wa.me/51993750351?text=Hola%20Grupo%20Nostradamus%2C%20quiero%20inscribirme%20y%20recibir%20informes%20sobre%20los%20ciclos%20acad%C3%A9micos.';

  function changeQ10LinksToWhatsApp() {
    var links = document.querySelectorAll('a[href]');

    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';

      if (href.indexOf(Q10_PREINSCRIPCION) !== -1) {
        link.setAttribute('href', WHATSAPP_INSCRIPCION);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('data-nostra-whatsapp-inscripcion', 'true');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    changeQ10LinksToWhatsApp();
    setTimeout(changeQ10LinksToWhatsApp, 400);
    setTimeout(changeQ10LinksToWhatsApp, 1200);
  });

  window.addEventListener('load', function () {
    changeQ10LinksToWhatsApp();
    setTimeout(changeQ10LinksToWhatsApp, 800);
  });
})();