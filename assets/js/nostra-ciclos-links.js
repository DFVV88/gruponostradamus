/* ==================================================
   Grupo Nostradamus - Navegación de ciclos
   Convierte los botones de ciclos.html en enlaces a subpáginas.
================================================== */
(function () {
  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('ciclos.html') === -1 && path !== '/ciclos') return;

  var LINKS = {
    'anual uni': 'ciclo-anual-uni.html',
    'semianual uni': 'ciclo-semianual-uni.html',
    'semestral uni': 'ciclo-semestral-uni.html',
    'repaso uni': 'ciclo-repaso-uni.html',
    'elite uni': 'ciclo-elite-uni.html',
    'élite uni': 'ciclo-elite-uni.html',
    'ien': 'ciclo-ien.html',
    'proyecto escolar': 'ciclo-proyecto-escolar.html',
    'paralelo cepre uni': 'ciclo-paralelo-cepre-uni.html',
    'verano uni': 'ciclo-verano-uni.html',
    'ciclo verano uni': 'ciclo-verano-uni.html'
  };

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function injectStyles() {
    if (document.getElementById('nostra-ciclos-links-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-ciclos-links-style';
    style.textContent = `
      body .tab-menu1.filter-menu-active .filter-btn{
        cursor:pointer !important;
        position:relative !important;
      }
      body .tab-menu1.filter-menu-active .filter-btn::after{
        content:'↗';
        display:inline-block;
        margin-left:7px;
        font-size:12px;
        font-weight:900;
        opacity:.72;
        transform:translateY(-1px);
      }
    `;
    document.head.appendChild(style);
  }

  function activateLinks() {
    document.querySelectorAll('.tab-menu1.filter-menu-active .filter-btn').forEach(function (btn) {
      if (btn.dataset.nostraCycleLinked === '1') return;

      var key = normalize(btn.textContent);
      var url = LINKS[key];
      if (!url) return;

      btn.dataset.nostraCycleLinked = '1';
      btn.dataset.href = url;
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Ver información completa de ' + btn.textContent.trim());
      btn.setAttribute('title', 'Abrir página del ciclo');

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'click_ciclo_subpagina', {
            event_category: 'navigation',
            event_label: btn.textContent.trim(),
            link_url: url,
            page_path: window.location.pathname
          });
        }

        window.location.href = url;
      }, true);
    });
  }

  function init() {
    injectStyles();
    activateLinks();
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
