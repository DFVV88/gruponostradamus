/* ==================================================
   Grupo Nostradamus - Ajuste definitivo de bloques de horarios en Ciclos
   Mejora la presentación en PC y móvil: horarios amplios, legibles,
   sin miniaturas comprimidas y con mejor jerarquía visual.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-horarios-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-horarios-fix-style';
    style.textContent = `
      body #course-sec .tab-content{
        overflow:visible !important;
      }

      body #course-sec .course-description p{
        max-width:100% !important;
      }

      body #course-sec .course-description p strong{
        display:block !important;
        width:100% !important;
        margin:10px 0 12px !important;
        padding:12px 14px !important;
        border-left:5px solid #00c2d1 !important;
        border-radius:12px !important;
        background:linear-gradient(90deg,rgba(0,194,209,.14),rgba(255,255,255,.92)) !important;
        color:#061426 !important;
        font-weight:950 !important;
        line-height:1.45 !important;
      }

      body #course-sec .course-description .row.gy-4,
      body #course-sec .tab-pane .row.gy-4{
        width:100% !important;
        margin:18px 0 0 !important;
        display:grid !important;
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        gap:18px !important;
        align-items:stretch !important;
        justify-content:stretch !important;
      }

      body #course-sec .course-description .row.gy-4 > [class*="col-"],
      body #course-sec .tab-pane .row.gy-4 > [class*="col-"]{
        width:100% !important;
        max-width:none !important;
        min-width:0 !important;
        flex:none !important;
        padding:0 !important;
        display:flex !important;
      }

      body #course-sec .price-card{
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        border-radius:22px !important;
        border:1px solid rgba(0,194,209,.24) !important;
        background:
          radial-gradient(circle at 0% 0%, rgba(0,194,209,.20), transparent 34%),
          radial-gradient(circle at 100% 0%, rgba(0,139,150,.12), transparent 30%),
          linear-gradient(180deg,#ffffff 0%,#f2fdff 100%) !important;
        box-shadow:0 16px 34px rgba(6,20,38,.08), inset 0 1px 0 rgba(255,255,255,.92) !important;
        overflow:hidden !important;
        transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease !important;
      }

      body #course-sec .price-card:hover{
        transform:translateY(-5px) !important;
        border-color:rgba(0,194,209,.46) !important;
        box-shadow:0 24px 48px rgba(6,20,38,.13),0 0 28px rgba(0,194,209,.14) !important;
      }

      body #course-sec .price-card_top{
        width:100% !important;
        min-height:0 !important;
        padding:18px !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        align-items:start !important;
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
        background:linear-gradient(135deg,#008b96 0%,#006b78 48%,#052d3a 100%) !important;
        color:#ffffff !important;
        font-size:14.5px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
        letter-spacing:.2px !important;
        text-transform:uppercase !important;
        text-align:center !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 10px 22px rgba(0,139,150,.23), inset 0 1px 0 rgba(255,255,255,.18) !important;
      }

      body #course-sec .price-card_price{
        width:100% !important;
        margin:0 !important;
        padding:14px 15px 14px 48px !important;
        display:block !important;
        position:relative !important;
        border-radius:17px !important;
        background:rgba(255,255,255,.92) !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#061426 !important;
        font-size:14.2px !important;
        font-weight:900 !important;
        line-height:1.35 !important;
        text-align:left !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
        box-shadow:0 8px 18px rgba(6,20,38,.045) !important;
      }

      body #course-sec .price-card_price::before{
        content:'🕘' !important;
        position:absolute !important;
        left:14px !important;
        top:14px !important;
        width:24px !important;
        height:24px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        border-radius:50% !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:12px !important;
        box-shadow:0 0 14px rgba(0,194,209,.25) !important;
      }

      body #course-sec .price-card_price::after{
        content:'Horario' !important;
        display:block !important;
        margin-bottom:4px !important;
        color:#008b96 !important;
        font-size:10px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.45px !important;
        text-transform:uppercase !important;
      }

      body #course-sec .horario-ciclo{
        display:inline !important;
        margin:0 !important;
        color:#008b96 !important;
        font-size:14.2px !important;
        font-weight:950 !important;
        line-height:1.35 !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      body #course-sec .price-card_price + .price-card_price{
        margin-top:10px !important;
      }

      @media(min-width:1200px){
        body #course-sec .course-description .row.gy-4,
        body #course-sec .tab-pane .row.gy-4{
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        }

        body #course-sec .course-single-bottom{
          padding-left:20px !important;
          padding-right:20px !important;
        }

        body #course-sec .tab-content{
          padding:20px !important;
        }
      }

      @media(min-width:768px) and (max-width:1199px){
        body #course-sec .course-description .row.gy-4,
        body #course-sec .tab-pane .row.gy-4{
          grid-template-columns:1fr !important;
        }
      }

      @media(max-width:767px){
        body #course-sec .course-description .row.gy-4,
        body #course-sec .tab-pane .row.gy-4{
          grid-template-columns:1fr !important;
          gap:14px !important;
          margin-top:16px !important;
        }

        body #course-sec .tab-content{
          padding:14px !important;
        }

        body #course-sec .course-description p strong{
          font-size:15px !important;
          line-height:1.45 !important;
          padding:10px 12px !important;
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
          padding:12px 13px 12px 44px !important;
          font-size:14px !important;
          line-height:1.38 !important;
        }

        body #course-sec .price-card_price::before{
          left:12px !important;
          top:12px !important;
          width:22px !important;
          height:22px !important;
          font-size:11px !important;
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
