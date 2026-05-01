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
          radial-gradient(circle at 18% 28%, rgba(0,194,209,.26), transparent 32%),
          radial-gradient(circle at 82% 42%, rgba(0,194,209,.16), transparent 34%),
          linear-gradient(135deg,#061426 0%,#02070d 52%,#061426 100%) !important;
        border-top:1px solid rgba(0,194,209,.30) !important;
        border-bottom:1px solid rgba(0,194,209,.30) !important;
      }

      .nostra-offer-section-fixed::before{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        background:
          linear-gradient(90deg,rgba(2,7,13,.82) 0%,rgba(2,7,13,.72) 48%,rgba(2,7,13,.62) 100%),
          linear-gradient(120deg,transparent 0%,rgba(255,255,255,.06) 44%,transparent 58%),
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

      .nostra-offer-section-fixed .container{
        max-width:1240px !important;
      }

      .nostra-offer-section-fixed .row{
        align-items:center !important;
        min-height:520px !important;
      }

      .nostra-offer-section-fixed .title-area,
      .nostra-offer-section-fixed .cta-content,
      .nostra-offer-section-fixed .discount-content,
      .nostra-offer-section-fixed .offer-content{
        max-width:680px !important;
        padding:28px 0 !important;
      }

      .nostra-offer-section-fixed .row > [class*='col']{
        background:transparent !important;
      }

      .nostra-offer-section-fixed [style*='background'],
      .nostra-offer-section-fixed [class*='bg']{
        background-color:transparent !important;
      }

      .nostra-offer-section-fixed .row > [class*='col']:last-child{
        position:relative !important;
        min-height:460px !important;
        display:flex !important;
        align-items:flex-end !important;
        justify-content:center !important;
      }

      .nostra-offer-section-fixed .row > [class*='col']:last-child::before{
        content:'' !important;
        position:absolute !important;
        inset:46px 18px 0 18px !important;
        border-radius:34px !important;
        background:
          radial-gradient(circle at center,rgba(0,194,209,.22),transparent 46%),
          linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.025)) !important;
        border:1px solid rgba(0,194,209,.18) !important;
        box-shadow:0 0 34px rgba(0,194,209,.16), inset 0 1px 0 rgba(255,255,255,.08) !important;
        z-index:-1 !important;
      }

      .nostra-offer-section-fixed img{
        position:relative !important;
        z-index:2 !important;
        max-height:470px !important;
        object-fit:contain !important;
        filter:drop-shadow(0 24px 34px rgba(0,0,0,.52)) drop-shadow(0 0 18px rgba(0,194,209,.20)) !important;
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
        font-size:clamp(34px,4.4vw,62px) !important;
        line-height:1.03 !important;
        font-style:italic !important;
        text-transform:uppercase !important;
        letter-spacing:-1.3px !important;
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
        font-size:clamp(16px,1.45vw,20px) !important;
        line-height:1.65 !important;
        max-width:650px !important;
        text-shadow:0 3px 10px rgba(0,0,0,.65) !important;
        opacity:1 !important;
        visibility:visible !important;
      }

      .nostra-offer-section-fixed .th-btn{
        margin-top:18px !important;
      }

      .nostra-offer-section-fixed .shape-mockup,
      .nostra-offer-section-fixed [class*='shape']{
        opacity:.18 !important;
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
        .nostra-offer-section-fixed .row{
          min-height:auto !important;
        }
        .nostra-offer-section-fixed .title-area,
        .nostra-offer-section-fixed .cta-content,
        .nostra-offer-section-fixed .discount-content,
        .nostra-offer-section-fixed .offer-content{
          margin-left:auto !important;
          margin-right:auto !important;
        }
        .nostra-offer-section-fixed .row > [class*='col']:last-child{
          min-height:340px !important;
        }
        .nostra-offer-section-fixed img{
          max-height:330px !important;
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
        .nostra-offer-section-fixed .row > [class*='col']:last-child{
          min-height:260px !important;
        }
        .nostra-offer-section-fixed img{
          max-height:260px !important;
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
