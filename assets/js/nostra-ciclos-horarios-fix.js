/* ==================================================
   Grupo Nostradamus - Mejora visual de horarios en Ciclos
   Corrige las miniaturas/tarjetas de turnos para que no se vean apretadas
   en móvil y mantengan una presentación clara y comercial.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-horarios-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-horarios-fix-style';
    style.textContent = `
      body #course-sec .course-description .row.gy-4{
        align-items:stretch !important;
        row-gap:18px !important;
      }

      body #course-sec .course-description .row.gy-4 > [class*="col-"],
      body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
        display:flex !important;
      }

      body #course-sec .price-card{
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        border-radius:22px !important;
        border:1px solid rgba(0,194,209,.28) !important;
        background:
          radial-gradient(circle at 10% 0%, rgba(0,194,209,.16), transparent 34%),
          linear-gradient(180deg,#ffffff 0%,#f3fdff 100%) !important;
        box-shadow:0 14px 30px rgba(6,20,38,.08), inset 0 1px 0 rgba(255,255,255,.88) !important;
        overflow:hidden !important;
      }

      body #course-sec .price-card_top{
        width:100% !important;
        min-height:0 !important;
        padding:18px !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        align-items:stretch !important;
        justify-items:stretch !important;
        text-align:left !important;
      }

      body #course-sec .price-card_title{
        width:100% !important;
        min-width:0 !important;
        min-height:48px !important;
        margin:0 !important;
        padding:13px 18px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#008b96 0%,#006b78 52%,#05313e 100%) !important;
        color:#ffffff !important;
        font-size:15px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
        letter-spacing:.25px !important;
        text-transform:uppercase !important;
        text-align:center !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 10px 22px rgba(0,139,150,.22) !important;
      }

      body #course-sec .price-card_price{
        width:100% !important;
        margin:0 !important;
        padding:14px 16px !important;
        display:block !important;
        border-radius:16px !important;
        background:rgba(255,255,255,.88) !important;
        border:1px solid rgba(0,137,150,.12) !important;
        color:#061426 !important;
        font-size:15px !important;
        font-weight:900 !important;
        line-height:1.35 !important;
        text-align:left !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 8px 18px rgba(6,20,38,.045) !important;
      }

      body #course-sec .price-card_price::before{
        content:'🕘 Horario';
        display:block !important;
        margin-bottom:6px !important;
        color:#008b96 !important;
        font-size:11px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.4px !important;
        text-transform:uppercase !important;
      }

      body #course-sec .horario-ciclo{
        display:inline !important;
        margin:0 !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:950 !important;
        line-height:1.35 !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      body #course-sec .price-card:hover{
        transform:translateY(-4px) !important;
        box-shadow:0 20px 42px rgba(6,20,38,.12),0 0 26px rgba(0,194,209,.13) !important;
      }

      @media(min-width:768px){
        body #course-sec .course-description .row.gy-4 > [class*="col-"],
        body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
          max-width:420px !important;
          flex:1 1 320px !important;
        }
      }

      @media(max-width:575px){
        body #course-sec .tab-content{
          padding:14px !important;
        }

        body #course-sec .course-description p strong{
          display:block !important;
          font-size:15px !important;
          line-height:1.45 !important;
          padding:10px 12px !important;
          margin:8px 0 !important;
        }

        body #course-sec .course-description .row.gy-4 > [class*="col-"],
        body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
          min-width:100% !important;
          max-width:100% !important;
          flex:1 1 100% !important;
        }

        body #course-sec .price-card{
          border-radius:18px !important;
        }

        body #course-sec .price-card_top{
          padding:14px !important;
          gap:10px !important;
        }

        body #course-sec .price-card_title{
          min-height:44px !important;
          padding:12px 14px !important;
          font-size:13.5px !important;
        }

        body #course-sec .price-card_price{
          padding:12px 13px !important;
          font-size:14px !important;
          line-height:1.38 !important;
        }

        body #course-sec .horario-ciclo{
          font-size:14px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
