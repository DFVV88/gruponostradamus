/* ==================================================
   Grupo Nostradamus - Video del hero bajo demanda
   Mantiene una miniatura ligera y crea YouTube solo al pulsar.
   Estabiliza el carrusel para evitar parpadeos entre slides.
================================================== */
(function () {
  'use strict';

  var VIDEO_ID = 'Gi-ZXzQSIDI';
  var PLAYER_URL = 'https://www.youtube-nocookie.com/embed/' + VIDEO_ID + '?autoplay=1&rel=0&modestbranding=1';
  var POSTER_MAX = 'https://img.youtube.com/vi/' + VIDEO_ID + '/maxresdefault.jpg';
  var POSTER_FALLBACK = 'https://img.youtube.com/vi/' + VIDEO_ID + '/hqdefault.jpg';
  var boundSlider = false;

  function markVideoSlide() {
    document.querySelectorAll('#hero .th-hero-slide').forEach(function (slide) {
      if (slide.querySelector('.contenido-min-slider-tovideo,.contenido-max-slider.contenido-min-slider-tovideo,.frame-video,.nostra-video-lazy')) {
        slide.classList.add('nostra-video-slide-fix');
      }
    });
  }

  function injectCss() {
    if (document.getElementById('nostra-video-slide-2-zoom-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-video-slide-2-zoom-fix-style';
    style.textContent = `
      /*
       * Slick ya controla el fade. La hoja nostra-home.css aplica
       * "transition: all" al mismo elemento; restringimos esa transición
       * a opacity para evitar repaints de tamaño/posición.
       */
      #hero .th-hero-slide{
        transition-property:opacity!important;
        will-change:opacity;
      }

      /*
       * El slide del video conserva su tamaño siempre, incluso cuando está
       * oculto. No se alteran .slick-list ni .slick-track al cambiar de slide.
       */
      #hero .nostra-video-slide-fix,
      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .container{
        min-height:620px!important;
        height:620px!important;
        max-height:620px!important;
        overflow:hidden!important;
      }
      #hero .nostra-video-slide-fix .th-hero-bg{
        background-size:cover!important;
        background-position:center 22%!important;
        background-repeat:no-repeat!important;
      }
      #hero .nostra-video-slide-fix .container{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:0 24px!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:center!important;
        position:relative!important;
      }
      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{
        position:relative!important;
        inset:auto!important;
        transform:translateY(76px)!important;
        width:min(680px,62vw)!important;
        max-width:680px!important;
        margin:0 auto!important;
        padding:0!important;
        min-height:auto!important;
        height:auto!important;
        z-index:30!important;
        display:block!important;
      }
      #hero .nostra-video-lazy{
        position:relative!important;
        display:block!important;
        width:100%!important;
        aspect-ratio:16/9!important;
        padding:0!important;
        border-radius:22px!important;
        overflow:hidden!important;
        border:1px solid rgba(255,255,255,.35)!important;
        box-shadow:0 22px 60px rgba(0,0,0,.44)!important;
        background:#000!important;
        cursor:pointer!important;
      }
      #hero .nostra-video-lazy img,
      #hero .nostra-video-player{
        width:100%!important;
        height:100%!important;
        display:block!important;
        object-fit:cover!important;
        border:0!important;
      }
      #hero .nostra-video-lazy::after{
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.28));
        pointer-events:none;
      }
      #hero .nostra-video-lazy__play{
        position:absolute!important;
        left:50%!important;
        top:50%!important;
        transform:translate(-50%,-50%)!important;
        width:88px!important;
        height:62px!important;
        border-radius:18px!important;
        background:#f00!important;
        color:#fff!important;
        display:grid!important;
        place-items:center!important;
        font-size:34px!important;
        font-weight:900!important;
        z-index:5!important;
        box-shadow:0 12px 28px rgba(0,0,0,.35)!important;
        transition:transform .2s ease,filter .2s ease!important;
      }
      #hero .nostra-video-lazy:hover .nostra-video-lazy__play,
      #hero .nostra-video-lazy:focus-visible .nostra-video-lazy__play{
        transform:translate(-50%,-50%) scale(1.08)!important;
        filter:brightness(1.08)!important;
      }
      #hero .nostra-video-lazy__label{
        position:absolute;
        left:18px;
        right:18px;
        bottom:16px;
        z-index:5;
        color:#fff;
        font-size:13px;
        line-height:1.3;
        font-weight:850;
        text-align:center;
        text-shadow:0 2px 10px rgba(0,0,0,.8);
      }
      @media(max-width:991px){
        #hero .nostra-video-slide-fix,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .container{
          min-height:520px!important;
          height:520px!important;
          max-height:520px!important;
        }
        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{
          width:min(600px,82vw)!important;
          max-width:600px!important;
          transform:translateY(58px)!important;
        }
      }
      @media(max-width:767px){
        #hero .nostra-video-slide-fix,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .container{
          min-height:430px!important;
          height:430px!important;
          max-height:430px!important;
        }
        #hero .nostra-video-slide-fix .th-hero-bg{
          background-size:185% auto!important;
          background-position:center 18%!important;
        }
        #hero .nostra-video-slide-fix .container{
          padding:0 14px!important;
        }
        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{
          width:calc(100vw - 28px)!important;
          max-width:430px!important;
          transform:translateY(-10px)!important;
        }
        #hero .nostra-video-lazy{
          border-radius:16px!important;
        }
        #hero .nostra-video-lazy__play{
          width:72px!important;
          height:52px!important;
          font-size:28px!important;
        }
        #hero .nostra-video-lazy__label{
          font-size:11.5px;
          bottom:10px;
        }
      }
      @media(max-width:430px){
        #hero .nostra-video-slide-fix,
        #hero .nostra-video-slide-fix .th-hero-bg,
        #hero .nostra-video-slide-fix .container{
          min-height:390px!important;
          height:390px!important;
          max-height:390px!important;
        }
      }
      @media(prefers-reduced-motion:reduce){
        #hero .th-hero-slide{
          will-change:auto;
        }
        #hero .nostra-video-lazy__play{
          transition:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createPoster() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nostra-video-lazy frame-video';
    button.setAttribute('aria-label', 'Reproducir video institucional de Grupo Nostradamus');

    var image = document.createElement('img');
    image.src = POSTER_MAX;
    image.alt = 'Video institucional Grupo Nostradamus';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onerror = function () {
      if (image.src !== POSTER_FALLBACK) image.src = POSTER_FALLBACK;
    };

    var play = document.createElement('span');
    play.className = 'nostra-video-lazy__play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';

    var label = document.createElement('span');
    label.className = 'nostra-video-lazy__label';
    label.textContent = 'Haz clic para reproducir el video';

    button.appendChild(image);
    button.appendChild(play);
    button.appendChild(label);
    button.addEventListener('click', function () {
      mountPlayer(button);
    }, { once:true });

    return button;
  }

  function mountPlayer(poster) {
    var box = poster && poster.parentElement;
    if (!box) return;

    var iframe = document.createElement('iframe');
    iframe.className = 'nostra-video-player frame-video';
    iframe.src = PLAYER_URL;
    iframe.title = 'Video institucional Grupo Nostradamus';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    poster.replaceWith(iframe);
    box.setAttribute('data-nostra-video-playing', '1');

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) {
      try { window.jQuery('#heroSlide6').slick('slickPause'); } catch (error) {}
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'play_video_hero', {
        event_category:'engagement',
        event_label:'video_institucional',
        page_name:'home'
      });
    }
  }

  function restorePoster(box) {
    if (!box) return;

    var iframe = box.querySelector('.nostra-video-player,iframe');
    if (iframe) iframe.remove();

    box.querySelectorAll('.nostra-video-lazy').forEach(function (poster, index) {
      if (index > 0) poster.remove();
    });

    if (!box.querySelector('.nostra-video-lazy')) box.appendChild(createPoster());
    box.removeAttribute('data-nostra-video-playing');
  }

  function prepareVideoBox() {
    markVideoSlide();

    document.querySelectorAll(
      '#hero .nostra-video-slide-fix .contenido-min-slider-tovideo,' +
      '#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo'
    ).forEach(function (box) {
      restorePoster(box);
    });
  }

  function unloadHiddenPlayer() {
    var unloaded = false;

    document.querySelectorAll('#hero .nostra-video-slide-fix').forEach(function (slide) {
      if (slide.classList.contains('slick-current')) return;

      var box = slide.querySelector(
        '.contenido-min-slider-tovideo,.contenido-max-slider.contenido-min-slider-tovideo'
      );

      if (box && box.getAttribute('data-nostra-video-playing') === '1') {
        restorePoster(box);
        unloaded = true;
      }
    });

    if (unloaded && !document.hidden && window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) {
      try {
        var slider = window.jQuery('#heroSlide6');
        var instance = slider.slick('getSlick');
        if (instance && instance.options && instance.options.autoplay) slider.slick('slickPlay');
      } catch (error) {}
    }
  }

  function bindSlider() {
    if (boundSlider || !window.jQuery || !window.jQuery.fn || !window.jQuery.fn.slick) return false;

    var slider = window.jQuery('#heroSlide6');
    if (!slider.length) return false;

    boundSlider = true;
    slider.on('afterChange.nostraVideo', function () {
      unloadHiddenPlayer();
    });

    return true;
  }

  function init() {
    injectCss();
    prepareVideoBox();

    if (!bindSlider()) {
      window.setTimeout(bindSlider, 250);
      window.setTimeout(bindSlider, 750);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) return;

    document.querySelectorAll('#hero [data-nostra-video-playing="1"]').forEach(function (box) {
      restorePoster(box);
    });
  }, { passive:true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();
