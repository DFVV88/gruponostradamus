/* ==================================================
   Grupo Nostradamus - Diseño PRO para subpágina Ciclos
   Mejora legibilidad, navegación, tarjetas, horarios y tabs.
   Añade botones comerciales de matrícula en cada ciclo.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-design-pro-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-design-pro-style';
    style.textContent = `
      body #course-sec .title-area{margin-bottom:24px !important;}

      body #course-sec .sub-title{
        display:inline-flex !important;align-items:center !important;justify-content:center !important;
        padding:8px 14px !important;border-radius:999px !important;
        background:linear-gradient(135deg,rgba(0,194,209,.12),#ffffff) !important;
        border:1px solid rgba(0,137,150,.16) !important;color:#008b96 !important;font-weight:900 !important;
      }

      body .tab-menu1.filter-menu-active{
        display:grid !important;grid-template-columns:repeat(5,minmax(0,1fr)) !important;gap:14px !important;
        width:100% !important;max-width:1180px !important;margin:0 auto 34px !important;padding:20px !important;
        border-radius:28px !important;
        background:radial-gradient(circle at 12% 18%, rgba(0,194,209,.18), transparent 30%),radial-gradient(circle at 88% 12%, rgba(255,255,255,.55), transparent 22%),linear-gradient(135deg,#061426 0%,#082238 58%,#06353c 100%) !important;
        border:1px solid rgba(0,194,209,.28) !important;box-shadow:0 22px 55px rgba(0,0,0,.16),0 0 32px rgba(0,194,209,.12) !important;
        position:relative !important;overflow:hidden !important;column-gap:14px !important;row-gap:14px !important;
      }

      body .tab-menu1.filter-menu-active:before{
        content:'Selecciona un ciclo y mira la información completa';grid-column:1 / -1;
        color:rgba(255,255,255,.78);font-size:13px;font-weight:850;letter-spacing:.4px;text-transform:uppercase;text-align:center;margin-bottom:2px;
      }

      body .tab-menu1.filter-menu-active:after{
        content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.08) 46%,transparent 62%);
        transform:translateX(-130%);animation:nostraCiclosSweep 6s ease-in-out infinite;pointer-events:none;
      }

      body .tab-menu1.filter-menu-active .filter-btn{
        position:relative !important;z-index:2 !important;width:100% !important;min-width:0 !important;min-height:66px !important;
        display:flex !important;align-items:center !important;justify-content:center !important;text-align:center !important;
        padding:12px 13px !important;border-radius:18px !important;color:#ffffff !important;background:rgba(255,255,255,.075) !important;
        border:1px solid rgba(255,255,255,.13) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 9px 20px rgba(0,0,0,.13) !important;
        font-size:13.5px !important;font-weight:950 !important;line-height:1.18 !important;letter-spacing:.25px !important;text-transform:uppercase !important;
        white-space:normal !important;word-break:normal !important;overflow-wrap:normal !important;
        transition:transform .25s ease, background .25s ease, box-shadow .25s ease, border-color .25s ease !important;
      }

      body .tab-menu1.filter-menu-active .filter-btn:before{
        content:'';position:absolute;left:12px;top:12px;width:8px;height:8px;border-radius:50%;background:#00d4df;box-shadow:0 0 12px rgba(0,212,223,.75);
      }

      body .tab-menu1.filter-menu-active .filter-btn::after{
        content:'Ver más' !important;position:absolute !important;right:10px !important;bottom:8px !important;margin:0 !important;
        padding:3px 7px !important;border-radius:999px !important;background:rgba(255,255,255,.12) !important;color:rgba(255,255,255,.78) !important;
        font-size:9.5px !important;font-weight:900 !important;line-height:1 !important;opacity:1 !important;transform:none !important;
      }

      body .tab-menu1.filter-menu-active .filter-btn:hover,
      body .tab-menu1.filter-menu-active .filter-btn.active{
        background:linear-gradient(135deg,#00c2d1,#008b96 52%,#045a69) !important;border-color:rgba(255,255,255,.28) !important;color:#ffffff !important;
        transform:translateY(-5px) scale(1.02) !important;box-shadow:0 16px 30px rgba(0,194,209,.22),0 0 24px rgba(0,194,209,.18) !important;
      }

      body #course-sec .filter-active{display:block !important;width:100% !important;height:auto !important;position:relative !important;overflow:visible !important;}
      body #course-sec .filter-active .filter-item{width:100% !important;max-width:100% !important;display:block !important;position:relative !important;left:auto !important;top:auto !important;transform:none !important;margin:0 0 34px !important;opacity:1 !important;clear:both !important;}
      body #course-sec .filter-active .filter-item > .course-single{width:100% !important;max-width:100% !important;margin:0 auto !important;}
      body #course-sec .filter-active .filter-item[style]{position:relative !important;left:auto !important;top:auto !important;transform:none !important;width:100% !important;}

      body .course-single{border-radius:26px !important;overflow:hidden !important;background:#ffffff !important;border:1px solid rgba(0,137,150,.14) !important;box-shadow:0 22px 55px rgba(0,0,0,.10), 0 0 30px rgba(0,194,209,.07) !important;}
      body .course-single-top{padding:20px !important;background:radial-gradient(circle at 12% 12%, rgba(0,194,209,.12), transparent 28%),linear-gradient(135deg,#f8ffff 0%,#eef9fb 100%) !important;}
      body .course-single-top .course-img{border-radius:22px !important;overflow:hidden !important;box-shadow:0 18px 38px rgba(0,0,0,.13) !important;margin-bottom:22px !important;}
      body .course-single-top .course-img img{width:100% !important;height:auto !important;display:block !important;}

      body .course-title{color:#061426 !important;font-size:clamp(25px,3vw,42px) !important;line-height:1.08 !important;font-weight:950 !important;letter-spacing:-.6px !important;margin:4px 0 0 !important;text-transform:uppercase !important;}
      body .course-single-bottom{padding:22px !important;}

      body .nostra-cycle-cta{
        display:flex !important;flex-wrap:wrap !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;
        margin:20px 0 0 !important;padding:16px !important;border-radius:20px !important;
        background:linear-gradient(135deg,#061426,#083044 62%,#008b96) !important;
        border:1px solid rgba(0,194,209,.28) !important;box-shadow:0 16px 34px rgba(0,0,0,.16),0 0 24px rgba(0,194,209,.12) !important;
      }

      body .nostra-cycle-cta__text{color:#ffffff !important;font-size:14.5px !important;font-weight:850 !important;line-height:1.35 !important;max-width:620px !important;}
      body .nostra-cycle-cta__text span{display:block !important;color:rgba(255,255,255,.72) !important;font-size:12px !important;font-weight:650 !important;margin-top:3px !important;}

      body .nostra-cycle-cta__button{
        display:inline-flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;
        min-height:46px !important;padding:12px 18px !important;border-radius:999px !important;
        background:linear-gradient(135deg,#25d366,#13a54d) !important;color:#ffffff !important;
        font-size:14px !important;font-weight:950 !important;letter-spacing:.2px !important;text-transform:uppercase !important;text-decoration:none !important;
        box-shadow:0 12px 24px rgba(37,211,102,.22), inset 0 1px 0 rgba(255,255,255,.22) !important;
        border:1px solid rgba(255,255,255,.18) !important;transition:transform .22s ease, box-shadow .22s ease !important;
        white-space:nowrap !important;
      }

      body .nostra-cycle-cta__button:hover{transform:translateY(-3px) scale(1.02) !important;box-shadow:0 18px 34px rgba(37,211,102,.32) !important;color:#ffffff !important;}
      body .nostra-cycle-cta__button:before{content:'📲';font-size:15px;}

      body .course-tab{display:flex !important;flex-wrap:wrap !important;gap:10px !important;margin:0 0 22px !important;padding:10px !important;border-radius:18px !important;background:linear-gradient(135deg,#061426,#0a2438) !important;border:1px solid rgba(0,194,209,.20) !important;}
      body .course-tab .nav-item{margin:0 !important;flex:1 1 150px !important;}
      body .course-tab .nav-link{width:100% !important;min-height:46px !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;padding:10px 12px !important;border-radius:14px !important;background:rgba(255,255,255,.075) !important;color:rgba(255,255,255,.88) !important;font-size:14px !important;font-weight:850 !important;line-height:1.15 !important;border:1px solid rgba(255,255,255,.08) !important;text-transform:none !important;}
      body .course-tab .nav-link.active, body .course-tab .nav-link:hover{background:linear-gradient(135deg,#00c2d1,#008b96) !important;color:#ffffff !important;border-color:rgba(255,255,255,.22) !important;box-shadow:0 12px 26px rgba(0,194,209,.25) !important;}

      body .tab-content{border-radius:22px !important;background:radial-gradient(circle at 90% 8%, rgba(0,194,209,.09), transparent 24%),linear-gradient(180deg,#ffffff 0%,#f7fbfc 100%) !important;border:1px solid rgba(0,137,150,.12) !important;padding:24px !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.80) !important;}
      body .course-description .h5, body .course-curriculam .h5{display:inline-flex !important;align-items:center !important;gap:9px !important;color:#061426 !important;font-size:22px !important;font-weight:950 !important;line-height:1.15 !important;margin:0 0 16px !important;padding:9px 14px !important;border-radius:999px !important;background:linear-gradient(135deg,#e7fbfd,#ffffff) !important;border:1px solid rgba(0,194,209,.24) !important;}
      body .course-description .h5:before, body .course-curriculam .h5:before{content:'';width:9px;height:9px;border-radius:50%;background:#00c2d1;box-shadow:0 0 12px rgba(0,194,209,.70);}

      body .course-description p{
        color:#243244 !important;font-size:16px !important;line-height:1.78 !important;font-weight:520 !important;margin-bottom:18px !important;
        text-align:justify !important;text-justify:inter-word !important;overflow-wrap:anywhere !important;hyphens:auto !important;
      }

      body .course-description p strong{display:inline-block !important;color:#061426 !important;font-weight:900 !important;background:linear-gradient(90deg,rgba(0,194,209,.12),rgba(255,255,255,.0)) !important;border-left:4px solid #00c2d1 !important;padding:7px 10px !important;border-radius:8px !important;margin:4px 0 !important;}

      body .checklist ul{display:grid !important;grid-template-columns:1fr !important;gap:11px !important;padding:0 !important;margin:0 !important;}
      body .checklist li{position:relative !important;list-style:none !important;color:#263648 !important;font-size:15.5px !important;line-height:1.58 !important;font-weight:560 !important;padding:14px 16px 14px 46px !important;margin:0 !important;border-radius:16px !important;background:#ffffff !important;border:1px solid rgba(0,137,150,.12) !important;box-shadow:0 8px 20px rgba(0,0,0,.045) !important;overflow-wrap:anywhere !important;text-align:justify !important;text-justify:inter-word !important;}
      body .checklist li:before{content:'✓' !important;position:absolute !important;left:14px !important;top:14px !important;width:22px !important;height:22px !important;border-radius:50% !important;display:flex !important;align-items:center !important;justify-content:center !important;background:linear-gradient(135deg,#00c2d1,#008b96) !important;color:#ffffff !important;font-size:12px !important;font-weight:900 !important;box-shadow:0 0 12px rgba(0,194,209,.24) !important;}

      body .tab-pane .row.gy-4, body .course-description .row.gy-4{display:flex !important;flex-wrap:wrap !important;justify-content:center !important;align-items:stretch !important;gap:18px 0 !important;}
      body .tab-pane .row.gy-4 > [class*="col-"], body .course-description .row.gy-4 > [class*="col-"]{min-width:260px !important;max-width:360px !important;flex:1 1 280px !important;}

      body .price-card{height:100% !important;min-height:210px !important;border-radius:20px !important;overflow:hidden !important;border:1px solid rgba(0,137,150,.16) !important;background:radial-gradient(circle at 90% 10%, rgba(0,194,209,.13), transparent 26%),linear-gradient(180deg,#ffffff,#f3fbfc) !important;box-shadow:0 14px 30px rgba(0,0,0,.07) !important;transition:transform .25s ease, box-shadow .25s ease !important;}
      body .price-card:hover{transform:translateY(-4px) !important;box-shadow:0 20px 38px rgba(0,0,0,.11),0 0 24px rgba(0,194,209,.12) !important;}
      body .price-card_top{padding:20px 18px !important;text-align:center !important;}
      body .price-card_title{display:inline-flex !important;align-items:center !important;justify-content:center !important;min-height:34px !important;padding:8px 14px !important;border-radius:999px !important;background:linear-gradient(135deg,#061426,#008b96) !important;color:#ffffff !important;font-size:15px !important;font-weight:950 !important;line-height:1.1 !important;text-transform:uppercase !important;letter-spacing:.3px !important;margin-bottom:14px !important;white-space:normal !important;word-break:normal !important;}
      body .price-card_price{color:#061426 !important;font-size:17px !important;font-weight:850 !important;line-height:1.45 !important;margin:6px 0 !important;overflow-wrap:normal !important;word-break:normal !important;white-space:normal !important;writing-mode:horizontal-tb !important;text-orientation:mixed !important;}
      body .horario-ciclo{display:block !important;margin-top:6px !important;color:#008b96 !important;font-size:15px !important;font-weight:900 !important;line-height:1.35 !important;writing-mode:horizontal-tb !important;text-orientation:mixed !important;white-space:normal !important;word-break:normal !important;}

      @keyframes nostraCiclosSweep{0%,42%{transform:translateX(-130%)}62%,100%{transform:translateX(130%)}}
      @media(min-width:1200px){body .tab-menu1.filter-menu-active{grid-template-columns:repeat(5,minmax(0,1fr)) !important;}}
      @media(min-width:992px) and (max-width:1199px){body .tab-menu1.filter-menu-active{grid-template-columns:repeat(3,minmax(0,1fr)) !important;} body .checklist ul{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}
      @media(min-width:992px){body .checklist ul{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}

      @media(max-width:991px){
        body .tab-menu1.filter-menu-active{grid-template-columns:repeat(2,minmax(0,1fr)) !important;padding:16px !important;gap:10px !important;}
        body .tab-menu1.filter-menu-active .filter-btn{min-height:58px !important;font-size:12.5px !important;}
        body .course-single-top, body .course-single-bottom{padding:16px !important;}
        body .tab-content{padding:18px !important;}
        body .course-tab .nav-item{flex:1 1 100% !important;}
        body .tab-pane .row.gy-4 > [class*="col-"], body .course-description .row.gy-4 > [class*="col-"]{min-width:220px !important;max-width:100% !important;}
        body .nostra-cycle-cta{align-items:stretch !important;}
        body .nostra-cycle-cta__button{width:100% !important;}
      }

      @media(max-width:575px){
        body .tab-menu1.filter-menu-active{grid-template-columns:1fr !important;border-radius:22px !important;}
        body .tab-menu1.filter-menu-active:before{font-size:11.5px;line-height:1.35;}
        body .tab-menu1.filter-menu-active .filter-btn{min-height:50px !important;}
        body .course-single{border-radius:20px !important;}
        body .course-title{font-size:24px !important;}
        body .course-description p, body .checklist li{font-size:14.5px !important;text-align:left !important;}
        body .price-card_title{font-size:13px !important;}
        body .price-card_price{font-size:15.5px !important;}
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

  function getCycleName(card) {
    var title = card.querySelector('.course-title');
    return (title && title.textContent ? title.textContent.trim() : 'Ciclo UNI');
  }

  function addMatriculaButtons() {
    document.querySelectorAll('#course-sec .course-single').forEach(function (card) {
      if (card.dataset.nostraCta === '1') return;
      card.dataset.nostraCta = '1';

      var cycle = getCycleName(card);
      var message = 'Hola Nostradamus, quiero matricularme o recibir informes sobre ' + cycle + '.';
      var url = 'https://wa.me/51993750351?text=' + encodeURIComponent(message);
      var top = card.querySelector('.course-single-top');
      if (!top) return;

      var cta = document.createElement('div');
      cta.className = 'nostra-cycle-cta';
      cta.innerHTML = '<div class="nostra-cycle-cta__text">¿Te interesa este ciclo?<span>Solicita informes, vacantes, horarios y matrícula por WhatsApp.</span></div><a class="nostra-cycle-cta__button" target="_blank" rel="noopener noreferrer" href="' + url + '">Matricularme</a>';
      top.appendChild(cta);
    });

    document.querySelectorAll('.nostra-cycle-cta__button').forEach(function (btn) {
      if (btn.dataset.nostraTracked === '1') return;
      btn.dataset.nostraTracked = '1';
      btn.addEventListener('click', function () {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'click_matricula_ciclo', {
            event_category: 'conversion',
            event_label: btn.closest('.course-single') ? getCycleName(btn.closest('.course-single')) : 'Ciclo UNI',
            link_url: btn.href,
            page_path: window.location.pathname
          });
        }
      });
    });
  }

  function stabilizeLayout() {
    document.querySelectorAll('#course-sec .filter-active, #course-sec .filter-active .filter-item').forEach(function (el) {
      el.style.height = 'auto';
      el.style.position = 'relative';
      el.style.transform = 'none';
      el.style.left = 'auto';
      el.style.top = 'auto';
      el.style.width = '100%';
    });
  }

  function init() {
    injectStyles();
    polishText();
    stabilizeLayout();
    addMatriculaButtons();
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
    setTimeout(init, 3000);
  });
})();
