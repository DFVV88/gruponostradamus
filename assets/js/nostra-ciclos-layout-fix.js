/* ==================================================
   Grupo Nostradamus - Fix final de layout en ciclos.html
   Reconstruye los turnos como tarjetas comerciales horizontales.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-layout-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-ciclos-layout-fix-style';
    style.textContent = `
      body #course-sec .container > .row.gy-4{display:block!important;}
      body #course-sec .filter-active{width:100%!important;max-width:100%!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:30px!important;height:auto!important;position:relative!important;overflow:visible!important;}
      body #course-sec .filter-active .filter-item,body #course-sec .filter-active .filter-item[style]{width:100%!important;max-width:100%!important;min-width:0!important;display:block!important;position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;transform:none!important;opacity:1!important;margin:0!important;clear:none!important;}
      body #course-sec .filter-active .course-single{height:100%!important;display:flex!important;flex-direction:column!important;}
      body #course-sec .course-single-bottom{flex:1 1 auto!important;}
      body #course-sec .course-single-top .course-img{aspect-ratio:16/8.6!important;margin-bottom:18px!important;}
      body #course-sec .course-single-top .course-img img{width:100%!important;height:100%!important;object-fit:cover!important;}
      body #course-sec .course-title{font-size:clamp(22px,2vw,32px)!important;line-height:1.1!important;min-height:auto!important;}
      body #course-sec .course-tab{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}
      body #course-sec .course-tab .nav-item{width:100%!important;flex:none!important;}
      body #course-sec .course-tab .nav-item:last-child{grid-column:1 / -1!important;}
      body #course-sec .course-tab .nav-link{min-height:44px!important;font-size:13px!important;padding:9px 10px!important;white-space:normal!important;}
      body #course-sec .checklist ul{display:grid!important;grid-template-columns:1fr!important;gap:12px!important;}
      body #course-sec .checklist li{width:100%!important;white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important;writing-mode:horizontal-tb!important;text-orientation:mixed!important;text-align:left!important;line-height:1.55!important;font-size:14.6px!important;}
      body #course-sec .course-description p{text-align:justify!important;text-justify:inter-word!important;word-break:normal!important;overflow-wrap:break-word!important;writing-mode:horizontal-tb!important;text-orientation:mixed!important;}

      /* Oculta por completo la estructura original rota de turnos */
      body #course-sec .price-card.nostra-turn-source{display:none!important;}

      body #course-sec .nostra-turns-grid{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:12px!important;
        width:100%!important;
        margin:18px 0 0!important;
      }
      body #course-sec .nostra-turn-card{
        display:grid!important;
        grid-template-columns:minmax(135px,175px) 1fr!important;
        align-items:center!important;
        gap:14px!important;
        width:100%!important;
        padding:14px!important;
        border-radius:18px!important;
        background:linear-gradient(135deg,#f8ffff,#e9fbfd)!important;
        border:1px solid rgba(0,137,150,.2)!important;
        box-shadow:0 10px 22px rgba(0,0,0,.06)!important;
      }
      body #course-sec .nostra-turn-title{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:46px!important;
        padding:10px 12px!important;
        border-radius:999px!important;
        background:linear-gradient(135deg,#005765,#008b96)!important;
        color:#fff!important;
        font-size:13px!important;
        font-weight:950!important;
        line-height:1.08!important;
        text-align:center!important;
        text-transform:uppercase!important;
        white-space:normal!important;
        word-break:normal!important;
      }
      body #course-sec .nostra-turn-info{
        display:grid!important;
        gap:7px!important;
        min-width:0!important;
      }
      body #course-sec .nostra-turn-line{
        display:block!important;
        width:100%!important;
        padding:8px 11px!important;
        border-radius:12px!important;
        background:rgba(255,255,255,.86)!important;
        color:#071426!important;
        font-size:14px!important;
        font-weight:850!important;
        line-height:1.35!important;
        text-align:left!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:normal!important;
        writing-mode:horizontal-tb!important;
        text-orientation:mixed!important;
      }
      body #course-sec .nostra-turn-line span{color:#008b96!important;font-weight:950!important;}
      body #course-sec .nostra-cycle-cta{padding:14px!important;}
      body #course-sec .nostra-cycle-cta__button{width:100%!important;min-height:44px!important;}

      @media(max-width:1199px){body #course-sec .filter-active{grid-template-columns:1fr!important;}body #course-sec .course-single-top .course-img{aspect-ratio:16/7.8!important;}}
      @media(max-width:767px){body #course-sec .course-description p{text-align:left!important;}}
      @media(max-width:575px){body #course-sec .course-tab{grid-template-columns:1fr!important;}body #course-sec .course-tab .nav-item:last-child{grid-column:auto!important;}body #course-sec .nostra-turn-card{grid-template-columns:1fr!important;text-align:center!important;}body #course-sec .nostra-turn-line{text-align:center!important;}}
    `;
    document.head.appendChild(style);
  }

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
      .replace(/\(([^)]+)\)/g, '<span>($1)</span>')
      .replace(/Más dos tardes/g, '<span>Más dos tardes</span>');
  }

  function rebuildTurnCards() {
    document.querySelectorAll('#course-sec .tab-pane').forEach(function (pane) {
      var cards = Array.from(pane.querySelectorAll('.price-card:not(.nostra-turn-source)'));
      if (!cards.length || pane.querySelector('.nostra-turns-grid')) return;

      var turns = [];
      cards.forEach(function (card) {
        var titleNode = card.querySelector('.price-card_title');
        if (!titleNode) return;
        var title = normalizeText(titleNode.textContent);
        var lines = Array.from(card.querySelectorAll('.price-card_price')).map(function (price) {
          return normalizeText(price.textContent);
        }).filter(Boolean);
        if (!lines.length) return;
        turns.push({ title: title, lines: lines });
        card.classList.add('nostra-turn-source');
      });

      if (!turns.length) return;

      var wrap = document.createElement('div');
      wrap.className = 'nostra-turns-grid';
      wrap.innerHTML = turns.map(function (turn) {
        return '<div class="nostra-turn-card"><div class="nostra-turn-title">' + turn.title + '</div><div class="nostra-turn-info">' +
          turn.lines.map(function (line) { return '<div class="nostra-turn-line">' + formatLine(line) + '</div>'; }).join('') +
          '</div></div>';
      }).join('');

      var firstSource = pane.querySelector('.price-card.nostra-turn-source');
      var row = firstSource ? firstSource.closest('.row') : null;
      if (row && row.parentNode) {
        row.parentNode.insertBefore(wrap, row);
        row.classList.add('nostra-turn-source');
      } else {
        pane.appendChild(wrap);
      }
    });
  }

  function stabilizeLayout() {
    var grid = document.querySelector('#course-sec .filter-active');
    if (grid) {
      grid.style.display = 'grid';
      grid.style.height = 'auto';
      grid.style.position = 'relative';
      grid.style.width = '100%';
      grid.style.maxWidth = '100%';
    }
    document.querySelectorAll('#course-sec .filter-active .filter-item').forEach(function (item) {
      item.style.position = 'relative';
      item.style.left = 'auto';
      item.style.top = 'auto';
      item.style.transform = 'none';
      item.style.width = '100%';
      item.style.maxWidth = '100%';
      item.style.margin = '0';
      item.style.opacity = '1';
    });
  }

  function init() {
    injectStyles();
    stabilizeLayout();
    rebuildTurnCards();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () {
    init();
    setTimeout(init, 300);
    setTimeout(init, 900);
    setTimeout(init, 2000);
    setTimeout(init, 4000);
  });
})();
