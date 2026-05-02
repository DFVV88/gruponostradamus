/* ==================================================
   Grupo Nostradamus - Turnos FINAL para ciclos.html
   Convierte los horarios antiguos en bloques verticales premium.
   Se ejecuta al final para evitar que otros estilos lo sobrescriban.
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

  function formatLine(text) {
    return normalizeText(text)
      .replace(/\(([^)]+)\)/g, '<strong>($1)</strong>')
      .replace(/Más dos tardes/g, '<strong>Más dos tardes</strong>');
  }

  function injectStyles() {
    var previous = document.getElementById('nostra-ciclos-turnos-final-style');
    if (previous) previous.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-turnos-final-style';
    style.textContent = `
      body #course-sec .nostra-turnos-final-source,
      body #course-sec .nostra-turnos-final-source.row,
      body #course-sec .price-card.nostra-turnos-final-hidden{
        display:none !important;
        visibility:hidden !important;
        height:0 !important;
        min-height:0 !important;
        margin:0 !important;
        padding:0 !important;
        overflow:hidden !important;
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
        min-height:44px !important;
        display:block !important;
        padding:11px 12px 11px 43px !important;
        border-radius:14px !important;
        background:#ffffff !important;
        border:1px solid rgba(0,137,150,.13) !important;
        color:#061426 !important;
        font-size:13px !important;
        font-weight:900 !important;
        line-height:1.35 !important;
        text-align:left !important;
        box-shadow:0 7px 16px rgba(6,20,38,.045) !important;
        white-space:normal !important;
        overflow-wrap:normal !important;
        word-break:normal !important;
      }

      body #course-sec .nostra-turno-final-line:before{
        content:'🕘' !important;
        position:absolute !important;
        left:12px !important;
        top:12px !important;
        width:22px !important;
        height:22px !important;
        border-radius:999px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:linear-gradient(135deg,#00c2d1,#008b96) !important;
        color:#fff !important;
        font-size:11px !important;
      }

      body #course-sec .nostra-turno-final-line:after{
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

      body #course-sec .nostra-turno-final-line strong{
        color:#008b96 !important;
        font-weight:950 !important;
      }

      @media(max-width:575px){
        body #course-sec .nostra-turno-final-card{padding:12px !important;border-radius:16px !important;}
        body #course-sec .nostra-turno-final-title{font-size:12.8px !important;min-height:40px !important;}
        body #course-sec .nostra-turno-final-line{font-size:12.8px !important;padding-left:41px !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function buildTurnos() {
    document.querySelectorAll('#course-sec .tab-pane').forEach(function (pane) {
      if (pane.querySelector('.nostra-turnos-final')) return;

      var cards = Array.from(pane.querySelectorAll('.price-card')).filter(function (card) {
        return !card.classList.contains('nostra-turnos-final-hidden');
      });
      if (!cards.length) return;

      var turnos = [];
      cards.forEach(function (card) {
        var titleNode = card.querySelector('.price-card_title');
        if (!titleNode) return;

        var title = normalizeText(titleNode.textContent);
        var lines = Array.from(card.querySelectorAll('.price-card_price')).map(function (node) {
          return normalizeText(node.textContent);
        }).filter(Boolean);

        if (!title || !lines.length) return;
        turnos.push({ title: title, lines: lines });
        card.classList.add('nostra-turnos-final-hidden');
      });

      if (!turnos.length) return;

      var wrap = document.createElement('div');
      wrap.className = 'nostra-turnos-final';
      wrap.innerHTML = turnos.map(function (turno) {
        return '<div class="nostra-turno-final-card"><div class="nostra-turno-final-title">' + turno.title + '</div><div class="nostra-turno-final-info">' +
          turno.lines.map(function (line) {
            return '<div class="nostra-turno-final-line">' + formatLine(line) + '</div>';
          }).join('') +
          '</div></div>';
      }).join('');

      var firstHidden = pane.querySelector('.price-card.nostra-turnos-final-hidden');
      var row = firstHidden ? firstHidden.closest('.row') : null;
      if (row && row.parentNode) {
        row.parentNode.insertBefore(wrap, row);
        row.classList.add('nostra-turnos-final-source');
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
