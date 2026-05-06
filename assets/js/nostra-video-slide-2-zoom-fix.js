/* ==================================================
   Grupo Nostradamus - Slide 2 thumbnail único centrado
   Objetivo: una sola miniatura grande, centrada y sin franja inferior visible.
================================================== */
(function () {
  var VIDEO_ID = 'Gi-ZXzQSIDI';

  function injectStyle() {
    var old = document.getElementById('nostra-video-slide-2-zoom-fix-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-video-slide-2-zoom-fix-style';
    style.textContent = `
      #hero.nostra-video-active,
      #hero.nostra-video-active .hero-6,
      #hero.nostra-video-active #heroSlide6,
      #hero.nostra-video-active .slick-list,
      #hero.nostra-video-active .slick-track,
      #hero.nostra-video-active .slick-slide,
      #hero.nostra-video-active .slick-slide > div,
      #hero .nostra-video-slide-fix,
      #hero .nostra-video-slide-fix .container {
        min-height: 780px !important;
        height: 780px !important;
        max-height: 780px !important;
        overflow: hidden !important;
      }

      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        min-height: 780px !important;
        height: 780px !important;
        background-size: cover !important;
        background-position: center 12% !important;
        background-repeat: no-repeat !important;
      }

      #hero .nostra-video-slide-fix .container {
        position: relative !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
        position: absolute !important;
        left: 50% !important;
        right: auto !important;
        top: 52% !important;
        transform: translate(-50%, -50%) !important;
        width: min(940px, 78vw) !important;
        max-width: 940px !important;
        z-index: 100 !important;
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo > a:not(:first-of-type),
      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo > iframe,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo > a:not(:first-of-type),
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo > iframe {
        display: none !important;
      }

      .nostra-video-thumb-restore,
      #hero .nostra-youtube-thumb {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16/9 !important;
        border-radius: 26px !important;
        overflow: hidden !important;
        border: 1px solid rgba(255,255,255,.35) !important;
        box-shadow: 0 26px 76px rgba(0,0,0,.48) !important;
        background: #000 !important;
      }

      .nostra-video-thumb-restore img,
      #hero .nostra-youtube-thumb img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .nostra-video-thumb-restore .play,
      #hero .nostra-youtube-play {
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 96px !important;
        height: 68px !important;
        border-radius: 18px !important;
        background: #ff0000 !important;
        color: #fff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 38px !important;
        font-weight: bold !important;
        z-index: 5 !important;
      }

      @media (max-width: 1199px) {
        #hero.nostra-video-active,
        #hero.nostra-video-active .hero-6,
        #hero.nostra-video-active #heroSlide6,
        #hero.nostra-video-active .slick-list,
        #hero.nostra-video-active .slick-track,
        #hero.nostra-video-active .slick-slide,
        #hero.nostra-video-active .slick-slide > div,
        #hero .nostra-video-slide-fix,
        #hero .nostra-video-slide-fix .container,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          min-height: 640px !important;
          height: 640px !important;
          max-height: 640px !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(800px, 78vw) !important;
          max-width: 800px !important;
          top: 52% !important;
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
        #hero .nostra-video-slide-fix,
        #hero .nostra-video-slide-fix .container,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          min-height: 420px !important;
          height: 420px !important;
          max-height: 420px !important;
        }

        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .img-min-slider {
          background-size: 190% auto !important;
          background-position: center 14% !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 30px) !important;
          max-width: 430px !important;
          top: 50% !important;
        }

        .nostra-video-thumb-restore,
        #hero .nostra-youtube-thumb {
          border-radius: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function makeThumb() {
    var a = document.createElement('a');
    a.className = 'nostra-video-thumb-restore frame-video';
    a.href = 'https://www.youtube.com/watch?v=' + VIDEO_ID;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    var img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + VIDEO_ID + '/maxresdefault.jpg';
    img.alt = 'Video institucional Grupo Nostradamus';
    img.onerror = function(){ img.src='https://img.youtube.com/vi/' + VIDEO_ID + '/hqdefault.jpg'; };

    var play = document.createElement('div');
    play.className = 'play';
    play.innerHTML = '▶';

    a.appendChild(img);
    a.appendChild(play);
    return a;
  }

  function restoreThumb() {
    document.querySelectorAll('#hero .nostra-video-slide-fix .contenido-min-slider-tovideo').forEach(function (box) {
      var thumbs = box.querySelectorAll('.nostra-video-thumb-restore, .nostra-youtube-thumb');
      var first = thumbs[0];

      box.querySelectorAll('iframe').forEach(function (iframe) { iframe.remove(); });
      thumbs.forEach(function (thumb, index) {
        if (index > 0) thumb.remove();
      });

      if (!first || !box.contains(first)) {
        box.appendChild(makeThumb());
      } else {
        first.classList.add('nostra-video-thumb-restore');
      }
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
