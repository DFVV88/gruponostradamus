/* ==================================================
   INDEX - Corrección slide YouTube
   PC: miniatura completa y más arriba.
   Móvil: se conserva el comportamiento actual.
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
        width: min(760px, 64vw) !important;
        max-width: 760px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        z-index: 4 !important;
        transform: translateY(-95px) !important;
      }

      #hero .contenido-min-slider-tovideo .frame-video,
      #hero iframe.frame-video {
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: 428px !important;
        border-radius: 22px !important;
        border: 1px solid rgba(255,255,255,.28) !important;
        box-shadow: 0 22px 60px rgba(0,0,0,.44), 0 0 28px rgba(0,194,209,.20) !important;
        background: #02070d !important;
        overflow: hidden !important;
      }

      #hero .th-hero-slide:has(.frame-video) {
        min-height: 690px !important;
        height: 690px !important;
        max-height: 690px !important;
      }

      #hero .th-hero-slide:has(.frame-video) .container {
        min-height: 690px !important;
        height: 690px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
      #hero .th-hero-slide:has(.frame-video) .img-min-slider {
        min-height: 690px !important;
        height: 690px !important;
      }

      @media (max-width: 1199px) {
        #hero .contenido-min-slider-tovideo,
        #hero .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(720px, 72vw) !important;
          max-width: 720px !important;
          transform: translateY(-70px) !important;
        }
      }

      @media (max-width: 991px) {
        #hero .th-hero-slide:has(.frame-video),
        #hero .th-hero-slide:has(.frame-video) .container,
        #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
        #hero .th-hero-slide:has(.frame-video) .img-min-slider {
          min-height: 560px !important;
          height: 560px !important;
          max-height: 560px !important;
        }

        #hero .contenido-min-slider-tovideo,
        #hero .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(620px, 84vw) !important;
          max-width: 620px !important;
          transform: translateY(-42px) !important;
        }
      }

      @media (max-width: 767px) {
        #hero .th-hero-slide:has(.frame-video),
        #hero .th-hero-slide:has(.frame-video) .container,
        #hero .th-hero-slide:has(.frame-video) .th-hero-bg,
        #hero .th-hero-slide:has(.frame-video) .img-min-slider {
          min-height: 520px !important;
          height: 520px !important;
          max-height: 520px !important;
        }

        #hero .th-hero-slide:has(.frame-video) .container {
          padding-top: 66px !important;
          padding-bottom: 34px !important;
          align-items: flex-start !important;
        }

        #hero .contenido-min-slider-tovideo,
        #hero .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 34px) !important;
          max-width: 410px !important;
          transform: translateY(-28px) !important;
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

  function forcePosition() {
    if (window.innerWidth < 768) return;
    var el = document.querySelector('#hero .contenido-max-slider.contenido-min-slider-tovideo, #hero .contenido-min-slider-tovideo');
    if (!el) return;
    el.style.setProperty('width', window.innerWidth < 1200 ? 'min(720px, 72vw)' : 'min(760px, 64vw)', 'important');
    el.style.setProperty('max-width', window.innerWidth < 1200 ? '720px' : '760px', 'important');
    el.style.setProperty('margin', '0 auto', 'important');
    el.style.setProperty('transform', window.innerWidth < 1200 ? 'translateY(-70px)' : 'translateY(-95px)', 'important');
    el.style.setProperty('position', 'relative', 'important');
    el.style.setProperty('z-index', '4', 'important');
  }

  function run() {
    var path = (window.location.pathname || '').toLowerCase();
    if (!(path === '/' || path.endsWith('/index.html') || path.endsWith('/'))) return;
    injectStyles();
    forcePosition();
    setTimeout(forcePosition, 500);
    setTimeout(forcePosition, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();