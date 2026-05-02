/* ==================================================
   Grupo Nostradamus - Ajuste premium de horarios en Ciclos
   Reemplaza las miniaturas comprimidas por bloques compactos,
   verticales, limpios y legibles en cada tarjeta.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    var oldStyle = document.getElementById('nostra-ciclos-horarios-fix-style');
    if (oldStyle) oldStyle.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-horarios-fix-style';
    style.textContent = `
      body #course-sec .tab-content{
        overflow:visible !important;
      }

      body #course-sec .course-description p strong{
        display:block !important;
        width:100% !important;
        margin:10px 0 14px !important;
        padding:12px 14px !important;
        border-left:5px solid #00c2d1 !important;
        border-radius:12px !important;
        background:linear-gradient(90deg,rgba(0,194,209,.14),rgba(255,255,255,.92)) !important;
        color:#061426 !important;
        font-weight:950 !important;
        line-height:1.45 !important;
      }

      /* CONTENEDOR DE HORARIOS: siempre ordenado, sin columnas angostas */
      body #course-sec .course-description .row.gy-4,
      body #course-sec .tab-pane .row.gy-4{
        width:100% !important;
        margin:16px 0 0 !important;
        padding:0 !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        align-items:stretch !important;
        justify-content:stretch !important;
      }

      body #course-sec .course-description .row.gy-4 > [class*="col-"],
      body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
        width:100% !important;
        max-width:100% !important;
        min-width:0 !important;
        flex:none !important;
        padding:0 !important;
        margin:0 !important;
        display:block !important;
      }

      /* TARJETA DE TURNO */
      body #course-sec .price-card{
        width:100% !important;
        height:auto !important;
        min-height:0 !important;
        margin:0 !important;
        border-radius:18px !important;
        border:1px solid rgba(0,194,209,.28) !important;
        background:
          radial-gradient(circle at 0% 0%, rgba(0,194,209,.18), transparent 34%),
          linear-gradient(180deg,#ffffff 0%,#f4fdff 100%) !important;
        box-shadow:0 12px 26px rgba(6,20,38,.07), inset 0 1px 0 rgba(255,255,255,.92) !important;
        overflow:hidden !important;
        transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease !important;
      }

      body #course-sec .price-card:hover{
        transform:translateY(-3px) !important;
        border-color:rgba(0,194,209,.48) !important;
        box-shadow:0 18px 36px rgba(6,20,38,.11),0 0 22px rgba(0,194,209,.12) !important;
      }

      body #course-sec .price-card_top{
        width:100% !important;
        min-height:0 !important;
        padding:13px !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:9px !important;
        align-items:stretch !important;
        justify-items:stretch !important;
        text-align:left !important;
      }

      /* TÍTULO DEL TURNO: barra completa, no pastilla al costado */
      body #course-sec .price-card_title{
        width:100% !important;
        min-width:0 !important;
        min-height:40px !important;
        margin:0 !important;
        padding:11px 14px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:14px !important;
        background:linear-gradient(135deg,#008b96 0%,#006b78 50%,#052d3a 100%) !important;
        color:#ffffff !important;
        font-size:13px !important;
        font-weight:950 !important;
        line-height:1.12 !important;
        letter-spacing:.2px !important;
        text-transform:uppercase !important;
        text-align:center !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 8px 18px rgba(0,139,150,.20), inset 0 1px 0 rgba(255,255,255,.18) !important;
      }

      /* HORARIO: bloque ancho y compacto */
      body #course-sec .price-card_price{
        width:100% !important;
        margin:0 !important;
        padding:11px 12px 11px 42px !important;
        display:block !important;
        position:relative !important;
        border-radius:14px !important;
        background:rgba(255,255,255,.94) !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#061426 !important;
        font-size:13px !important;
        font-weight:900 !important;
        line-height:1.34 !important;
        text-align:left !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 7px 14px rgba(6,20,38,.045) !important;
      }

      body #course-sec .price-card_price::before{
        content:'🕘' !important;
        position:absolute !important;
        left:11px !important;
        top:11px !important;
        width:22px !important;
        height:22px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:50% !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:11px !important;
        box-shadow:0 0 12px rgba(0,194,209,.25) !important;
      }

      body #course-sec .price-card_price::after{
        content:'Horario' !important;
        display:block !important;
        margin-bottom:4px !important;
        color:#008b96 !important;
        font-size:9.5px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.45px !important;
        text-transform:uppercase !important;
      }

      body #course-sec .price-card_price + .price-card_price{
        margin-top:0 !important;
      }

      body #course-sec .horario-ciclo{
        display:inline !important;
        margin:0 !important;
        color:#008b96 !important;
        font-size:13px !important;
        font-weight:950 !important;
        line-height:1.34 !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      @media(min-width:992px){
        body #course-sec .course-description .row.gy-4,
        body #course-sec .tab-pane .row.gy-4{
          gap:13px !important;
        }

        body #course-sec .price-card_top{
          padding:14px !important;
        }
      }

      @media(max-width:767px){
        body #course-sec .tab-content{
          padding:14px !important;
        }

        body #course-sec .course-description p strong{
          font-size:15px !important;
          line-height:1.45 !important;
          padding:10px 12px !important;
        }

        body #course-sec .price-card{
          border-radius:16px !important;
        }

        body #course-sec .price-card_title{
          font-size:12.8px !important;
        }

        body #course-sec .price-card_price,
        body #course-sec .horario-ciclo{
          font-size:12.8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyInlineFixes() {
    document.querySelectorAll('#course-sec .course-description .row.gy-4, #course-sec .tab-pane .row.gy-4').forEach(function (row) {
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr';
      row.style.gap = '12px';
      row.style.marginLeft = '0';
      row.style.marginRight = '0';
    });

    document.querySelectorAll('#course-sec .course-description .row.gy-4 > [class*="col-"], #course-sec .tab-pane .row.gy-4 > [class*="col-"]').forEach(function (col) {
      col.style.width = '100%';
      col.style.maxWidth = '100%';
      col.style.minWidth = '0';
      col.style.flex = 'none';
      col.style.padding = '0';
    });
  }

  function init() {
    injectStyles();
    applyInlineFixes();
    setTimeout(applyInlineFixes, 400);
    setTimeout(applyInlineFixes, 1200);
    setTimeout(applyInlineFixes, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
