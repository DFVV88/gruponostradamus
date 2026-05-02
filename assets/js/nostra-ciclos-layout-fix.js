/* ==================================================
   Grupo Nostradamus - Fix final de layout en ciclos.html
   - Ciclos en 2 columnas en web.
   - 1 columna en tablet/móvil.
   - Beneficios y características legibles, sin texto vertical.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-layout-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-layout-fix-style';
    style.textContent = `
      /* Contenedor principal de ciclos: dos columnas limpias en web */
      body #course-sec .container > .row.gy-4{
        display:block !important;
      }

      body #course-sec .filter-active{
        width:100% !important;
        max-width:100% !important;
        flex:0 0 100% !important;
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:30px !important;
        height:auto !important;
        position:relative !important;
        overflow:visible !important;
      }

      body #course-sec .filter-active .filter-item,
      body #course-sec .filter-active .filter-item[style]{
        width:100% !important;
        max-width:100% !important;
        min-width:0 !important;
        display:block !important;
        position:relative !important;
        left:auto !important;
        top:auto !important;
        right:auto !important;
        bottom:auto !important;
        transform:none !important;
        opacity:1 !important;
        margin:0 !important;
        clear:none !important;
      }

      body #course-sec .filter-active .course-single{
        height:100% !important;
        display:flex !important;
        flex-direction:column !important;
      }

      body #course-sec .course-single-bottom{
        flex:1 1 auto !important;
      }

      /* Imagen más proporcionada para que las tarjetas no se alarguen demasiado */
      body #course-sec .course-single-top .course-img{
        aspect-ratio:16/8.6 !important;
        margin-bottom:18px !important;
      }

      body #course-sec .course-single-top .course-img img{
        width:100% !important;
        height:100% !important;
        object-fit:cover !important;
      }

      body #course-sec .course-title{
        font-size:clamp(22px,2vw,32px) !important;
        line-height:1.1 !important;
        min-height:auto !important;
      }

      /* Tabs más compactos dentro de cada miniatura */
      body #course-sec .course-tab{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:10px !important;
      }

      body #course-sec .course-tab .nav-item{
        width:100% !important;
        flex:none !important;
      }

      body #course-sec .course-tab .nav-item:last-child{
        grid-column:1 / -1 !important;
      }

      body #course-sec .course-tab .nav-link{
        min-height:44px !important;
        font-size:13px !important;
        padding:9px 10px !important;
        white-space:normal !important;
      }

      /* Bloques internos: una sola columna para evitar texto partido */
      body #course-sec .checklist ul{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
      }

      body #course-sec .checklist li{
        width:100% !important;
        min-width:0 !important;
        max-width:100% !important;
        white-space:normal !important;
        word-break:normal !important;
        overflow-wrap:break-word !important;
        writing-mode:horizontal-tb !important;
        text-orientation:mixed !important;
        text-align:left !important;
        line-height:1.55 !important;
        font-size:14.6px !important;
      }

      body #course-sec .course-description p{
        text-align:justify !important;
        text-justify:inter-word !important;
        word-break:normal !important;
        overflow-wrap:break-word !important;
        writing-mode:horizontal-tb !important;
        text-orientation:mixed !important;
      }

      /* Horarios: solo 2 tarjetas, pero con ancho cómodo */
      body #course-sec .tab-pane .row.gy-4,
      body #course-sec .course-description .row.gy-4{
        display:grid !important;
        grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
        gap:18px !important;
      }

      body #course-sec .tab-pane .row.gy-4 > [class*="col-"],
      body #course-sec .course-description .row.gy-4 > [class*="col-"]{
        width:100% !important;
        max-width:100% !important;
        min-width:0 !important;
        flex:none !important;
      }

      body #course-sec .price-card_price,
      body #course-sec .horario-ciclo{
        white-space:normal !important;
        word-break:normal !important;
        overflow-wrap:break-word !important;
        writing-mode:horizontal-tb !important;
        text-orientation:mixed !important;
      }

      /* CTA más compacto en tarjetas de 2 columnas */
      body #course-sec .nostra-cycle-cta{
        padding:14px !important;
      }

      body #course-sec .nostra-cycle-cta__text{
        font-size:13.5px !important;
      }

      body #course-sec .nostra-cycle-cta__button{
        width:100% !important;
        min-height:44px !important;
      }

      @media(max-width:1199px){
        body #course-sec .filter-active{
          grid-template-columns:1fr !important;
        }
        body #course-sec .course-single-top .course-img{
          aspect-ratio:16/7.8 !important;
        }
      }

      @media(max-width:767px){
        body #course-sec .tab-pane .row.gy-4,
        body #course-sec .course-description .row.gy-4{
          grid-template-columns:1fr !important;
        }
        body #course-sec .course-description p{
          text-align:left !important;
        }
      }

      @media(max-width:575px){
        body #course-sec .course-tab{
          grid-template-columns:1fr !important;
        }
        body #course-sec .course-tab .nav-item:last-child{
          grid-column:auto !important;
        }
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
