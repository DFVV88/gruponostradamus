/* ==================================================
   Grupo Nostradamus - Fix sección ofertas del index
   Corrige contraste y composición del bloque
   "Ofertas exclusivas para tu educación".
   No afecta iq100.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  function normalizeText(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function injectStyles() {
    if (document.getElementById('nostra-offer-section-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-offer-section-style';
    style.textContent = `
      .nostra-offer-section-fixed{
        position:relative !important;
        overflow:hidden !important;
        padding:78px 0 !important;
        background:
          radial-gradient(circle at 15% 22%, rgba(0,194,209,.28), transparent 32%),
          radial-gradient(circle at 92% 30%, rgba(255,255,255,.10), transparent 28%),
          linear-gradient(135deg,#061426 0%,#02070d 52%,#083943 100%) !important;
        border-top:1px solid rgba(0,194,209,.30) !important;
        border-bottom:1px solid rgba(0,194,209,.30) !important;
      }

      .nostra-offer-section-fixed::before{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        background:
          linear-gradient(120deg,transparent 0%,rgba(255,255,255,.07) 44%,transparent 58%),
          repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 90px) !important;
        pointer-events:none !important;
      }

      .nostra-offer-section-fixed::after{
        content:'NOSTRADAMUS' !important;
        position:absolute !important;
        right:-32px !important;
        bottom:18px !important;
        font-size:clamp(54px,9vw,140px) !important;
        line-height:1 !important;
        font-weight:950 !important;
        font-style:italic !important;
        color:rgba(255,255,255,.045) !important;
        letter-spacing:-4px !important;
        pointer-events:none !important;
      }

      .nostra-offer-section-fixed .container,
      .nostra-offer-section-fixed .row,
      .nostra-offer-section-fixed .title-area,
      .nostra-offer-section-fixed .cta-content,
      .nostra-offer-section-fixed .discount-content,
      .nostra-offer-section-fixed .offer-content{
        position:relative !important;
        z-index:2 !important;
      }

      .nostra-offer-section-fixed .row{
        align-items:center !important;
      }

      .nostra-offer-section-fixed .title-area,
      .nostra-offer-section-fixed .cta-content,
      .nostra-offer-section-fixed .discount-content,
      .nostra-offer-section-fixed .offer-content{
        max-width:760px !important;
        padding:28px 0 !important;
      }

      .nostra-offer-section-fixed .sub-title,
      .nostra-offer-section-fixed [class*='sub-title']{
        color:#00e5f2 !important;
        -webkit-text-fill-color:#00e5f2 !important;
        text-shadow:0 0 14px rgba(0,194,209,.42) !important;
        font-weight:950 !important;
        letter-spacing:1px !important;
      }

      .nostra-offer-section-fixed h1,
      .nostra-offer-section-fixed h2,
      .nostra-offer-section-fixed .sec-title,
      .nostra-offer-section-fixed .title{
        color:#ffffff !important;
        -webkit-text-fill-color:initial !important;
        background:none !important;
        font-size:clamp(34px,5vw,68px) !important;
        line-height:1.02 !important;
        font-style:italic !important;
        text-transform:uppercase !important;
        letter-spacing:-1.5px !important;
        text-shadow:
          0 3px 0 rgba(0,0,0,.58),
          0 10px 18px rgba(0,0,0,.55),
          0 0 22px rgba(0,194,209,.28) !important;
        filter:none !important;
      }

      .nostra-offer-section-fixed p,
      .nostra-offer-section-fixed .text,
      .nostra-offer-section-fixed .desc{
        color:rgba(255,255,255,.90) !important;
        -webkit-text-fill-color:rgba(255,255,255,.90) !important;
        font-size:clamp(16px,1.5vw,21px) !important;
        line-height:1.65 !important;
        max-width:720px !important;
        text-shadow:0 3px 10px rgba(0,0,0,.65) !important;
        opacity:1 !important;
        visibility:visible !important;
      }

      .nostra-offer-section-fixed .th-btn{
        margin-top:18px !important;
      }

      .nostra-offer-section-fixed .shape-mockup,
      .nostra-offer-section-fixed [class*='shape']{
        opacity:.28 !important;
      }

      .nostra-offer-section-fixed .col-xl-6:empty,
      .nostra-offer-section-fixed .col-lg-6:empty,
      .nostra-offer-section-fixed .col-md-6:empty{
        display:none !important;
      }

      .nostra-offer-section-fixed .nostra-offer-badge{
        display:inline-flex !important;
        align-items:center !important;
        gap:8px !important;
        padding:10px 16px !important;
        margin-bottom:18px !important;
        border-radius:999px !important;
        background:linear-gradient(90deg,rgba(0,194,209,.26),rgba(255,255,255,.10)) !important;
        border:1px solid rgba(255,255,255,.16) !important;
        color:#eaffff !important;
        font-size:13px !important;
        font-weight:950 !important;
        letter-spacing:.8px !important;
        text-transform:uppercase !important;
      }

      @media(max-width:991.98px){
        .nostra-offer-section-fixed{
          padding:60px 0 !important;
          text-align:center !important;
        }
        .nostra-offer-section-fixed .title-area,
        .nostra-offer-section-fixed .cta-content,
        .nostra-offer-section-fixed .discount-content,
        .nostra-offer-section-fixed .offer-content{
          margin-left:auto !important;
          margin-right:auto !important;
        }
      }

      @media(max-width:767.98px){
        .nostra-offer-section-fixed{
          padding:48px 0 !important;
        }
        .nostra-offer-section-fixed h1,
        .nostra-offer-section-fixed h2,
        .nostra-offer-section-fixed .sec-title,
        .nostra-offer-section-fixed .title{
          font-size:clamp(30px,10vw,44px) !important;
          letter-spacing:-.8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findOfferHeading() {
    var headings = document.querySelectorAll('h1,h2,h3,.sec-title,.title');
    for (var i = 0; i < headings.length; i++) {
      var text = normalizeText(headings[i].textContent);
      if (text.indexOf('ofertas exclusivas') !== -1 || text.indexOf('para tu educacion') !== -1) {
        return headings[i];
      }
    }
    return null;
  }

  function closestUsefulSection(element) {
    var current = element;
    while (current && current !== document.body) {
      if (
        current.tagName && current.tagName.toLowerCase() === 'section' ||
        current.classList && (
          current.classList.contains('space') ||
          current.className.toString().indexOf('cta') !== -1 ||
          current.className.toString().indexOf('discount') !== -1 ||
          current.className.toString().indexOf('offer') !== -1
        )
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return element.closest('div') || element;
  }

  function fixOfferSection() {
    injectStyles();

    var heading = findOfferHeading();
    if (!heading) return;

    var section = closestUsefulSection(heading);
    if (!section || section.classList.contains('nostra-offer-section-fixed')) return;

    section.classList.add('nostra-offer-section-fixed');

    var titleArea = heading.closest('.title-area, .cta-content, .discount-content, .offer-content') || heading.parentElement;
    if (titleArea && !titleArea.querySelector('.nostra-offer-badge')) {
      var badge = document.createElement('span');
      badge.className = 'nostra-offer-badge';
      badge.textContent = '🔥 Promoción académica';
      titleArea.insertBefore(badge, titleArea.firstChild);
    }

    section.querySelectorAll('p').forEach(function (p) {
      var text = normalizeText(p.textContent);
      if (text.indexOf('oportunidad') !== -1 || text.indexOf('inscribete') !== -1 || text.indexOf('programas academicos') !== -1) {
        p.style.color = 'rgba(255,255,255,.90)';
        p.style.opacity = '1';
        p.style.visibility = 'visible';
      }
    });
  }

  function init() {
    fixOfferSection();
    setTimeout(fixOfferSection, 400);
    setTimeout(fixOfferSection, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
