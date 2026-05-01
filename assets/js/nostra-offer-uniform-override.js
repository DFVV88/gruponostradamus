/* ==================================================
   Grupo Nostradamus - Override uniforme sección ofertas
   Hace que la sección de ofertas del index no se vea partida.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function injectStyle() {
    if (document.getElementById('nostra-offer-uniform-override-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-offer-uniform-override-style';
    style.textContent = `
      .nostra-offer-section-fixed{
        background:
          radial-gradient(circle at 20% 30%, rgba(0,194,209,.25), transparent 32%),
          radial-gradient(circle at 78% 42%, rgba(0,194,209,.20), transparent 36%),
          linear-gradient(135deg,#061426 0%,#02070d 48%,#061426 100%) !important;
      }

      .nostra-offer-section-fixed::before{
        background:
          linear-gradient(90deg,rgba(2,7,13,.86) 0%,rgba(2,7,13,.75) 52%,rgba(2,7,13,.68) 100%),
          repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 88px) !important;
      }

      .nostra-offer-section-fixed .container,
      .nostra-offer-section-fixed .row,
      .nostra-offer-section-fixed .row > div{
        background:transparent !important;
        background-color:transparent !important;
      }

      .nostra-offer-section-fixed .row > div:last-child,
      .nostra-offer-section-fixed .row > div:last-child > div,
      .nostra-offer-section-fixed .row > div:last-child .discount-img,
      .nostra-offer-section-fixed .row > div:last-child .cta-img,
      .nostra-offer-section-fixed .row > div:last-child .offer-img,
      .nostra-offer-section-fixed .row > div:last-child .img-box,
      .nostra-offer-section-fixed .row > div:last-child .img-box1,
      .nostra-offer-section-fixed .row > div:last-child .img-box2,
      .nostra-offer-section-fixed .row > div:last-child .img-box3,
      .nostra-offer-section-fixed .row > div:last-child .img-box4{
        background:transparent !important;
        background-color:transparent !important;
        box-shadow:none !important;
      }

      .nostra-offer-section-fixed .row > div:last-child::before{
        opacity:.45 !important;
      }

      .nostra-offer-section-fixed img{
        background:transparent !important;
      }

      .nostra-offer-section-fixed h1,
      .nostra-offer-section-fixed h2,
      .nostra-offer-section-fixed .sec-title,
      .nostra-offer-section-fixed .title{
        max-width:640px !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyle);
  } else {
    injectStyle();
  }
  window.addEventListener('load', injectStyle);
})();
