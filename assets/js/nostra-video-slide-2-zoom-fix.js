/* ==================================================
   Grupo Nostradamus - Slide 2 video background + height fix
   Objetivo: eliminar el espacio vacío del slide 2 sin tocar slide 1.
================================================== */
(function () {
  function getTargetHeight() {
    if (window.innerWidth <= 430) return 292;
    if (window.innerWidth <= 767) return 320;
    if (window.innerWidth <= 1199) return 500;
    return 560;
  }

  function injectStyle() {
    if (document.getElementById('nostra-video-slide-2-zoom-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-video-slide-2-zoom-fix-style';
    style.textContent = `
      /* Cuando el carrusel está en el slide 2, bajamos la altura real del hero */
      #hero.nostra-video-active,
      #hero.nostra-video-active .hero-6,
      #hero.nostra-video-active #heroSlide6,
      #hero.nostra-video-active .slick-list,
      #hero.nostra-video-active .slick-track,
      #hero.nostra-video-active .slick-slide,
      #hero.nostra-video-active .slick-slide > div {
        min-height: 560px !important;
        height: 560px !important;
        max-height: 560px !important;
        overflow: hidden !important;
      }

      #hero.nostra-video-active .nostra-video-slide-fix,
      #hero.nostra-video-active .slick-current.nostra-video-slide-fix,
      #hero.nostra-video-active .nostra-video-slide-fix.th-hero-slide {
        min-height: 560px !important;
        height: 560px !important;
        max-height: 560px !important;
        overflow: hidden !important;
      }

      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        min-height: 560px !important;
        height: 560px !important;
        background-size: 135% auto !important;
        background-position: center 46% !important;
        background-repeat: no-repeat !important;
      }

      #hero .nostra-video-slide-fix::before {
        background: linear-gradient(180deg, rgba(2,7,13,.38) 0%, rgba(2,7,13,.34) 44%, rgba(2,7,13,.48) 100%) !important;
      }

      #hero .nostra-video-slide-fix .container {
        min-height: 560px !important;
        height: 560px !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-top: 32px !important;
        padding-bottom: 24px !important;
        overflow: visible !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
        width: min(760px, 76vw) !important;
        max-width: 760px !important;
        margin: 0 auto !important;
        transform: translateY(0) !important;
      }

      @media (max-width: 1199px) {
        #hero.nostra-video-active,
        #hero.nostra-video-active .hero-6,
        #hero.nostra-video-active #heroSlide6,
        #hero.nostra-video-active .slick-list,
        #hero.nostra-video-active .slick-track,
        #hero.nostra-video-active .slick-slide,
        #hero.nostra-video-active .slick-slide > div,
        #hero.nostra-video-active .nostra-video-slide-fix,
        #hero.nostra-video-active .slick-current.nostra-video-slide-fix,
        #hero.nostra-video-active .nostra-video-slide-fix.th-hero-slide,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider,
        #hero .nostra-video-slide-fix .container {
          min-height: 500px !important;
          height: 500px !important;
          max-height: 500px !important;
        }
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 150% auto !important;
          background-position: center 45% !important;
        }
        #hero .nostra-video-slide-fix .container {
          padding-top: 28px !important;
          padding-bottom: 22px !important;
        }
      }

      @media (max-width: 767px) {
        #hero.nostra-video-active,
        #hero.nostra-video-active .hero-6,
        #hero.nostra-video-active #heroSlide6,
        #hero.nostra-video-active .slick-list,
        #hero.nostra-video-active .slick-track,
        #hero.nostra-video-active .slick-slide,
        #hero.nostra-video-active .slick-slide > div,
        #hero.nostra-video-active .nostra-video-slide-fix,
        #hero.nostra-video-active .slick-current.nostra-video-slide-fix,
        #hero.nostra-video-active .nostra-video-slide-fix.th-hero-slide,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider,
        #hero .nostra-video-slide-fix .container {
          min-height: 320px !important;
          height: 320px !important;
          max-height: 320px !important;
        }
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 190% auto !important;
          background-position: center 35% !important;
        }
        #hero .nostra-video-slide-fix .container {
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
        #hero.nostra-video-active,
        #hero.nostra-video-active .hero-6,
        #hero.nostra-video-active #heroSlide6,
        #hero.nostra-video-active .slick-list,
        #hero.nostra-video-active .slick-track,
        #hero.nostra-video-active .slick-slide,
        #hero.nostra-video-active .slick-slide > div,
        #hero.nostra-video-active .nostra-video-slide-fix,
        #hero.nostra-video-active .slick-current.nostra-video-slide-fix,
        #hero.nostra-video-active .nostra-video-slide-fix.th-hero-slide,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider,
        #hero .nostra-video-slide-fix .container {
          min-height: 292px !important;
          height: 292px !important;
          max-height: 292px !important;
        }
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 220% auto !important;
          background-position: center 35% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setVideoState() {
    var hero = document.getElementById('hero');
    var sliderEl = document.getElementById('heroSlide6');
    if (!hero || !sliderEl) return;

    var current = sliderEl.querySelector('.slick-current');
    var isVideo = current && current.classList.contains('nostra-video-slide-fix');
    hero.classList.toggle('nostra-video-active', !!isVideo);

    if (isVideo) {
      var h = getTargetHeight() + 'px';
      var list = sliderEl.querySelector('.slick-list');
      var track = sliderEl.querySelector('.slick-track');
      if (list) list.style.height = h;
      if (track) track.style.height = h;
    } else {
      var listReset = sliderEl.querySelector('.slick-list');
      var trackReset = sliderEl.querySelector('.slick-track');
      if (listReset) listReset.style.height = '';
      if (trackReset) trackReset.style.height = '';
    }
  }

  function refreshSlider() {
    setVideoState();
    if (!window.jQuery) return;
    var slider = window.jQuery('#heroSlide6');
    if (!slider.length || !slider.hasClass('slick-initialized')) return;
    try { slider.slick('setPosition'); } catch (error) {}
  }

  function bindSlider() {
    if (!window.jQuery) return;
    var slider = window.jQuery('#heroSlide6');
    if (!slider.length || slider.data('nostraVideoHeightFixBound')) return;
    slider.data('nostraVideoHeightFixBound', true);
    slider.on('init afterChange setPosition', function () {
      setTimeout(refreshSlider, 40);
    });
  }

  function init() {
    injectStyle();
    bindSlider();
    refreshSlider();
    setTimeout(refreshSlider, 300);
    setTimeout(refreshSlider, 900);
    setTimeout(refreshSlider, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
  window.addEventListener('resize', refreshSlider);
})();
