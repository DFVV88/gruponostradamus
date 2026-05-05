/* ==================================================
   Grupo Nostradamus - Ajustes de index
   1) Uniforma la sección de ofertas.
   2) Corrige el slide que contiene el video sin romper
      los demás slides del hero.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function injectStyle() {
    if (document.getElementById('nostra-offer-hard-uniform-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-offer-hard-uniform-style';
    style.textContent = `
      /* =========================
         FIX SOLO PARA EL SLIDE VIDEO
      ========================== */

      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
      }

      #hero .nostra-video-slide-fix.slick-active,
      #hero .nostra-video-slide-fix.slick-active .th-hero-bg,
      #hero .nostra-video-slide-fix.slick-active .img-min-slider,
      #hero .nostra-video-slide-fix.slick-active .container,
      #hero .nostra-video-slide-fix.active,
      #hero .nostra-video-slide-fix.active .th-hero-bg,
      #hero .nostra-video-slide-fix.active .img-min-slider,
      #hero .nostra-video-slide-fix.active .container,
      #hero .nostra-video-slide-fix.swiper-slide-active,
      #hero .nostra-video-slide-fix.swiper-slide-active .th-hero-bg,
      #hero .nostra-video-slide-fix.swiper-slide-active .img-min-slider,
      #hero .nostra-video-slide-fix.swiper-slide-active .container {
        min-height: 560px !important;
        height: 560px !important;
        max-height: 560px !important;
        overflow: hidden !important;
      }

      #hero .nostra-video-slide-fix.slick-active .container,
      #hero .nostra-video-slide-fix.active .container,
      #hero .nostra-video-slide-fix.swiper-slide-active .container {
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-top: 0 !important;
        padding-bottom: 120px !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
        width: min(720px, 70vw) !important;
        max-width: 720px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        z-index: 5 !important;
      }

      #hero .nostra-video-slide-fix.slick-active .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix.slick-active .contenido-max-slider.contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix.active .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix.active .contenido-max-slider.contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix.swiper-slide-active .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix.swiper-slide-active .contenido-max-slider.contenido-min-slider-tovideo {
        transform: translateY(-28px) !important;
      }

      #hero .nostra-video-slide-fix .frame-video {
        display: block !important;
        width: 100% !important;
        height: 300px !important;
        aspect-ratio: auto !important;
        min-height: 0 !important;
        max-height: 300px !important;
        border-radius: 22px !important;
        border: 1px solid rgba(255,255,255,.28) !important;
        box-shadow: 0 20px 54px rgba(0,0,0,.44), 0 0 28px rgba(0,194,209,.20) !important;
        background: #02070d !important;
        overflow: hidden !important;
      }

      @media (max-width: 1199px) {
        #hero .nostra-video-slide-fix.slick-active,
        #hero .nostra-video-slide-fix.slick-active .th-hero-bg,
        #hero .nostra-video-slide-fix.slick-active .img-min-slider,
        #hero .nostra-video-slide-fix.slick-active .container,
        #hero .nostra-video-slide-fix.active,
        #hero .nostra-video-slide-fix.active .th-hero-bg,
        #hero .nostra-video-slide-fix.active .img-min-slider,
        #hero .nostra-video-slide-fix.active .container,
        #hero .nostra-video-slide-fix.swiper-slide-active,
        #hero .nostra-video-slide-fix.swiper-slide-active .th-hero-bg,
        #hero .nostra-video-slide-fix.swiper-slide-active .img-min-slider,
        #hero .nostra-video-slide-fix.swiper-slide-active .container {
          min-height: 530px !important;
          height: 530px !important;
          max-height: 530px !important;
        }

        #hero .nostra-video-slide-fix.slick-active .container,
        #hero .nostra-video-slide-fix.active .container,
        #hero .nostra-video-slide-fix.swiper-slide-active .container {
          padding-bottom: 100px !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(680px, 70vw) !important;
        }

        #hero .nostra-video-slide-fix .frame-video {
          height: 280px !important;
          max-height: 280px !important;
        }
      }

      @media (max-width: 767px) {
        #hero .nostra-video-slide-fix.slick-active,
        #hero .nostra-video-slide-fix.slick-active .th-hero-bg,
        #hero .nostra-video-slide-fix.slick-active .img-min-slider,
        #hero .nostra-video-slide-fix.slick-active .container,
        #hero .nostra-video-slide-fix.active,
        #hero .nostra-video-slide-fix.active .th-hero-bg,
        #hero .nostra-video-slide-fix.active .img-min-slider,
        #hero .nostra-video-slide-fix.active .container,
        #hero .nostra-video-slide-fix.swiper-slide-active,
        #hero .nostra-video-slide-fix.swiper-slide-active .th-hero-bg,
        #hero .nostra-video-slide-fix.swiper-slide-active .img-min-slider,
        #hero .nostra-video-slide-fix.swiper-slide-active .container {
          min-height: 400px !important;
          height: 400px !important;
          max-height: 400px !important;
        }

        #hero .nostra-video-slide-fix.slick-active .container,
        #hero .nostra-video-slide-fix.active .container,
        #hero .nostra-video-slide-fix.swiper-slide-active .container {
          padding-top: 6px !important;
          padding-bottom: 70px !important;
        }

        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 48px) !important;
        }

        #hero .nostra-video-slide-fix.slick-active .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix.slick-active .contenido-max-slider.contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix.active .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix.active .contenido-max-slider.contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix.swiper-slide-active .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix.swiper-slide-active .contenido-max-slider.contenido-min-slider-tovideo {
          transform: translateY(-12px) !important;
        }

        #hero .nostra-video-slide-fix .frame-video {
          height: 220px !important;
          max-height: 220px !important;
          border-radius: 16px !important;
        }
      }

      /* =========================
         OFERTAS
      ========================== */

      .nostra-offer-hard-uniform {
        position: relative !important;
        isolation: isolate !important;
        overflow: hidden !important;
        background:
          radial-gradient(circle at 22% 28%, rgba(0,194,209,.24), transparent 31%),
          radial-gradient(circle at 78% 48%, rgba(0,194,209,.20), transparent 35%),
          linear-gradient(135deg,#061426 0%,#02070d 48%,#061426 100%) !important;
        background-color: #061426 !important;
      }

      .nostra-offer-hard-uniform::before {
        content: '' !important;
        position: absolute !important;
        inset: 0 !important;
        z-index: 0 !important;
        background:
          linear-gradient(90deg,rgba(2,7,13,.78),rgba(2,7,13,.68),rgba(2,7,13,.72)),
          repeating-linear-gradient(90deg,rgba(255,255,255,.022) 0 1px,transparent 1px 92px) !important;
        pointer-events: none !important;
      }

      .nostra-offer-hard-uniform > *,
      .nostra-offer-hard-uniform .container,
      .nostra-offer-hard-uniform .row,
      .nostra-offer-hard-uniform .row > [class*='col'],
      .nostra-offer-hard-uniform .row > [class*='col'] > *,
      .nostra-offer-hard-uniform [class*='discount'],
      .nostra-offer-hard-uniform [class*='offer'],
      .nostra-offer-hard-uniform [class*='cta'],
      .nostra-offer-hard-uniform [class*='img'],
      .nostra-offer-hard-uniform [style*='background'] {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }

      .nostra-offer-hard-uniform .container,
      .nostra-offer-hard-uniform .row,
      .nostra-offer-hard-uniform .row > [class*='col'] {
        position: relative !important;
        z-index: 2 !important;
      }

      .nostra-offer-hard-uniform .row {
        align-items: center !important;
      }

      .nostra-offer-hard-uniform .row > [class*='col']:last-child {
        background: transparent !important;
        position: relative !important;
      }

      .nostra-offer-hard-uniform .row > [class*='col']:last-child::after {
        content: '' !important;
        position: absolute !important;
        inset: 8% 4% 0 4% !important;
        z-index: -1 !important;
        border-radius: 34px !important;
        background:
          radial-gradient(circle at 50% 50%, rgba(0,194,209,.18), transparent 54%),
          linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.015)) !important;
        border: 1px solid rgba(0,194,209,.14) !important;
        box-shadow: 0 0 34px rgba(0,194,209,.13) !important;
      }

      .nostra-offer-hard-uniform h1,
      .nostra-offer-hard-uniform h2,
      .nostra-offer-hard-uniform h3,
      .nostra-offer-hard-uniform .sec-title,
      .nostra-offer-hard-uniform .title {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: none !important;
        text-shadow: 0 4px 0 rgba(0,0,0,.62), 0 12px 22px rgba(0,0,0,.58), 0 0 20px rgba(0,194,209,.22) !important;
      }

      .nostra-offer-hard-uniform p,
      .nostra-offer-hard-uniform .text,
      .nostra-offer-hard-uniform .desc {
        color: rgba(255,255,255,.92) !important;
        -webkit-text-fill-color: rgba(255,255,255,.92) !important;
        text-shadow: 0 3px 10px rgba(0,0,0,.65) !important;
      }

      .nostra-offer-hard-uniform img {
        background: transparent !important;
        filter: drop-shadow(0 24px 34px rgba(0,0,0,.52)) drop-shadow(0 0 18px rgba(0,194,209,.18)) !important;
      }

      @media (max-width: 991.98px) {
        .nostra-offer-hard-uniform {
          text-align: center !important;
        }
        .nostra-offer-hard-uniform .row > [class*='col']:last-child::after {
          inset: 6% 12% 0 12% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findOfferSection() {
    var candidates = document.querySelectorAll('section, div');
    for (var i = 0; i < candidates.length; i++) {
      var text = normalize(candidates[i].textContent);
      if (
        text.indexOf('ofertas exclusivas') !== -1 &&
        text.indexOf('descuentos academicos') !== -1
      ) {
        var el = candidates[i];
        while (el.parentElement && el.parentElement !== document.body) {
          var parentText = normalize(el.parentElement.textContent);
          if (
            parentText.indexOf('ofertas exclusivas') !== -1 &&
            parentText.indexOf('descuentos academicos') !== -1
          ) {
            el = el.parentElement;
          } else {
            break;
          }
        }
        return el;
      }
    }
    return null;
  }

  function applyVideoFix() {
    document.querySelectorAll('#hero .frame-video').forEach(function (video) {
      var slide =
        video.closest('.th-hero-slide') ||
        video.closest('.slick-slide') ||
        video.closest('.swiper-slide') ||
        video.parentElement;

      if (slide) slide.classList.add('nostra-video-slide-fix');
    });
  }

  function applyOfferFix() {
    var section = findOfferSection();
    if (!section) return;
    section.classList.add('nostra-offer-hard-uniform');
    section.classList.add('nostra-offer-section-fixed');
  }

  function applyFix() {
    injectStyle();
    applyVideoFix();
    applyOfferFix();
  }

  function init() {
    applyFix();
    setTimeout(applyFix, 300);
    setTimeout(applyFix, 900);
    setTimeout(applyFix, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
