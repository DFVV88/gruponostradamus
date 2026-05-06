/* ==================================================
   Grupo Nostradamus - Slide 2 video background fix
   Objetivo: agrandar y centrar el fondo del slide 2 sin tocar slide 1.
================================================== */
(function () {
  function injectStyle() {
    if (document.getElementById('nostra-video-slide-2-zoom-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-video-slide-2-zoom-fix-style';
    style.textContent = `
      /* Ajuste solo para el slide 2 convertido en miniatura clickeable */
      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        background-size: 128% auto !important;
        background-position: center 34% !important;
        background-repeat: no-repeat !important;
      }

      #hero .nostra-video-slide-fix::before {
        background: linear-gradient(180deg, rgba(2,7,13,.42) 0%, rgba(2,7,13,.36) 44%, rgba(2,7,13,.58) 100%) !important;
      }

      @media (max-width: 1199px) {
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 145% auto !important;
          background-position: center 32% !important;
        }
      }

      @media (max-width: 767px) {
        #hero .nostra-video-slide-fix,
        #hero .slick-slide.nostra-video-slide-fix,
        #hero .nostra-video-slide-fix.th-hero-slide {
          min-height: 320px !important;
          height: auto !important;
          overflow: hidden !important;
        }

        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          min-height: 320px !important;
          height: 320px !important;
          background-size: 190% auto !important;
          background-position: center 30% !important;
        }

        #hero .nostra-video-slide-fix .container {
          min-height: 320px !important;
          height: 320px !important;
          padding-top: 18px !important;
          padding-bottom: 18px !important;
          align-items: center !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 30px) !important;
          max-width: 430px !important;
          transform: translateY(0) !important;
        }
      }

      @media (max-width: 430px) {
        #hero .nostra-video-slide-fix,
        #hero .slick-slide.nostra-video-slide-fix,
        #hero .nostra-video-slide-fix.th-hero-slide {
          min-height: 292px !important;
        }

        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider,
        #hero .nostra-video-slide-fix .container {
          min-height: 292px !important;
          height: 292px !important;
        }

        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 220% auto !important;
          background-position: center 30% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function refreshSlider() {
    if (!window.jQuery) return;
    var slider = window.jQuery('#heroSlide6');
    if (!slider.length || !slider.hasClass('slick-initialized')) return;
    try {
      slider.slick('setPosition');
      slider.slick('refresh');
    } catch (error) {}
  }

  function init() {
    injectStyle();
    refreshSlider();
    setTimeout(refreshSlider, 350);
    setTimeout(refreshSlider, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
})();
