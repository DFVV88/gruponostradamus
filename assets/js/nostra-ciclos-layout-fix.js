/* ==================================================
   Grupo Nostradamus - Fix final de layout en ciclos.html
   - Ciclos en 2 columnas en web.
   - 1 columna en tablet/móvil.
   - Beneficios y características legibles, sin texto vertical.
   - Turnos/horarios convertidos a tarjetas horizontales.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-layout-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-layout-fix-style';
    style.textContent = `
      body #course-sec .container > .row.gy-4{display:block !important;}

      body #course-sec .filter-active{
        width:100% !important;max-width:100% !important;flex:0 0 100% !important;
        display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:30px !important;
        height:auto !important;position:relative !important;overflow:visible !important;
      }

      body #course-sec .filter-active .filter-item,
      body #course-sec .filter-active .filter-item[style]{
        width:100% !important;max-width:100% !important;min-width:0 !important;display:block !important;
        position:relative !important;left:auto !important;top:auto !important;right:auto !important;bottom:auto !important;
        transform:none !important;opacity:1 !important;margin:0 !important;clear:none !important;
      }

      body #course-sec .filter-active .course-single{height:100% !important;display:flex !important;flex-direction:column !important;}
      body #course-sec .course-single-bottom{flex:1 1 auto !important;}

      body #course-sec .course-single-top .course-img{aspect-ratio:16/8.6 !important;margin-bottom:18px !important;}
      body #course-sec .course-single-top .course-img img{width:100% !important;height:100% !important;object-fit:cover !important;}
      body #course-sec .course-title{font-size:clamp(22px,2vw,32px) !important;line-height:1.1 !important;min-height:auto !important;}

      body #course-sec .course-tab{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:10px !important;}
      body #course-sec .course-tab .nav-item{width:100% !important;flex:none !important;}
      body #course-sec .course-tab .nav-item:last-child{grid-column:1 / -1 !important;}
      body #course-sec .course-tab .nav-link{min-height:44px !important;font-size:13px !important;padding:9px 10px !important;white-space:normal !important;}

      body #course-sec .checklist ul{display:grid !important;grid-template-columns:1fr !important;gap:12px !important;}
      body #course-sec .checklist li{
        width:100% !important;min-width:0 !important;max-width:100% !important;white-space:normal !important;word-break:normal !important;
        overflow-wrap:break-word !important;writing-mode:horizontal-tb !important;text-orientation:mixed !important;text-align:left !important;
        line-height:1.55 !important;font-size:14.6px !important;
      }

      body #course-sec .course-description p{
        text-align:justify !important;text-justify:inter-word !important;word-break:normal !important;overflow-wrap:break-word !important;
        writing-mode:horizontal-tb !important;text-orientation:mixed !important;
      }

      /* BLOQUE DEFINITIVO: turnos en tarjetas horizontales */
      body #course-sec .course-description .row.gy-4,
      body #course-sec .tab-pane .row.gy-4{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        width:100% !important;
        margin-top:18px !important;
      }

      body #course-sec .course-description .row.gy-4 > [class*="col-"],
      body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
        width:100% !important;max-width:100% !important;min-width:0 !important;flex:none !important;display:block !important;padding:0 !important;
      }

      body #course-sec .price-card{
        width:100% !important;min-width:0 !important;max-width:100% !important;min-height:0 !important;height:auto !important;
        border-radius:18px !important;overflow:hidden !important;background:linear-gradient(135deg,#f7ffff,#e9fbfd) !important;
        border:1px solid rgba(0,137,150,.18) !important;box-shadow:0 10px 20px rgba(0,0,0,.055) !important;
      }

      body #course-sec .price-card_top{
        min-height:0 !important;height:auto !important;width:100% !important;padding:14px 15px !important;
        display:grid !important;grid-template-columns:minmax(112px,150px) 1fr !important;align-items:center !important;gap:14px !important;
        text-align:left !important;
      }

      body #course-sec .price-card_title{
        display:flex !important;align-items:center !important;justify-content:center !important;
        width:100% !important;height:auto !important;min-height:42px !important;max-width:none !important;min-width:0 !important;
        margin:0 !important;padding:10px 12px !important;border-radius:999px !important;
        background:linear-gradient(135deg,#005765,#008b96) !important;color:#ffffff !important;
        writing-mode:horizontal-tb !important;text-orientation:mixed !important;white-space:normal !important;word-break:normal !important;overflow-wrap:normal !important;
        text-align:center !important;line-height:1.08 !important;font-size:13px !important;font-weight:950 !important;letter-spacing:.15px !important;
      }

      body #course-sec .price-card_price{
        display:block !important;width:100% !important;max-width:100% !important;margin:0 !important;padding:0 !important;
        writing-mode:horizontal-tb !important;text-orientation:mixed !important;white-space:normal !important;word-break:normal !important;overflow-wrap:normal !important;
        text-align:left !important;line-height:1.32 !important;font-size:15px !important;font-weight:900 !important;letter-spacing:normal !important;color:#071426 !important;
      }

      body #course-sec .horario-ciclo{
        display:inline !important;width:auto !important;max-width:none !important;margin:0 !important;padding:0 !important;
        writing-mode:horizontal-tb !important;text-orientation:mixed !important;white-space:normal !important;word-break:normal !important;overflow-wrap:normal !important;
        text-align:left !important;line-height:1.32 !important;font-size:14px !important;font-weight:900 !important;letter-spacing:normal !important;color:#008b96 !important;
      }

      body #course-sec .price-card br{display:none !important;}

      body #course-sec .nostra-cycle-cta{padding:14px !important;}
      body #course-sec .nostra-cycle-cta__text{font-size:13.5px !important;}
      body #course-sec .nostra-cycle-cta__button{width:100% !important;min-height:44px !important;}

      @media(max-width:1199px){
        body #course-sec .filter-active{grid-template-columns:1fr !important;}
        body #course-sec .course-single-top .course-img{aspect-ratio:16/7.8 !important;}
      }

      @media(max-width:767px){
        body #course-sec .course-description p{text-align:left !important;}
      }

      @media(max-width:575px){
        body #course-sec .course-tab{grid-template-columns:1fr !important;}
        body #course-sec .course-tab .nav-item:last-child{grid-column:auto !important;}
        body #course-sec .price-card_top{grid-template-columns:1fr !important;text-align:center !important;gap:9px !important;}
        body #course-sec .price-card_price{text-align:center !important;}
        body #course-sec .horario-ciclo{text-align:center !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function stabilizeLayout() {
    var grid = document.querySelector('#course-sec .filter-active');
    if (grid) {
      grid.style.display = 'grid';
      grid.style.height = 'auto';
      grid.style.position = 'relative';
      grid.style.width = '100%';
      grid.style.maxWidth = '100%';
    }

    document.querySelectorAll('#course-sec .filter-active .filter-item').forEach(function (item) {
      item.style.position = 'relative';
      item.style.left = 'auto';
      item.style.top = 'auto';
      item.style.transform = 'none';
      item.style.width = '100%';
      item.style.maxWidth = '100%';
      item.style.margin = '0';
      item.style.opacity = '1';
    });

    document.querySelectorAll('#course-sec .price-card_price, #course-sec .horario-ciclo, #course-sec .price-card_title').forEach(function (el) {
      el.style.writingMode = 'horizontal-tb';
      el.style.textOrientation = 'mixed';
      el.style.whiteSpace = 'normal';
      el.style.wordBreak = 'normal';
      el.style.overflowWrap = 'normal';
    });
  }

  function init() {
    injectStyles();
    stabilizeLayout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 300);
    setTimeout(init, 900);
    setTimeout(init, 2000);
    setTimeout(init, 4000);
  });
})();
