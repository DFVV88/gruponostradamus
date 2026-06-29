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

  function fixSlider2YoutubePC() {
    if (window.innerWidth <= 767) return;

    var slide = document.querySelector('#hero iframe.frame-video');
    if (!slide) return;

    var box = slide.closest('.contenido-min-slider-tovideo') || slide.parentElement;
    var container = slide.closest('.container');

    if (container) {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('align-items', 'center', 'important');
      container.style.setProperty('justify-content', 'center', 'important');
      container.style.setProperty('padding-top', '0', 'important');
      container.style.setProperty('padding-bottom', '0', 'important');
      container.style.setProperty('overflow', 'visible', 'important');
    }

    if (box) {
      box.style.setProperty('width', window.innerWidth < 1200 ? 'min(720px, 72vw)' : 'min(760px, 64vw)', 'important');
      box.style.setProperty('max-width', window.innerWidth < 1200 ? '720px' : '760px', 'important');
      box.style.setProperty('height', 'auto', 'important');
      box.style.setProperty('min-height', '0', 'important');
      box.style.setProperty('margin', '0 auto', 'important');
      box.style.setProperty('padding', '0', 'important');
      box.style.setProperty('position', 'relative', 'important');
      box.style.setProperty('overflow', 'visible', 'important');
      box.style.setProperty('display', 'flex', 'important');
      box.style.setProperty('align-items', 'center', 'important');
      box.style.setProperty('justify-content', 'center', 'important');
      box.style.setProperty('transform', 'translateY(-160px)', 'important');
      box.style.setProperty('z-index', '6', 'important');
    }

    slide.style.setProperty('display', 'block', 'important');
    slide.style.setProperty('width', '100%', 'important');
    slide.style.setProperty('height', 'auto', 'important');
    slide.style.setProperty('aspect-ratio', '16 / 9', 'important');
    slide.style.setProperty('max-height', '428px', 'important');
    slide.style.setProperty('border-radius', '22px', 'important');
    slide.style.setProperty('position', 'relative', 'important');
    slide.style.setProperty('left', 'auto', 'important');
    slide.style.setProperty('transform', 'none', 'important');
    slide.style.setProperty('z-index', '7', 'important');
  }

  function startSlider2Fix() {
    fixSlider2YoutubePC();
    setTimeout(fixSlider2YoutubePC, 300);
    setTimeout(fixSlider2YoutubePC, 800);
    setTimeout(fixSlider2YoutubePC, 1500);
    setTimeout(fixSlider2YoutubePC, 2500);
    setTimeout(fixSlider2YoutubePC, 4000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    changeQ10LinksToWhatsApp();
    setTimeout(changeQ10LinksToWhatsApp, 400);
    setTimeout(changeQ10LinksToWhatsApp, 1200);
    startSlider2Fix();
  });

  window.addEventListener('load', function () {
    changeQ10LinksToWhatsApp();
    setTimeout(changeQ10LinksToWhatsApp, 800);
    startSlider2Fix();
  });

  window.addEventListener('resize', fixSlider2YoutubePC);
})();