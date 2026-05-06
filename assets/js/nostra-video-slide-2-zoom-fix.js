/* ==================================================
   Grupo Nostradamus - Slide 2 thumbnail restore
================================================== */
(function () {
  var VIDEO_ID = 'Gi-ZXzQSIDI';

  function injectStyle() {
    var old = document.getElementById('nostra-video-slide-2-zoom-fix-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-video-slide-2-zoom-fix-style';
    style.textContent = `
      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        background-size: cover !important;
        background-position: center 18% !important;
        background-repeat: no-repeat !important;
      }

      #hero.nostra-video-active,
      #hero.nostra-video-active .hero-6,
      #hero.nostra-video-active #heroSlide6,
      #hero.nostra-video-active .slick-list,
      #hero.nostra-video-active .slick-track,
      #hero.nostra-video-active .slick-slide,
      #hero.nostra-video-active .slick-slide > div {
        min-height: 680px !important;
        height: 680px !important;
      }

      #hero .nostra-video-slide-fix .container {
        min-height: 680px !important;
        height: 680px !important;
        position: relative !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
        position: absolute !important;
        left: 50% !important;
        top: 58% !important;
        transform: translate(-50%, -50%) !important;
        width: min(720px, 64vw) !important;
        max-width: 720px !important;
        z-index: 100 !important;
        display: block !important;
      }

      .nostra-video-thumb-restore {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16/9 !important;
        border-radius: 22px !important;
        overflow: hidden !important;
        border: 1px solid rgba(255,255,255,.35) !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.45) !important;
        background: #000 !important;
      }

      .nostra-video-thumb-restore img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .nostra-video-thumb-restore .play {
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 86px !important;
        height: 60px !important;
        border-radius: 16px !important;
        background: #ff0000 !important;
        color: #fff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 34px !important;
        font-weight: bold !important;
      }

      @media (max-width: 767px) {
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 190% auto !important;
          background-position: center 16% !important;
        }

        #hero.nostra-video-active,
        #hero.nostra-video-active .hero-6,
        #hero.nostra-video-active #heroSlide6,
        #hero.nostra-video-active .slick-list,
        #hero.nostra-video-active .slick-track,
        #hero.nostra-video-active .slick-slide,
        #hero.nostra-video-active .slick-slide > div,
        #hero .nostra-video-slide-fix .container {
          min-height: 360px !important;
          height: 360px !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 30px) !important;
          max-width: 430px !important;
          top: 50% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function restoreThumb() {
    document.querySelectorAll('.contenido-min-slider-tovideo').forEach(function (box) {
      if (box.querySelector('.nostra-video-thumb-restore')) return;

      var iframe = box.querySelector('iframe');
      if (iframe) iframe.remove();

      var a = document.createElement('a');
      a.className = 'nostra-video-thumb-restore';
      a.href = 'https://www.youtube.com/watch?v=' + VIDEO_ID;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      var img = document.createElement('img');
      img.src = 'https://img.youtube.com/vi/' + VIDEO_ID + '/maxresdefault.jpg';
      img.onerror = function(){ img.src='https://img.youtube.com/vi/' + VIDEO_ID + '/hqdefault.jpg'; };

      var play = document.createElement('div');
      play.className = 'play';
      play.innerHTML = '▶';

      a.appendChild(img);
      a.appendChild(play);
      box.appendChild(a);
    });
  }

  function refreshSlider() {
    restoreThumb();
    if (!window.jQuery) return;
    var slider = window.jQuery('#heroSlide6');
    if (!slider.length || !slider.hasClass('slick-initialized')) return;
    try { slider.slick('setPosition'); } catch (e) {}
  }

  function init() {
    injectStyle();
    refreshSlider();
    setTimeout(refreshSlider, 400);
    setTimeout(refreshSlider, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
