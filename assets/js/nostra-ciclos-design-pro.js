/* ==================================================
   Grupo Nostradamus - Diseño PRO para subpágina Ciclos
   Mejora legibilidad, tarjetas, horarios y tabs en ciclos.html.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-design-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-design-pro-style';
    style.textContent = `
      body .course-single{
        border-radius:26px !important;
        overflow:hidden !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.14) !important;
        box-shadow:0 22px 55px rgba(0,0,0,.10), 0 0 30px rgba(0,194,209,.07) !important;
      }

      body .course-single-top{
        padding:20px !important;
        background:
          radial-gradient(circle at 12% 12%, rgba(0,194,209,.12), transparent 28%),
          linear-gradient(135deg,#f8ffff 0%,#eef9fb 100%) !important;
      }

      body .course-single-top .course-img{
        border-radius:22px !important;
        overflow:hidden !important;
        box-shadow:0 18px 38px rgba(0,0,0,.13) !important;
        margin-bottom:22px !important;
      }

      body .course-single-top .course-img img{
        width:100% !important;
        height:auto !important;
        display:block !important;
      }

      body .course-title{
        color:#061426 !important;
        font-size:clamp(25px,3vw,42px) !important;
        line-height:1.08 !important;
        font-weight:950 !important;
        letter-spacing:-.6px !important;
        margin:4px 0 0 !important;
        text-transform:uppercase !important;
      }

      body .course-single-bottom{
        padding:22px !important;
      }

      body .course-tab{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:10px !important;
        margin:0 0 22px !important;
        padding:10px !important;
        border-radius:18px !important;
        background:linear-gradient(135deg,#061426,#0a2438) !important;
        border:1px solid rgba(0,194,209,.20) !important;
      }

      body .course-tab .nav-item{
        margin:0 !important;
        flex:1 1 150px !important;
      }

      body .course-tab .nav-link{
        width:100% !important;
        min-height:46px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        padding:10px 12px !important;
        border-radius:14px !important;
        background:rgba(255,255,255,.075) !important;
        color:rgba(255,255,255,.88) !important;
        font-size:14px !important;
        font-weight:850 !important;
        line-height:1.15 !important;
        border:1px solid rgba(255,255,255,.08) !important;
        text-transform:none !important;
      }

      body .course-tab .nav-link.active,
      body .course-tab .nav-link:hover{
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#ffffff !important;
        border-color:rgba(255,255,255,.22) !important;
        box-shadow:0 12px 26px rgba(0,194,209,.25) !important;
      }

      body .tab-content{
        border-radius:22px !important;
        background:
          radial-gradient(circle at 90% 8%, rgba(0,194,209,.09), transparent 24%),
          linear-gradient(180deg,#ffffff 0%,#f7fbfc 100%) !important;
        border:1px solid rgba(0,137,150,.12) !important;
        padding:24px !important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.80) !important;
      }

      body .course-description,
      body .course-curriculam{
        max-width:100% !important;
      }

      body .course-description .h5,
      body .course-curriculam .h5{
        display:inline-flex !important;
        align-items:center !important;
        gap:9px !important;
        color:#061426 !important;
        font-size:22px !important;
        font-weight:950 !important;
        line-height:1.15 !important;
        margin:0 0 16px !important;
        padding:9px 14px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#e7fbfd,#ffffff) !important;
        border:1px solid rgba(0,194,209,.24) !important;
      }

      body .course-description .h5:before,
      body .course-curriculam .h5:before{
        content:'';
        width:9px;
        height:9px;
        border-radius:50%;
        background:#00c2d1;
        box-shadow:0 0 12px rgba(0,194,209,.70);
      }

      body .course-description p{
        color:#243244 !important;
        font-size:16px !important;
        line-height:1.78 !important;
        font-weight:520 !important;
        margin-bottom:18px !important;
        text-align:left !important;
        overflow-wrap:anywhere !important;
      }

      body .course-description p strong{
        display:inline-block !important;
        color:#061426 !important;
        font-weight:900 !important;
        background:linear-gradient(90deg,rgba(0,194,209,.12),rgba(255,255,255,.0)) !important;
        border-left:4px solid #00c2d1 !important;
        padding:7px 10px !important;
        border-radius:8px !important;
        margin:4px 0 !important;
      }

      body .checklist ul{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:11px !important;
        padding:0 !important;
        margin:0 !important;
      }

      body .checklist li{
        position:relative !important;
        list-style:none !important;
        color:#263648 !important;
        font-size:15.5px !important;
        line-height:1.58 !important;
        font-weight:560 !important;
        padding:14px 16px 14px 46px !important;
        margin:0 !important;
        border-radius:16px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.12) !important;
        box-shadow:0 8px 20px rgba(0,0,0,.045) !important;
        overflow-wrap:anywhere !important;
      }

      body .checklist li:before{
        content:'✓' !important;
        position:absolute !important;
        left:14px !important;
        top:14px !important;
        width:22px !important;
        height:22px !important;
        border-radius:50% !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#ffffff !important;
        font-size:12px !important;
        font-weight:900 !important;
        box-shadow:0 0 12px rgba(0,194,209,.24) !important;
      }

      body .course-description .row.gy-4,
      body .tab-pane .row.gy-4{
        margin-top:18px !important;
      }

      body .price-card{
        height:100% !important;
        border-radius:20px !important;
        overflow:hidden !important;
        border:1px solid rgba(0,137,150,.16) !important;
        background:
          radial-gradient(circle at 90% 10%, rgba(0,194,209,.13), transparent 26%),
          linear-gradient(180deg,#ffffff,#f3fbfc) !important;
        box-shadow:0 14px 30px rgba(0,0,0,.07) !important;
        transition:transform .25s ease, box-shadow .25s ease !important;
      }

      body .price-card:hover{
        transform:translateY(-4px) !important;
        box-shadow:0 20px 38px rgba(0,0,0,.11),0 0 24px rgba(0,194,209,.12) !important;
      }

      body .price-card_top{
        padding:20px 18px !important;
        text-align:center !important;
      }

      body .price-card_title{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        min-height:34px !important;
        padding:8px 14px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#061426,#008b96) !important;
        color:#ffffff !important;
        font-size:15px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
        text-transform:uppercase !important;
        letter-spacing:.3px !important;
        margin-bottom:14px !important;
      }

      body .price-card_price{
        color:#061426 !important;
        font-size:17px !important;
        font-weight:850 !important;
        line-height:1.45 !important;
        margin:6px 0 !important;
        overflow-wrap:anywhere !important;
      }

      body .horario-ciclo{
        display:block !important;
        margin-top:6px !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:900 !important;
        line-height:1.35 !important;
      }

      body #course-sec .filter-menu-active,
      body .tab-menu1.filter-menu-active{
        gap:12px !important;
        column-gap:12px !important;
        row-gap:12px !important;
        padding:14px !important;
        border-radius:22px !important;
        background:linear-gradient(135deg,#ffffff,#effcfd) !important;
        border:1px solid rgba(0,137,150,.13) !important;
        box-shadow:0 16px 34px rgba(0,0,0,.07) !important;
      }

      body .tab-menu1.filter-menu-active .filter-btn{
        border-radius:999px !important;
        padding:10px 16px !important;
        font-size:14px !important;
        font-weight:900 !important;
        color:#061426 !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.18) !important;
        box-shadow:0 7px 16px rgba(0,0,0,.05) !important;
      }

      body .tab-menu1.filter-menu-active .filter-btn.active,
      body .tab-menu1.filter-menu-active .filter-btn:hover{
        background:linear-gradient(135deg,#061426,#008b96) !important;
        color:#ffffff !important;
        border-color:rgba(0,194,209,.45) !important;
      }

      @media(min-width:992px){
        body .checklist ul{
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        }
      }

      @media(max-width:991px){
        body .course-single-top,
        body .course-single-bottom{
          padding:16px !important;
        }
        body .tab-content{
          padding:18px !important;
        }
        body .course-tab .nav-item{
          flex:1 1 100% !important;
        }
      }

      @media(max-width:575px){
        body .course-single{
          border-radius:20px !important;
        }
        body .course-title{
          font-size:24px !important;
        }
        body .course-description p,
        body .checklist li{
          font-size:14.5px !important;
        }
        body .price-card_title{
          font-size:13px !important;
        }
        body .price-card_price{
          font-size:15.5px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function polishText() {
    document.querySelectorAll('.course-description p, .checklist li, .price-card_price').forEach(function (el) {
      el.innerHTML = el.innerHTML
        .replace(/\bSabados\b/g, 'Sábados')
        .replace(/\bSabado\b/g, 'Sábado')
        .replace(/\bteoria\b/g, 'teoría')
        .replace(/\bcomprension\b/g, 'comprensión')
        .replace(/\bcalificaciónes\b/g, 'calificaciones')
        .replace(/\bBridando\b/g, 'Brindando')
        .replace(/\bscaner\b/g, 'escáner')
        .replace(/\binteracccion\b/g, 'interacción')
        .replace(/\baul cuenta\b/g, 'aula cuenta')
        .replace(/\.\.<br/g, '.<br');
    });
  }

  function wrapDescriptionIntro() {
    document.querySelectorAll('.course-description').forEach(function (box) {
      if (box.dataset.nostraPolished === '1') return;
      box.dataset.nostraPolished = '1';
      var p = box.querySelector('p');
      if (p) p.classList.add('nostra-cycle-intro');
    });
  }

  function init() {
    injectStyles();
    polishText();
    wrapDescriptionIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
  });
})();
