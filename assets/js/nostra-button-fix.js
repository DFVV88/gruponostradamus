/* ==================================================
   Grupo Nostradamus - Botones, ciclos del index y actualización Microsoft 365
================================================== */
(function () {
  function injectButtonFix() {
    if (document.getElementById('nostra-button-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-button-fix-style';
    style.textContent = `
      .th-btn,
      .th-btn:visited,
      .th-btn.style3,
      .th-btn.style3:visited,
      .header-button .th-btn,
      .header-button .th-btn:visited,
      .course-content .th-btn,
      .course-content .th-btn:visited,
      .nostra-home-actions .th-btn,
      .nostra-home-actions .th-btn:visited{
        position:relative !important;
        isolation:isolate !important;
        overflow:hidden !important;
      }

      .th-btn.style3,
      .header-button .th-btn.style3,
      .course-content .th-btn.style3,
      .nostra-home-actions .th-btn.style3{
        color:#ffffff !important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 48%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.34) !important;
      }

      .th-btn.style3:hover,
      .th-btn.style3:focus,
      .th-btn.style3:active,
      .header-button .th-btn.style3:hover,
      .header-button .th-btn.style3:focus,
      .header-button .th-btn.style3:active,
      .course-content .th-btn.style3:hover,
      .course-content .th-btn.style3:focus,
      .course-content .th-btn.style3:active,
      .nostra-home-actions .th-btn.style3:hover,
      .nostra-home-actions .th-btn.style3:focus,
      .nostra-home-actions .th-btn.style3:active{
        color:#ffffff !important;
        background:linear-gradient(135deg,#00aab7 0%,#05606a 45%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.42) !important;
        box-shadow:0 0 24px rgba(0,194,209,.55), inset 0 1px 0 rgba(255,255,255,.28) !important;
      }

      .th-btn.style3 *,
      .th-btn.style3:hover *,
      .th-btn.style3:focus *,
      .th-btn.style3:active *,
      .header-button .th-btn.style3 *,
      .header-button .th-btn.style3:hover *,
      .course-content .th-btn.style3 *,
      .course-content .th-btn.style3:hover *{
        color:#ffffff !important;
        fill:#ffffff !important;
      }

      .th-btn.style3::before,
      .th-btn.style3::after{
        z-index:-1 !important;
        opacity:.18 !important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.18) 45%,transparent 58%) !important;
      }
      .th-btn.style3:hover::before,
      .th-btn.style3:hover::after,
      .th-btn.style3:focus::before,
      .th-btn.style3:focus::after,
      .th-btn.style3:active::before,
      .th-btn.style3:active::after{
        opacity:.14 !important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.16) 45%,transparent 58%) !important;
      }

      .th-btn.style6,
      .th-btn.style6:visited{
        color:#061426 !important;
        background:linear-gradient(180deg,#ffffff,#dce6ed 54%,#a9b4bf) !important;
      }
      .th-btn.style6:hover,
      .th-btn.style6:focus,
      .th-btn.style6:active{
        color:#061426 !important;
        background:linear-gradient(180deg,#ffffff,#eef5f8 54%,#b8c3cc) !important;
      }
      .th-btn.style6 *,
      .th-btn.style6:hover *{
        color:#061426 !important;
        fill:#061426 !important;
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', injectButtonFix);
  window.addEventListener('load', injectButtonFix);
})();

/* ==================================================
   Grupo Nostradamus - Miniaturas PRO de ciclos en index
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  var ciclos = [
    {
      titulo:'Anual UNI',
      url:'ciclo-anual-uni.html',
      img:'assets/img/ciclos/ciclo-anual.jpg',
      desc:'Para alumnos que no tienen base o sienten que deben empezar desde cero. Durante un año completo construyen fundamentos, hábitos de estudio y nivel académico progresivo hasta enfrentar el examen UNI con mayor seguridad.'
    },
    {
      titulo:'Semianual UNI',
      url:'ciclo-semianual-uni.html',
      img:'assets/img/ciclos/ciclo-semianual.jpg',
      desc:'Para alumnos con base previa que aún no han postulado o que no obtuvieron resultados con preparaciones anteriores. Reordena conocimientos, corrige vacíos y eleva el rendimiento con práctica constante.'
    },
    {
      titulo:'Semestral UNI',
      url:'ciclo-semestral-uni.html',
      img:'assets/img/ciclos/ciclo-semestral.jpg',
      desc:'Para postulantes con base que ya rindieron examen y todavía no lograron el ingreso. Refuerza puntos débiles, mejora velocidad de resolución y trabaja estrategia para competir mejor en admisión UNI.'
    },
    {
      titulo:'Repaso UNI',
      url:'ciclo-repaso-uni.html',
      img:'assets/img/ciclos/ciclo-repaso.jpg',
      fallback:'assets/img/ciclos/ciclo-anual.jpg',
      desc:'Ciclo corto e intensivo para repasar los temas más frecuentes del examen de admisión UNI. Ideal para reforzar fórmulas, métodos, preguntas tipo y llegar con mayor precisión al examen.'
    },
    {
      titulo:'Élite UNI',
      url:'ciclo-elite-uni.html',
      img:'assets/img/ciclos/ciclo-elite.jpg',
      fallback:'assets/img/ciclos/ciclo-semianual.jpg',
      desc:'Para postulantes con buena base y alto rendimiento que buscan competir al máximo nivel. Entrenamiento avanzado con problemas exigentes, técnicas de resolución y ritmo académico superior.'
    },
    {
      titulo:'IEN',
      url:'ciclo-ien.html',
      img:'assets/img/ciclos/ciclo-ien.jpg',
      fallback:'assets/img/ciclos/ciclo-semestral.jpg',
      desc:'Para estudiantes que necesitan reforzar fundamentos, ordenar su preparación y recuperar confianza académica. Trabaja teoría clara, práctica guiada y seguimiento para avanzar con mayor seguridad.'
    },
    {
      titulo:'Proyecto Escolar',
      url:'ciclo-proyecto-escolar.html',
      img:'assets/img/ciclos/ciclo-proyecto-escolar.jpg',
      fallback:'assets/img/ciclos/ciclo-anual.jpg',
      desc:'Para escolares que desean adelantarse desde el colegio y formar una base sólida. Fortalece Matemáticas, Ciencias y Aptitud Académica con visión preuniversitaria y disciplina de estudio.'
    },
    {
      titulo:'Paralelo CEPRE UNI',
      url:'ciclo-paralelo-cepre-uni.html',
      img:'assets/img/ciclos/ciclo-paralelo-cepre-uni.jpg',
      fallback:'assets/img/ciclos/ciclo-semianual.jpg',
      desc:'Para alumnos de CEPRE UNI que necesitan reforzar lo aprendido, resolver dudas y practicar con mayor intensidad. Complementa su avance y ayuda a sostener un ritmo competitivo.'
    },
    {
      titulo:'Ciclo Verano UNI',
      url:'ciclo-verano-uni.html',
      img:'assets/img/ciclos/ciclo-verano-uni.jpg',
      fallback:'assets/img/ciclos/ciclo-semestral.jpg',
      desc:'Intensivo de verano para iniciar o reforzar la preparación UNI durante las vacaciones. Permite avanzar en cursos clave, crear ritmo académico y llegar mejor preparado al siguiente ciclo.'
    }
  ];

  function injectHomeCycleStyles() {
    var old = document.getElementById('nostra-home-cycles-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-home-cycles-pro-style';
    style.textContent = `
      body #course-sec .nostra-home-cycles-grid{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:32px !important;
        width:100% !important;
      }
      body #course-sec .nostra-home-cycle-card{
        height:100% !important;
        display:flex !important;
        flex-direction:column !important;
        border-radius:28px !important;
        padding:22px !important;
        background:linear-gradient(180deg,#ffffff,#f4fdff) !important;
        border:1px solid rgba(0,194,209,.24) !important;
        box-shadow:0 18px 44px rgba(6,20,38,.08),0 0 26px rgba(0,194,209,.08) !important;
        transition:transform .24s ease, box-shadow .24s ease, border-color .24s ease !important;
        overflow:hidden !important;
      }
      body #course-sec .nostra-home-cycle-card:hover{
        transform:translateY(-7px) !important;
        border-color:rgba(0,194,209,.48) !important;
        box-shadow:0 28px 60px rgba(6,20,38,.13),0 0 32px rgba(0,194,209,.13) !important;
      }
      body #course-sec .nostra-home-cycle-card .course-img{
        margin:0 0 20px !important;
        border-radius:18px !important;
        overflow:hidden !important;
        aspect-ratio:16/8.5 !important;
        box-shadow:0 14px 34px rgba(6,20,38,.12) !important;
      }
      body #course-sec .nostra-home-cycle-card .course-img img{
        width:100% !important;
        height:100% !important;
        object-fit:cover !important;
        display:block !important;
      }
      body #course-sec .nostra-home-cycle-body{
        display:flex !important;
        flex-direction:column !important;
        align-items:center !important;
        flex:1 1 auto !important;
        padding-top:18px !important;
        border-top:4px solid #008b96 !important;
      }
      body #course-sec .nostra-home-cycle-title{
        margin:0 0 13px !important;
        text-align:center !important;
        font-size:clamp(23px,2vw,34px) !important;
        line-height:1.05 !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:-.4px !important;
      }
      body #course-sec .nostra-home-cycle-title a{color:#061426 !important;text-decoration:none !important;}
      body #course-sec .nostra-home-cycle-desc{
        margin:0 0 22px !important;
        color:#5e6a78 !important;
        text-align:center !important;
        font-size:14.5px !important;
        line-height:1.62 !important;
        font-weight:650 !important;
      }
      body #course-sec .nostra-home-cycle-cta{
        margin-top:auto !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        min-height:44px !important;
        padding:11px 20px !important;
        border-radius:999px !important;
        color:#fff !important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 52%,#0a0708 100%) !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 12px 26px rgba(0,139,150,.22) !important;
      }
      body #course-sec .nostra-home-cycle-cta:hover{color:#fff !important;transform:translateY(-2px) !important;box-shadow:0 18px 34px rgba(0,194,209,.28) !important;}
      @media(max-width:1199px){body #course-sec .nostra-home-cycles-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}
      @media(max-width:767px){body #course-sec .nostra-home-cycles-grid{grid-template-columns:1fr !important;} body #course-sec .nostra-home-cycle-card{padding:18px !important;}}
    `;
    document.head.appendChild(style);
  }

  function buildCard(ciclo) {
    var msg = encodeURIComponent('Hola Nostradamus, quiero informes sobre ' + ciclo.titulo);
    var fallback = ciclo.fallback || 'assets/img/ciclos/ciclo-anual.jpg';
    return '' +
      '<div class="filter-item nostra-home-cycle-item">' +
        '<div class="course-box2 nostra-home-cycle-card">' +
          '<div class="course-img"><img src="' + ciclo.img + '" onerror="this.onerror=null;this.src=\'' + fallback + '\';" alt="' + ciclo.titulo + ' Grupo Nostradamus"></div>' +
          '<div class="course-content nostra-home-cycle-body">' +
            '<h3 class="course-title nostra-home-cycle-title"><a href="' + ciclo.url + '">' + ciclo.titulo + '</a></h3>' +
            '<p class="nostra-home-cycle-desc">' + ciclo.desc + '</p>' +
            '<a class="th-btn style3 nostra-home-cycle-cta" target="_blank" rel="noopener" href="https://wa.me/51993750351?text=' + msg + '">🔥 QUIERO INGRESAR</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function upgradeHomeCycles() {
    injectHomeCycleStyles();
    var sec = document.querySelector('body #course-sec');
    if (!sec || sec.dataset.nostraHomeCyclesPro === '3') return;

    var grid = sec.querySelector('.filter-active');
    if (!grid) return;

    grid.classList.add('nostra-home-cycles-grid');
    grid.innerHTML = ciclos.map(buildCard).join('');
    grid.style.height = 'auto';
    grid.style.position = 'relative';

    sec.dataset.nostraHomeCyclesPro = '3';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', upgradeHomeCycles);
  else upgradeHomeCycles();
  window.addEventListener('load', function () {
    upgradeHomeCycles();
    setTimeout(upgradeHomeCycles, 500);
    setTimeout(upgradeHomeCycles, 1500);
  });
})();

/* ==================================================
   Grupo Nostradamus - Actualización de plataforma: Microsoft 365
   Reemplaza referencias visibles a Q10 relacionadas con clases/plataforma.
================================================== */
(function () {
  function replaceTextNode(node) {
    var original = node.nodeValue;
    if (!original || original.toLowerCase().indexOf('q10') === -1) return;

    var updated = original
      .replace(/Q10\s*[-–—]?\s*clases\s*grabadas/gi, 'Microsoft 365 · clases, recursos y grabaciones')
      .replace(/clases\s*grabadas\s*(en|por)?\s*Q10/gi, 'clases, recursos y grabaciones en Microsoft 365')
      .replace(/plataforma\s*Q10/gi, 'plataforma Microsoft 365')
      .replace(/aula\s*virtual\s*Q10/gi, 'aula virtual Microsoft 365')
      .replace(/Q10/gi, 'Microsoft 365');

    if (updated !== original) node.nodeValue = updated;
  }

  function updateVisibleText() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (tag === 'script' || tag === 'style' || tag === 'noscript') return NodeFilter.FILTER_REJECT;
        return node.nodeValue && node.nodeValue.toLowerCase().indexOf('q10') !== -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function updateTooltipsAndAlt() {
    document.querySelectorAll('[title], [alt], [aria-label]').forEach(function (el) {
      ['title', 'alt', 'aria-label'].forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (!value || value.toLowerCase().indexOf('q10') === -1) return;
        el.setAttribute(attr, value.replace(/Q10/gi, 'Microsoft 365'));
      });
    });
  }

  function init() {
    updateVisibleText();
    updateTooltipsAndAlt();
    setTimeout(updateVisibleText, 500);
    setTimeout(updateVisibleText, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
})();
