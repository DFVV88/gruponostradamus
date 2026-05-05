/* ==================================================
   INDEX - Corrección slide YouTube
   Evita franja vacía grande cuando aparece el iframe.
================================================== */
(function () {
  function injectStyles() {
    if (document.getElementById('nostra-index-video-fix-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-index-video-fix-style';
    style.textContent = `
      /* Slide 2: video YouTube dentro del hero */
      #hero .contenido-min-slider-tovideo,
      #hero .contenido-max-slider.contenido-min-slider-tovideo {
        width: min(980px, 92vw) !important;
        max-width: 980px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        z-index: 3 !important;
      }

      #hero .contenido-min-slider-tovideo .frame-video,
      #hero iframe.frame-video {
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: min(62vh, 560px) !important;
        border-radius: 24px !important;
        border: 1px solid rgba(255,255,255,.28) !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.46), 0 0 32px rgba(0,194,209,.22) !important;
        background: #02070d !important;
        overflow: hidden !important;
      }

      #hero .th-hero-slide:has(.frame-video) {
        min-height: auto !important;
      }

      #hero .th-hero-slide:has(.frame-video) .container {
        min-height: clamp(520px, 72vh, 720px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding-top: 28px !important;
        padding-bottom: 28px !important;
      }

      #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
      #hero .th-hero-slide:has(.frame-video) .img-min-slider {
        min-height: clamp(520px, 72vh, 720px) !important;
      }

      @media (max-width: 991px) {
        #hero .th-hero-slide:has(.frame-video) .container,
        #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
        #hero .th-hero-slide:has(.frame-video) .img-min-slider {
          min-height: 520px !important;
        }

        #hero .contenido-min-slider-tovideo,
        #hero .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(94vw, 760px) !important;
        }
      }

      @media (max-width: 767px) {
        #hero .th-hero-slide:has(.frame-video) .container,
        #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
        #hero .th-hero-slide:has(.frame-video) .img-min-slider {
          min-height: 430px !important;
        }

        #hero .th-hero-slide:has(.frame-video) .container {
          padding-top: 20px !important;
          padding-bottom: 34px !important;
        }

        #hero .contenido-min-slider-tovideo,
        #hero .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 24px) !important;
        }

        #hero .contenido-min-slider-tovideo .frame-video,
        #hero iframe.frame-video {
          border-radius: 16px !important;
          max-height: none !important;
          box-shadow: 0 18px 44px rgba(0,0,0,.42), 0 0 22px rgba(0,194,209,.18) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function run() {
    var path = (window.location.pathname || '').toLowerCase();
    if (!(path === '/' || path.endsWith('/index.html') || path.endsWith('/'))) return;
    injectStyles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
