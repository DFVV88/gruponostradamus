/* ==================================================
   Grupo Nostradamus - Ajustes de index
   1) Uniforma la sección de ofertas.
   2) Cambia el iframe del hero por una miniatura estable
      para que no se corte dentro del carrusel.
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

  function getYouTubeId(src) {
    var value = String(src || '');
    var match = value.match(/\/embed\/([A-Za-z0-9_-]+)/) || value.match(/[?&]v=([A-Za-z0-9_-]+)/);
    return match ? match[1] : 'Gi-ZXzQSIDI';
  }

  function injectStyle() {
    if (document.getElementById('nostra-offer-hard-uniform-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-offer-hard-uniform-style';
    style.textContent = `
      /* =========================
         SLIDE VIDEO COMO MINIATURA ESTABLE
      ========================== */

      #hero .nostra-video-slide-fix .th-hero-bg,
      #hero .nostra-video-slide-fix .img-min-slider {
        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
      }

      #hero .nostra-video-slide-fix .container {
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-top: 88px !important;
        padding-bottom: 46px !important;
        overflow: visible !important;
      }

      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
      #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
        width: min(760px, 76vw) !important;
        max-width: 760px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        z-index: 30 !important;
        transform: translateY(54px) !important;
      }

      #hero .nostra-youtube-thumb {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        border-radius: 24px !important;
        overflow: hidden !important;
        background: #02070d !important;
        border: 1px solid rgba(255,255,255,.30) !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.46), 0 0 32px rgba(0,194,209,.22) !important;
      }

      #hero .nostra-youtube-thumb img {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center center !important;
      }

      #hero .nostra-youtube-thumb::before {
        content: '' !important;
        position: absolute !important;
        inset: 0 !important;
        background: linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.10)) !important;
        z-index: 1 !important;
      }

      #hero .nostra-youtube-play {
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 86px !important;
        height: 60px !important;
        border-radius: 18px !important;
        display: grid !important;
        place-items: center !important;
        background: #ff0000 !important;
        color: #fff !important;
        font-size: 34px !important;
        line-height: 1 !important;
        z-index: 2 !important;
        box-shadow: 0 14px 32px rgba(0,0,0,.30) !important;
      }

      #hero .nostra-youtube-label {
        position: absolute !important;
        left: 18px !important;
        top: 16px !important;
        right: 18px !important;
        z-index: 2 !important;
        color: #fff !important;
        font-weight: 950 !important;
        font-size: 18px !important;
        text-shadow: 0 3px 12px rgba(0,0,0,.55) !important;
      }

      @media (max-width: 1199px) {
        #hero .nostra-video-slide-fix .container {
          padding-top: 72px !important;
          padding-bottom: 34px !important;
        }
        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: min(700px, 76vw) !important;
          transform: translateY(40px) !important;
        }
      }

      @media (max-width: 767px) {
        #hero .nostra-video-slide-fix .container {
          padding-top: 34px !important;
          padding-bottom: 24px !important;
        }
        #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,
        #hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo {
          width: calc(100vw - 34px) !important;
          transform: translateY(22px) !important;
        }
        #hero .nostra-youtube-thumb {
          border-radius: 16px !important;
        }
        #hero .nostra-youtube-play {
          width: 66px !important;
          height: 48px !important;
          border-radius: 14px !important;
          font-size: 26px !important;
        }
        #hero .nostra-youtube-label {
          font-size: 14px !important;
          left: 12px !important;
          top: 10px !important;
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
          ) el = el.parentElement;
          else break;
        }
        return el;
      }
    }
    return null;
  }

  function replaceHeroYouTubeIframe() {
    document.querySelectorAll('#hero iframe.frame-video, #hero .frame-video').forEach(function (video) {
      if (video.dataset.nostraThumbReady === '1') return;

      var src = video.getAttribute('src') || '';
      if (src.indexOf('youtube.com') === -1 && src.indexOf('youtu.be') === -1) return;

      var id = getYouTubeId(src);
      var slide = video.closest('.th-hero-slide') || video.closest('.slick-slide') || video.closest('.swiper-slide') || video.parentElement;
      if (slide) slide.classList.add('nostra-video-slide-fix');

      var link = document.createElement('a');
      link.className = 'nostra-youtube-thumb frame-video';
      link.href = 'https://www.youtube.com/watch?v=' + id;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Ver video institucional en YouTube');
      link.dataset.nostraThumbReady = '1';

      var img = document.createElement('img');
      img.src = 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
      img.alt = 'Video institucional Grupo Nostradamus';
      img.loading = 'lazy';
      img.onerror = function () {
        img.onerror = null;
        img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
      };

      var label = document.createElement('span');
      label.className = 'nostra-youtube-label';
      label.textContent = 'Bienvenidos al Grupo de Estudio Nostradamus';

      var play = document.createElement('span');
      play.className = 'nostra-youtube-play';
      play.textContent = '▶';

      link.appendChild(img);
      link.appendChild(label);
      link.appendChild(play);
      video.replaceWith(link);
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
    replaceHeroYouTubeIframe();
    applyOfferFix();
  }

  function init() {
    applyFix();
    setTimeout(applyFix, 300);
    setTimeout(applyFix, 900);
    setTimeout(applyFix, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
})();
