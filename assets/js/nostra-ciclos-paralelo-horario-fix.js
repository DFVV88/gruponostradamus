/* ==================================================
   Grupo Nostradamus - Horario correcto Paralelo CEPRE UNI
   Corrige el horario mostrado en ciclos.html para el ciclo Paralelo CEPRE UNI.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isParaleloCard(card) {
    var title = card.querySelector('.course-title');
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

  function hideOldSchedules(card) {
    card.querySelectorAll('.nostra-turnos-final:not(.nostra-paralelo-horario-ok), .nostra-turns-grid, .price-card').forEach(function (el) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.margin = '0';
      el.style.padding = '0';
      el.style.overflow = 'hidden';
      el.classList.add('nostra-paralelo-old-hidden');
    });

    card.querySelectorAll('.row').forEach(function (row) {
      if (row.querySelector('.price-card, .nostra-turns-grid')) {
        row.style.display = 'none';
        row.classList.add('nostra-paralelo-old-hidden');
      }
    });
  }

  function applyFix() {
    document.querySelectorAll('#course-sec .course-single').forEach(function (card) {
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
