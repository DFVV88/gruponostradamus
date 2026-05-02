/* ==================================================
   Grupo Nostradamus - Horario correcto Paralelo CEPRE UNI
   Corrige el horario mostrado en ciclos.html y en ciclo-paralelo-cepre-uni.html.
   Incluye estilos propios para que el horario no aparezca como texto plano.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  var file = path.split('/').pop() || '';
  var isCiclos = path.indexOf('ciclos.html') !== -1 || path === '/ciclos';
  var isParaleloPage = file === 'ciclo-paralelo-cepre-uni.html';
  if (!isCiclos && !isParaleloPage) return;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isParaleloCard(card) {
    if (isParaleloPage) return true;
    var title = card.querySelector('.course-title, .breadcumb-title');
    return title && normalize(title.textContent).indexOf('ciclo paralelo cepre uni') !== -1;
  }

  function buildCorrectSchedule() {
    return '' +
      '<div class="nostra-turnos-final nostra-paralelo-horario-ok">' +
        '<div class="nostra-turno-final-card">' +
          '<div class="nostra-turno-final-title">TURNO TARDE</div>' +
          '<div class="nostra-turno-final-info">' +
            '<div class="nostra-turno-final-line">' +
              '<span class="nostra-turno-final-label">HORARIO</span>' +
              '<span class="nostra-turno-final-days">Lunes a Sábados</span>' +
              '<span class="nostra-turno-final-time">3:30 p. m. – 7:30 p. m.</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function injectStyles() {
    var old = document.getElementById('nostra-paralelo-horario-page-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-paralelo-horario-page-style';
    style.textContent = `
      body .nostra-paralelo-old-hidden{
        display:none !important;
        visibility:hidden !important;
        height:0 !important;
        min-height:0 !important;
        max-height:0 !important;
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
        overflow:hidden !important;
        opacity:0 !important;
        pointer-events:none !important;
      }

      body .nostra-paralelo-horario-ok{
        width:100% !important;
        margin:26px 0 0 !important;
        display:grid !important;
        grid-template-columns:minmax(280px,460px) !important;
        justify-content:start !important;
        gap:12px !important;
        font-family:'Jost', Arial, sans-serif !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-card{
        width:100% !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
        padding:16px !important;
        border-radius:22px !important;
        background:linear-gradient(180deg,#f4feff 0%,#ffffff 100%) !important;
        border:1px solid rgba(0,194,209,.30) !important;
        box-shadow:0 16px 36px rgba(6,20,38,.08), inset 0 1px 0 rgba(255,255,255,.92) !important;
        overflow:hidden !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-title{
        width:100% !important;
        min-height:46px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:12px 18px !important;
        border-radius:16px !important;
        background:linear-gradient(135deg,#008b96 0%,#006a78 50%,#052b38 100%) !important;
        color:#fff !important;
        font-size:16px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
        text-align:center !important;
        text-transform:uppercase !important;
        letter-spacing:.25px !important;
        box-shadow:0 10px 22px rgba(0,139,150,.24) !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-info{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:9px !important;
        width:100% !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-line{
        position:relative !important;
        width:100% !important;
        min-height:82px !important;
        display:grid !important;
        grid-template-columns:30px 1fr !important;
        grid-template-areas:
          "icon label"
          "icon days"
          "icon time" !important;
        column-gap:12px !important;
        row-gap:5px !important;
        align-items:start !important;
        padding:15px 16px !important;
        border-radius:18px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.15) !important;
        color:#061426 !important;
        text-align:left !important;
        box-shadow:0 9px 20px rgba(6,20,38,.055) !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-line:before{
        content:'🕘' !important;
        grid-area:icon !important;
        width:28px !important;
        height:28px !important;
        margin-top:1px !important;
        border-radius:999px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:13px !important;
        box-shadow:0 0 12px rgba(0,194,209,.25) !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-line:after{
        content:none !important;
        display:none !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-label{
        grid-area:label !important;
        display:block !important;
        color:#008b96 !important;
        font-size:11px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.65px !important;
        text-transform:uppercase !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-days{
        grid-area:days !important;
        display:block !important;
        color:#061426 !important;
        font-size:16px !important;
        font-weight:950 !important;
        line-height:1.18 !important;
      }

      body .nostra-paralelo-horario-ok .nostra-turno-final-time{
        grid-area:time !important;
        display:inline-flex !important;
        align-items:center !important;
        width:max-content !important;
        max-width:100% !important;
        margin-top:2px !important;
        padding:6px 12px !important;
        border-radius:999px !important;
        background:rgba(0,194,209,.11) !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:950 !important;
        line-height:1.15 !important;
      }

      @media(max-width:575px){
        body .nostra-paralelo-horario-ok{
          grid-template-columns:1fr !important;
          margin-top:20px !important;
        }
        body .nostra-paralelo-horario-ok .nostra-turno-final-card{
          padding:12px !important;
          border-radius:18px !important;
        }
        body .nostra-paralelo-horario-ok .nostra-turno-final-title{
          font-size:14px !important;
          min-height:42px !important;
        }
        body .nostra-paralelo-horario-ok .nostra-turno-final-days{
          font-size:14px !important;
        }
        body .nostra-paralelo-horario-ok .nostra-turno-final-time{
          font-size:13px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function hideOldSchedules(card) {
    card.querySelectorAll('.nostra-turnos-final:not(.nostra-paralelo-horario-ok), .nostra-turns-grid, .price-card').forEach(function (el) {
      el.classList.add('nostra-paralelo-old-hidden');
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.margin = '0';
      el.style.padding = '0';
      el.style.overflow = 'hidden';
    });

    card.querySelectorAll('.row').forEach(function (row) {
      if (row.querySelector('.price-card, .nostra-turns-grid')) {
        row.classList.add('nostra-paralelo-old-hidden');
        row.style.display = 'none';
      }
    });
  }

  function applyFix() {
    injectStyles();

    document.querySelectorAll('.course-single').forEach(function (card) {
      if (!isParaleloCard(card)) return;

      hideOldSchedules(card);

      var pane = card.querySelector('.tab-pane.active') || card.querySelector('.tab-pane') || card.querySelector('.course-description');
      if (!pane) return;

      var existing = card.querySelector('.nostra-paralelo-horario-ok');
      if (existing) return;

      var temp = document.createElement('div');
      temp.innerHTML = buildCorrectSchedule();
      var schedule = temp.firstChild;

      var desc = card.querySelector('.course-description');
      if (desc && desc.parentNode) {
        desc.parentNode.insertBefore(schedule, desc.nextSibling);
      } else {
        pane.appendChild(schedule);
      }
    });
  }

  function init() {
    applyFix();
    setTimeout(applyFix, 300);
    setTimeout(applyFix, 900);
    setTimeout(applyFix, 1800);
    setTimeout(applyFix, 3500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
})();
