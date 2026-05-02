/* ==================================================
   Grupo Nostradamus - Horario correcto Paralelo CEPRE UNI
   Corrige el horario mostrado en ciclos.html y en ciclo-paralelo-cepre-uni.html.
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
    if (document.getElementById('nostra-paralelo-horario-page-style')) return;
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
        margin:18px 0 0 !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
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
