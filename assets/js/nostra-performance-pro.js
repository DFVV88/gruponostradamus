/* ==================================================
   Grupo Nostradamus - Performance PRO
   Mejora velocidad percibida en móvil y escritorio.
   - Lazy loading de imágenes e iframes
   - Optimización de videos embebidos
   - Mejora CLS en imágenes sin dimensiones
   - No afecta iq100.html
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function optimizeImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

      var src = img.getAttribute('src') || '';
      var alt = img.getAttribute('alt') || '';

      if (!alt.trim() || alt.length > 150 || alt.indexOf('Grupo de estudio Nostradamus, 15 años') !== -1) {
        if (src.indexOf('logo') !== -1) {
          img.setAttribute('alt', 'Grupo de Estudio Nostradamus');
        } else if (src.indexOf('ciclo') !== -1 || src.indexOf('course') !== -1) {
          img.setAttribute('alt', 'Preparación UNI en Grupo Nostradamus');
        } else if (src.indexOf('docente') !== -1 || src.indexOf('teacher') !== -1) {
          img.setAttribute('alt', 'Docentes Grupo Nostradamus');
        } else {
          img.setAttribute('alt', 'Grupo Nostradamus preparación UNI');
        }
      }
    });
  }

  function optimizeIframes() {
    document.querySelectorAll('iframe').forEach(function (iframe) {
      if (!iframe.hasAttribute('loading')) iframe.setAttribute('loading', 'lazy');
      if (!iframe.hasAttribute('title') || !iframe.getAttribute('title').trim()) {
        iframe.setAttribute('title', 'Contenido multimedia Grupo Nostradamus');
      }

      var src = iframe.getAttribute('src') || '';
      if (src.indexOf('youtube.com/embed/') !== -1) {
        var cleanSrc = src;
        if (cleanSrc.indexOf('?') === -1) {
          cleanSrc += '?rel=0&modestbranding=1';
        } else {
          if (cleanSrc.indexOf('rel=') === -1) cleanSrc += '&rel=0';
          if (cleanSrc.indexOf('modestbranding=') === -1) cleanSrc += '&modestbranding=1';
        }
        iframe.setAttribute('src', cleanSrc);
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      }
    });
  }

  function injectPerformanceCSS() {
    if (document.getElementById('nostra-performance-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-performance-pro-style';
    style.textContent = `
      img{
        max-width:100%;
        height:auto;
      }
      iframe{
        max-width:100%;
        border-radius:16px;
      }
      .course-single iframe,
      .course-img iframe{
        width:100% !important;
        aspect-ratio:16/9;
        height:auto !important;
        box-shadow:0 18px 42px rgba(0,0,0,.18),0 0 18px rgba(0,194,209,.10);
      }
      .preloader{
        transition:opacity .35s ease, visibility .35s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function improvePreloaderFallback() {
    setTimeout(function () {
      var preloader = document.querySelector('.preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(function () {
          if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 450);
      }
    }, 3200);
  }

  function init() {
    injectPerformanceCSS();
    optimizeImages();
    optimizeIframes();
    improvePreloaderFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    setTimeout(init, 400);
    setTimeout(init, 1500);
  });
})();
