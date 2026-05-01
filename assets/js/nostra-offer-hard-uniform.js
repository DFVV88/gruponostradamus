/* ==================================================
   Grupo Nostradamus - Oferta uniforme HARD FIX
   Fuerza un solo fondo en la sección de ofertas del index.
   No afecta iq100.html.
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
      .nostra-offer-hard-uniform{
        position:relative !important;
        isolation:isolate !important;
        overflow:hidden !important;
        background:
          radial-gradient(circle at 22% 28%, rgba(0,194,209,.24), transparent 31%),
          radial-gradient(circle at 78% 48%, rgba(0,194,209,.20), transparent 35%),
          linear-gradient(135deg,#061426 0%,#02070d 48%,#061426 100%) !important;
        background-color:#061426 !important;
      }

      .nostra-offer-hard-uniform::before{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        z-index:0 !important;
        background:
          linear-gradient(90deg,rgba(2,7,13,.78),rgba(2,7,13,.68),rgba(2,7,13,.72)),
          repeating-linear-gradient(90deg,rgba(255,255,255,.022) 0 1px,transparent 1px 92px) !important;
        pointer-events:none !important;
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
      .nostra-offer-hard-uniform [style*='background']{
        background:transparent !important;
        background-color:transparent !important;
        background-image:none !important;
      }

      .nostra-offer-hard-uniform .container,
      .nostra-offer-hard-uniform .row,
      .nostra-offer-hard-uniform .row > [class*='col']{
        position:relative !important;
        z-index:2 !important;
      }

      .nostra-offer-hard-uniform .row{
        align-items:center !important;
      }

      .nostra-offer-hard-uniform .row > [class*='col']:first-child{
        background:transparent !important;
      }

      .nostra-offer-hard-uniform .row > [class*='col']:last-child{
        background:transparent !important;
        position:relative !important;
      }

      .nostra-offer-hard-uniform .row > [class*='col']:last-child::after{
        content:'' !important;
        position:absolute !important;
        inset:8% 4% 0 4% !important;
        z-index:-1 !important;
        border-radius:34px !important;
        background:
          radial-gradient(circle at 50% 50%, rgba(0,194,209,.18), transparent 54%),
          linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.015)) !important;
        border:1px solid rgba(0,194,209,.14) !important;
        box-shadow:0 0 34px rgba(0,194,209,.13) !important;
      }

      .nostra-offer-hard-uniform h1,
      .nostra-offer-hard-uniform h2,
      .nostra-offer-hard-uniform h3,
      .nostra-offer-hard-uniform .sec-title,
      .nostra-offer-hard-uniform .title{
        color:#ffffff !important;
        -webkit-text-fill-color:#ffffff !important;
        background:none !important;
        text-shadow:0 4px 0 rgba(0,0,0,.62),0 12px 22px rgba(0,0,0,.58),0 0 20px rgba(0,194,209,.22) !important;
      }

      .nostra-offer-hard-uniform p,
      .nostra-offer-hard-uniform .text,
      .nostra-offer-hard-uniform .desc{
        color:rgba(255,255,255,.92) !important;
        -webkit-text-fill-color:rgba(255,255,255,.92) !important;
        text-shadow:0 3px 10px rgba(0,0,0,.65) !important;
      }

      .nostra-offer-hard-uniform img{
        background:transparent !important;
        filter:drop-shadow(0 24px 34px rgba(0,0,0,.52)) drop-shadow(0 0 18px rgba(0,194,209,.18)) !important;
      }

      @media(max-width:991.98px){
        .nostra-offer-hard-uniform{text-align:center !important;}
        .nostra-offer-hard-uniform .row > [class*='col']:last-child::after{inset:6% 12% 0 12% !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function findSection() {
    var candidates = document.querySelectorAll('section, div');
    for (var i = 0; i < candidates.length; i++) {
      var text = normalize(candidates[i].textContent);
      if (text.indexOf('ofertas exclusivas') !== -1 && text.indexOf('descuentos academicos') !== -1) {
        var el = candidates[i];
        while (el.parentElement && el.parentElement !== document.body) {
          var parentText = normalize(el.parentElement.textContent);
          if (parentText.indexOf('ofertas exclusivas') !== -1 && parentText.indexOf('descuentos academicos') !== -1) {
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

  function applyFix() {
    injectStyle();
    var section = findSection();
    if (!section) return;
    section.classList.add('nostra-offer-hard-uniform');
    section.classList.add('nostra-offer-section-fixed');
  }

  function init() {
    applyFix();
    setTimeout(applyFix, 400);
    setTimeout(applyFix, 1200);
    setTimeout(applyFix, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
