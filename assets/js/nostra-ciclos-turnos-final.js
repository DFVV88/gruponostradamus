/* ==================================================
   Grupo Nostradamus - Turnos FINAL para ciclos.html
   Convierte los horarios antiguos en bloques verticales premium.
   Oculta cualquier versión anterior para evitar duplicados.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function normalizeText(value) {
    return (value || '')
      .replace(/\s+/g, ' ')
      .replace(/Sabados/g, 'Sábados')
      .replace(/Sabado/g, 'Sábado')
      .replace(/Lunes a Sabado/g, 'Lunes a Sábado')
      .trim();
  }

  function formatTime(value) {
    return normalizeText(value)
      .replace(/a\.m\./gi, 'a. m.')
      .replace(/p\.m\./gi, 'p. m.')
      .replace(/\s+a\s+(?=\d)/i, ' – ');
  }

  function formatLine(text) {
    var clean = normalizeText(text);
    var match = clean.match(/^(.+?)\s*\(([^)]+)\)\s*(.*)$/);

    if (match) {
      var days = normalizeText(match[1]);
      var time = formatTime(match[2]);
      var extra = normalizeText(match[3]);
      return '<span class="nostra-turno-final-label">HORARIO</span>' +
        '<span class="nostra-turno-final-days">' + days + '</span>' +
        '<span class="nostra-turno-final-time">' + time + '</span>' +
        (extra ? '<span class="nostra-turno-final-extra">' + extra + '</span>' : '');
    }

    return '<span class="nostra-turno-final-label">HORARIO</span>' +
      '<span class="nostra-turno-final-days">' + clean + '</span>';
  }

  function injectStyles() {
    var previous = document.getElementById('nostra-ciclos-turnos-final-style');
    if (previous) previous.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-turnos-final-style';
    style.textContent = `
      body #course-sec .nostra-turns-grid,
      body #course-sec .nostra-turn-source,
      body #course-sec .nostra-turn-source.row,
      body #course-sec .price-card.nostra-turn-source,
      body #course-sec .nostra-turnos-final-source,
      body #course-sec .nostra-turnos-final-source.row,
      body #course-sec .price-card.nostra-turnos-final-hidden,
      body #course-sec .row.nostra-turnos-original-hidden{
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

      body #course-sec .nostra-turnos-final{
        width:100% !important;
        margin:18px 0 0 !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:12px !important;
      }

      body #course-sec .nostra-turno-final-card{
        width:100% !important;
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:10px !important;
        padding:14px !important;
        border-radius:18px !important;
        background:linear-gradient(180deg,#f4feff 0%,#ffffff 100%) !important;
        border:1px solid rgba(0,194,209,.28) !important;
        box-shadow:0 12px 28px rgba(6,20,38,.075), inset 0 1px 0 rgba(255,255,255,.9) !important;
        overflow:hidden !important;
      }

      body #course-sec .nostra-turno-final-title{
        width:100% !important;
        min-height:42px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:11px 14px !important;
        border-radius:14px !important;
        background:linear-gradient(135deg,#008b96 0%,#006a78 52%,#052b38 100%) !important;
        color:#fff !important;
        font-size:13.5px !important;
        font-weight:950 !important;
        line-height:1.1 !important;
        text-align:center !important;
        text-transform:uppercase !important;
        letter-spacing:.2px !important;
        box-shadow:0 9px 18px rgba(0,139,150,.22) !important;
      }

      body #course-sec .nostra-turno-final-info{
        display:grid !important;
        grid-template-columns:1fr !important;
        gap:8px !important;
        width:100% !important;
      }

      body #course-sec .nostra-turno-final-line{
        position:relative !important;
        width:100% !important;
        min-height:62px !important;
        display:grid !important;
        grid-template-columns:26px 1fr !important;
        grid-template-areas:
          "icon label"
          "icon days"
          "icon time"
          "icon extra" !important;
        column-gap:10px !important;
        row-gap:3px !important;
        align-items:start !important;
        padding:12px 13px !important;
        border-radius:15px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#061426 !important;
        text-align:left !important;
        box-shadow:0 7px 16px rgba(6,20,38,.045) !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      body #course-sec .nostra-turno-final-line:before{
        content:'🕘' !important;
        grid-area:icon !important;
        width:24px !important;
        height:24px !important;
        margin-top:1px !important;
        border-radius:999px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:11px !important;
      }

      body #course-sec .nostra-turno-final-line:after{
        content:none !important;
        display:none !important;
      }

      body #course-sec .nostra-turno-final-label{
        grid-area:label !important;
        display:block !important;
        color:#008b96 !important;
        font-size:10px !important;
        font-weight:950 !important;
        line-height:1 !important;
        letter-spacing:.55px !important;
        text-transform:uppercase !important;
      }

      body #course-sec .nostra-turno-final-days{
        grid-area:days !important;
        display:block !important;
        color:#061426 !important;
        font-size:13.5px !important;
        font-weight:950 !important;
        line-height:1.18 !important;
      }

      body #course-sec .nostra-turno-final-time{
        grid-area:time !important;
        display:inline-flex !important;
        align-items:center !important;
        width:max-content !important;
        max-width:100% !important;
        margin-top:2px !important;
        padding:5px 9px !important;
        border-radius:999px !important;
        background:rgba(0,194,209,.10) !important;
        color:#008b96 !important;
        font-size:13px !important;
        font-weight:950 !important;
        line-height:1.15 !important;
      }

      body #course-sec .nostra-turno-final-extra{
        grid-area:extra !important;
        display:block !important;
        margin-top:3px !important;
        color:#23364b !important;
        font-size:12.5px !important;
        font-weight:850 !important;
        line-height:1.25 !important;
      }

      body #course-sec .nostra-turno-final-line strong{
        color:#008b96 !important;
        font-weight:950 !important;
      }

      @media(max-width:575px){
        body #course-sec .nostra-turno-final-card{padding:12px !important;border-radius:16px !important;}
        body #course-sec .nostra-turno-final-title{font-size:12.8px !important;min-height:40px !important;}
        body #course-sec .nostra-turno-final-line{min-height:58px !important;padding:11px 12px !important;column-gap:9px !important;}
        body #course-sec .nostra-turno-final-days{font-size:13px !important;}
        body #course-sec .nostra-turno-final-time{font-size:12.5px !important;}
        body #course-sec .nostra-turno-final-extra{font-size:12.2px !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function collectTurnosFromPane(pane) {
    var turnos = [];

    pane.querySelectorAll('.price-card').forEach(function (card) {
      var titleNode = card.querySelector('.price-card_title');
      if (!titleNode) return;

      var title = normalizeText(titleNode.textContent);
      var lines = Array.from(card.querySelectorAll('.price-card_price')).map(function (node) {
        return normalizeText(node.textContent);
      }).filter(Boolean);

      if (!title || !lines.length) return;
      turnos.push({ title: title, lines: lines });
    });

    if (turnos.length) return turnos;

    pane.querySelectorAll('.nostra-turn-card').forEach(function (card) {
      var titleNode = card.querySelector('.nostra-turn-title');
      if (!titleNode) return;
      var title = normalizeText(titleNode.textContent);
      var lines = Array.from(card.querySelectorAll('.nostra-turn-line')).map(function (node) {
        return normalizeText(node.textContent);
      }).filter(Boolean);
      if (!title || !lines.length) return;
      turnos.push({ title: title, lines: lines });
    });

    return turnos;
  }

  function hideOldTurnos(pane) {
    pane.querySelectorAll('.nostra-turns-grid').forEach(function (el) {
      el.classList.add('nostra-turn-source');
      el.style.display = 'none';
    });

    pane.querySelectorAll('.price-card').forEach(function (card) {
      card.classList.add('nostra-turnos-final-hidden');
      var row = card.closest('.row');
      if (row) {
        row.classList.add('nostra-turnos-original-hidden');
        row.style.display = 'none';
      }
    });
  }

  function buildTurnos() {
    document.querySelectorAll('#course-sec .tab-pane').forEach(function (pane) {
      var turnos = collectTurnosFromPane(pane);
      hideOldTurnos(pane);

      if (!turnos.length) return;

      var existing = pane.querySelector('.nostra-turnos-final');
      if (existing) {
        existing.remove();
      }

      var wrap = document.createElement('div');
      wrap.className = 'nostra-turnos-final';
      wrap.innerHTML = turnos.map(function (turno) {
        return '<div class="nostra-turno-final-card"><div class="nostra-turno-final-title">' + turno.title + '</div><div class="nostra-turno-final-info">' +
          turno.lines.map(function (line) {
            return '<div class="nostra-turno-final-line">' + formatLine(line) + '</div>';
          }).join('') +
          '</div></div>';
      }).join('');

      var hiddenRow = pane.querySelector('.row.nostra-turnos-original-hidden, .row.nostra-turnos-final-source');
      if (hiddenRow && hiddenRow.parentNode) {
        hiddenRow.parentNode.insertBefore(wrap, hiddenRow);
      } else {
        pane.appendChild(wrap);
      }
    });
  }

  function removeBrokenArrows() {
    document.querySelectorAll('#course-sec .tab-pane, #course-sec .course-description').forEach(function (box) {
      Array.from(box.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && node.textContent && node.textContent.trim() === '-->') {
          node.textContent = '';
        }
      });
    });
  }

  function init() {
    injectStyles();
    buildTurnos();
    removeBrokenArrows();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 300);
    setTimeout(init, 900);
    setTimeout(init, 1800);
    setTimeout(init, 3500);
  });
})();
