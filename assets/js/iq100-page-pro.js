/* ==================================================
   IQ100 PRO - Estilo, textos y correcciones exclusivas para iq100.html
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || '').toLowerCase();
  if (file !== 'iq100.html') return;

  var WA = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola, quiero informes sobre IQ100 para preparación San Marcos.');

  var cycleNames = {
    'ciclo-anual-uni.html': 'Anual San Marcos',
    'ciclo-semianual-uni.html': 'Semianual San Marcos',
    'ciclo-semestral-uni.html': 'Semestral San Marcos',
    'ciclo-elite-uni.html': 'Élite San Marcos',
    'ciclo-ien.html': 'IEN San Marcos',
    'ciclo-proyecto-escolar.html': 'Proyecto Escolar San Marcos',
    'ciclo-repaso-uni.html': 'Repaso San Marcos',
    'ciclo-paralelo-cepre-uni.html': 'Paralelo CEPRE San Marcos',
    'ciclo-verano-uni.html': 'Verano San Marcos'
  };

  function injectStyles() {
    var old = document.getElementById('iq100-page-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'iq100-page-pro-style';
    style.textContent = `
      body.iq100-page-pro{
        background:radial-gradient(circle at 10% 0%,rgba(21,153,196,.14),transparent 32%),linear-gradient(180deg,#f8fdff 0%,#ffffff 42%,#fff8ef 100%) !important;
      }

      body.iq100-page-pro .header-top{
        background:linear-gradient(90deg,#061426 0%,#0b6f95 45%,#1599c4 100%) !important;
        box-shadow:0 10px 30px rgba(21,153,196,.28) !important;
      }

      body.iq100-page-pro .menu-area{
        background:rgba(255,255,255,.98) !important;
        backdrop-filter:blur(14px) !important;
        box-shadow:0 14px 34px rgba(6,20,38,.10) !important;
      }

      body.iq100-page-pro .main-menu > ul > li > a,
      body.iq100-page-pro .main-menu ul li a,
      body.iq100-page-pro .th-mobile-menu ul li a{
        color:#061426 !important;
        opacity:1 !important;
        visibility:visible !important;
        font-weight:900 !important;
        text-shadow:none !important;
      }

      body.iq100-page-pro .main-menu > ul > li > a:hover,
      body.iq100-page-pro .main-menu ul li a:hover,
      body.iq100-page-pro .th-mobile-menu ul li a:hover{
        color:#1599c4 !important;
      }

      body.iq100-page-pro .sub-menu,
      body.iq100-page-pro .dropdown-menu{
        background:#ffffff !important;
        border:1px solid rgba(21,153,196,.24) !important;
        box-shadow:0 18px 42px rgba(6,20,38,.16),0 0 18px rgba(21,153,196,.12) !important;
      }

      body.iq100-page-pro .sub-menu li a,
      body.iq100-page-pro .dropdown-menu li a,
      body.iq100-page-pro .dropdown-menu a{
        color:#061426 !important;
        background:#ffffff !important;
        opacity:1 !important;
        visibility:visible !important;
        display:block !important;
        font-weight:850 !important;
        text-transform:none !important;
      }

      body.iq100-page-pro .sub-menu li a:hover,
      body.iq100-page-pro .dropdown-menu li a:hover,
      body.iq100-page-pro .dropdown-menu a:hover{
        color:#ffffff !important;
        background:linear-gradient(90deg,#1599c4,#0b6f95,#061426) !important;
      }

      body.iq100-page-pro .iq100-content{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:8px 12px !important;
        border-radius:20px !important;
        background:#fff !important;
        border:1px solid rgba(21,153,196,.20) !important;
        box-shadow:0 12px 28px rgba(6,20,38,.08) !important;
      }

      body.iq100-page-pro .iq100-content img{
        max-height:74px !important;
        width:auto !important;
        display:block !important;
        filter:drop-shadow(0 8px 16px rgba(6,20,38,.08)) !important;
      }

      body.iq100-page-pro .header-logo{display:none !important;}

      body.iq100-page-pro .header-button .th-btn,
      body.iq100-page-pro .widget_info .th-btn,
      body.iq100-page-pro a.iq100-wa-pro{
        background:linear-gradient(135deg,#f9a331 0%,#f58220 45%,#061426 100%) !important;
        border:1px solid rgba(255,255,255,.35) !important;
        color:#fff !important;
        box-shadow:0 14px 32px rgba(249,163,49,.30) !important;
      }

      body.iq100-page-pro .breadcumb-wrapper{
        position:relative !important;
        overflow:hidden !important;
        background:linear-gradient(135deg,#061426 0%,#0b6f95 48%,#1599c4 100%) !important;
        padding:98px 0 !important;
      }

      body.iq100-page-pro .breadcumb-wrapper:before{
        content:"" !important;
        position:absolute !important;
        inset:0 !important;
        background:radial-gradient(circle at 20% 20%,rgba(255,255,255,.16),transparent 28%),radial-gradient(circle at 80% 70%,rgba(249,163,49,.22),transparent 32%) !important;
        pointer-events:none !important;
      }

      body.iq100-page-pro .breadcumb-title{
        font-size:0 !important;
        line-height:1 !important;
        margin:0 !important;
      }

      body.iq100-page-pro .breadcumb-title:after{
        content:"IQ100 San Marcos" !important;
        font-size:clamp(42px,5.2vw,78px) !important;
        font-weight:950 !important;
        font-style:italic !important;
        letter-spacing:-1px !important;
        text-transform:uppercase !important;
        color:#fff !important;
        text-shadow:0 8px 22px rgba(6,20,38,.38),0 0 18px rgba(21,153,196,.34) !important;
      }

      body.iq100-page-pro .breadcumb-menu li,
      body.iq100-page-pro .breadcumb-menu a{
        color:rgba(255,255,255,.88) !important;
        font-weight:800 !important;
      }

      body.iq100-page-pro .space-top.space-extra2-bottom{
        padding:78px 0 !important;
        background:radial-gradient(circle at 12% 0%,rgba(21,153,196,.16),transparent 34%),radial-gradient(circle at 96% 20%,rgba(249,163,49,.15),transparent 32%),linear-gradient(180deg,#f8fdff,#fff) !important;
      }

      body.iq100-page-pro .course-single{
        border-radius:30px !important;
        overflow:hidden !important;
        background:#fff !important;
        border:1px solid rgba(21,153,196,.18) !important;
        box-shadow:0 26px 70px rgba(6,20,38,.10),0 0 38px rgba(21,153,196,.08) !important;
      }

      body.iq100-page-pro .course-single-top{
        padding:24px !important;
        background:linear-gradient(135deg,#f4fcff 0%,#fff7ed 100%) !important;
      }

      body.iq100-page-pro .course-img{
        border-radius:24px !important;
        overflow:hidden !important;
        box-shadow:0 18px 46px rgba(6,20,38,.16) !important;
        position:relative !important;
      }

      body.iq100-page-pro .course-img:after{
        content:"Especialistas en preparación para San Marcos" !important;
        position:absolute !important;
        left:18px !important;
        bottom:18px !important;
        padding:10px 14px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,rgba(21,153,196,.92),rgba(6,20,38,.92)) !important;
        color:#fff !important;
        font-size:13px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.5px !important;
        box-shadow:0 10px 24px rgba(6,20,38,.22) !important;
      }

      body.iq100-page-pro .course-title{
        font-size:0 !important;
        margin-top:24px !important;
        color:#061426 !important;
        text-align:left !important;
      }

      body.iq100-page-pro .course-title:after{
        content:"IQ100 · Preparación San Marcos" !important;
        font-size:clamp(32px,3.2vw,52px) !important;
        font-weight:950 !important;
        font-style:italic !important;
        text-transform:uppercase !important;
        letter-spacing:-.8px !important;
        background:linear-gradient(180deg,#061426 0%,#1599c4 58%,#f9a331 100%) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 2px 0 rgba(255,255,255,.75)) !important;
      }

      body.iq100-page-pro .course-single-top:after{
        content:"La marca del Grupo de Estudio especializada en postulantes a la Universidad Nacional Mayor de San Marcos. Entrenamiento académico, método, seguimiento y práctica orientada al examen de admisión." !important;
        display:block !important;
        margin-top:16px !important;
        padding:18px 20px !important;
        border-radius:20px !important;
        background:linear-gradient(135deg,#061426 0%,#0b6f95 58%,#1599c4 100%) !important;
        color:#fff !important;
        font-size:16px !important;
        font-weight:700 !important;
        line-height:1.55 !important;
        box-shadow:0 18px 38px rgba(21,153,196,.18) !important;
      }

      body.iq100-page-pro .course-tab{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:10px !important;
        padding:10px !important;
        border-radius:18px !important;
        background:linear-gradient(135deg,#061426,#0a2d40) !important;
        border:1px solid rgba(21,153,196,.24) !important;
      }

      body.iq100-page-pro .course-tab .nav-item{width:100% !important;}

      body.iq100-page-pro .course-tab .nav-link{
        width:100% !important;
        min-height:50px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        border-radius:14px !important;
        background:rgba(255,255,255,.08) !important;
        border:1px solid rgba(255,255,255,.10) !important;
        color:rgba(255,255,255,.88) !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
      }

      body.iq100-page-pro .course-tab .nav-link.active,
      body.iq100-page-pro .course-tab .nav-link:hover{
        background:linear-gradient(135deg,#1599c4,#0b6f95 55%,#f9a331 160%) !important;
        color:#fff !important;
        box-shadow:0 14px 28px rgba(21,153,196,.28) !important;
      }

      body.iq100-page-pro .tab-content{
        margin-top:18px !important;
        padding:24px !important;
        border-radius:24px !important;
        background:linear-gradient(180deg,#fff,#f7fdff) !important;
        border:1px solid rgba(21,153,196,.14) !important;
      }

      body.iq100-page-pro .course-description .h5{font-size:0 !important;display:block !important;text-align:left !important;margin-bottom:12px !important;}
      body.iq100-page-pro .course-description .h5:after{content:"El camino hacia San Marcos" !important;display:inline-flex !important;padding:10px 14px !important;border-radius:999px !important;background:rgba(21,153,196,.10) !important;border:1px solid rgba(21,153,196,.24) !important;color:#061426 !important;font-size:22px !important;font-weight:950 !important;text-transform:uppercase !important;}
      body.iq100-page-pro .course-description h5[align="center"]{font-size:0 !important;margin:0 !important;text-align:left !important;}
      body.iq100-page-pro .course-description h5[align="center"]:after{content:"Grupo de estudio especializado en preparación para ingresar a la Universidad Nacional Mayor de San Marcos (UNMSM)." !important;display:block !important;margin:12px 0 20px !important;color:#445569 !important;font-size:17px !important;line-height:1.6 !important;font-weight:700 !important;text-align:left !important;}
      body.iq100-page-pro .course-description .sub-title{display:none !important;}

      body.iq100-page-pro .price-card{height:100% !important;border-radius:24px !important;background:linear-gradient(180deg,#fff,#f5fdff) !important;border:1px solid rgba(21,153,196,.20) !important;box-shadow:0 18px 42px rgba(6,20,38,.08) !important;overflow:hidden !important;}
      body.iq100-page-pro .price-card_top{padding:18px !important;background:linear-gradient(135deg,#1599c4 0%,#0b6f95 55%,#061426 100%) !important;}
      body.iq100-page-pro .price-card_title{margin:0 !important;color:#fff !important;font-size:22px !important;font-weight:950 !important;text-align:center !important;text-transform:uppercase !important;letter-spacing:.2px !important;}
      body.iq100-page-pro .price-card_content{padding:20px !important;}
      body.iq100-page-pro .checklist li{position:relative !important;list-style:none !important;margin:0 0 12px !important;padding:13px 14px 13px 44px !important;border-radius:16px !important;background:#fff !important;border:1px solid rgba(21,153,196,.12) !important;box-shadow:0 8px 20px rgba(6,20,38,.045) !important;color:#3f5062 !important;font-size:15px !important;line-height:1.58 !important;font-weight:600 !important;text-align:left !important;}
      body.iq100-page-pro .checklist li i{position:absolute !important;left:14px !important;top:15px !important;color:#1599c4 !important;}
      body.iq100-page-pro .checklist li b{color:#061426 !important;font-weight:950 !important;}
      body.iq100-page-pro #curriculam .checklist,body.iq100-page-pro #instructor .checklist{display:none !important;}
      body.iq100-page-pro #curriculam .course-curriculam:after{content:"✓ Docentes especializados en admisión UNMSM y metodología orientada al examen.\A✓ Evaluaciones semanales para medir avance, comprensión y rendimiento.\A✓ Simulacros tipo admisión San Marcos para entrenar tiempo, presión y estrategia.\A✓ Material académico DECO y recursos digitales para reforzar teoría y práctica.\A✓ Seguimiento de asistencia, notas y progreso del estudiante.\A✓ Acceso a clases, materiales y comunicados mediante Microsoft 365." !important;white-space:pre-line !important;display:block !important;padding:22px !important;border-radius:20px !important;background:#fff !important;border:1px solid rgba(21,153,196,.16) !important;color:#35475a !important;font-size:16px !important;line-height:1.8 !important;font-weight:700 !important;box-shadow:0 14px 34px rgba(6,20,38,.06) !important;}
      body.iq100-page-pro #instructor .course-curriculam:after{content:"✓ Asesorías académicas para resolver dudas y reforzar temas clave.\A✓ Acompañamiento psicopedagógico, orientación vocacional y técnicas de estudio.\A✓ Ambientes cómodos, seguros y con aforo adecuado para clases más personalizadas.\A✓ Biblioteca, asesores y espacios de estudio para fortalecer el aprendizaje.\A✓ Comunicación permanente con estudiantes y padres mediante grupos informativos.\A✓ Preparación enfocada en áreas, competencias y exigencia del examen San Marcos." !important;white-space:pre-line !important;display:block !important;padding:22px !important;border-radius:20px !important;background:#fff !important;border:1px solid rgba(249,163,49,.22) !important;color:#35475a !important;font-size:16px !important;line-height:1.8 !important;font-weight:700 !important;box-shadow:0 14px 34px rgba(6,20,38,.06) !important;}
      body.iq100-page-pro .course-curriculam .h5{display:inline-flex !important;align-items:center !important;gap:8px !important;margin-bottom:16px !important;padding:10px 14px !important;border-radius:999px !important;background:linear-gradient(135deg,#e8f8fc,#fff) !important;border:1px solid rgba(21,153,196,.24) !important;color:#061426 !important;font-size:22px !important;font-weight:950 !important;text-transform:uppercase !important;}
      body.iq100-page-pro .sidebar-area .widget,body.iq100-page-pro .widget_info{border-radius:24px !important;background:linear-gradient(180deg,#fff,#f7fdff) !important;border:1px solid rgba(21,153,196,.16) !important;box-shadow:0 18px 44px rgba(6,20,38,.08) !important;overflow:hidden !important;}
      body.iq100-page-pro .widget_info:before{content:"IQ100 San Marcos" !important;display:block !important;margin:0 0 14px !important;padding:16px !important;border-radius:18px !important;background:linear-gradient(135deg,#1599c4,#0b6f95 58%,#f9a331 170%) !important;color:#fff !important;font-size:21px !important;font-weight:950 !important;text-transform:uppercase !important;text-align:center !important;}
      body.iq100-page-pro .iq100-cycle-name-badge{display:inline-flex !important;align-items:center !important;justify-content:center !important;margin:0 0 12px !important;padding:9px 13px !important;border-radius:999px !important;background:linear-gradient(135deg,#1599c4,#0b6f95) !important;color:#fff !important;font-size:13px !important;font-weight:950 !important;text-transform:uppercase !important;letter-spacing:.35px !important;box-shadow:0 12px 24px rgba(21,153,196,.18) !important;}
      @media(max-width:991px){body.iq100-page-pro .course-tab{grid-template-columns:1fr !important;}body.iq100-page-pro .tab-content{padding:18px !important;}}
      @media(max-width:575px){body.iq100-page-pro .breadcumb-wrapper{padding:70px 0 !important;}body.iq100-page-pro .iq100-content img{max-height:58px !important;}body.iq100-page-pro .course-single{border-radius:22px !important;}body.iq100-page-pro .course-single-top{padding:16px !important;}body.iq100-page-pro .course-img:after{position:relative !important;left:auto !important;bottom:auto !important;display:block !important;margin:12px 0 0 !important;border-radius:14px !important;text-align:center !important;}body.iq100-page-pro .course-title:after{font-size:30px !important;}body.iq100-page-pro .checklist li{font-size:14px !important;padding-left:40px !important;}}
    `;
    document.head.appendChild(style);
  }

  function replaceInString(value) {
    if (!value) return value;
    return value
      .replace(/Universidad Nacional de Ingeniería/gi, 'Universidad Nacional Mayor de San Marcos')
      .replace(/\bCEPRE\s*UNI\b/gi, 'CEPRE San Marcos')
      .replace(/\bUNI\b/g, 'San Marcos')
      .replace(/\bQ10\b/gi, 'Microsoft 365')
      .replace(/aula virtual/gi, 'Microsoft 365')
      .replace(/plataforma virtual propia/gi, 'Microsoft 365')
      .replace(/futuros ingenieros/gi, 'futuros sanmarquinos')
      .replace(/preparación para la San Marcos/gi, 'preparación para San Marcos');
  }

  function updateTextNodes() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p || ['SCRIPT','STYLE','NOSCRIPT'].indexOf(p.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return /UNI|Universidad Nacional de Ingeniería|Q10|aula virtual|plataforma virtual propia/i.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) { n.nodeValue = replaceInString(n.nodeValue); });
  }

  function updateAttributesAndMeta() {
    document.title = 'IQ100 San Marcos | Grupo de Estudio';
    document.querySelectorAll('meta[name="description"], meta[name="keywords"]').forEach(function (m) {
      m.setAttribute('content', 'IQ100 es la marca del Grupo de Estudio especializada en preparación para la Universidad Nacional Mayor de San Marcos. Informes y matrícula por WhatsApp.');
    });
    document.querySelectorAll('[alt], [title], [aria-label]').forEach(function (el) {
      ['alt','title','aria-label'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v) el.setAttribute(attr, replaceInString(v));
      });
    });
  }

  function updateWhatsappLinks() {
    document.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var txt = a.textContent || '';
      if (/wa\.link|wa\.me|whatsapp|q10|informes|inscríbete|inscribete|matr[ií]cula|brochure/i.test(href + ' ' + txt)) {
        a.setAttribute('href', WA);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        a.classList.add('iq100-wa-pro');
      }
    });
  }

  function fixSedeMenu() {
    document.querySelectorAll('.main-menu li.menu-item-has-children, .th-mobile-menu li.menu-item-has-children').forEach(function (li) {
      var first = li.querySelector(':scope > a');
      if (!first) return;
      var text = (first.textContent || '').trim().toLowerCase();
      if (text.indexOf('sede') !== -1) {
        first.textContent = 'Sede';
        first.setAttribute('href', 'sedes.html');
        var sub = li.querySelector(':scope > ul.sub-menu');
        if (!sub) {
          sub = document.createElement('ul');
          sub.className = 'sub-menu';
          li.appendChild(sub);
        }
        sub.innerHTML = '<li><a href="sedes.html">UNI</a></li>';
      }
    });
  }

  function fixCycleNames() {
    document.querySelectorAll('.main-menu a, .th-mobile-menu a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (cycleNames[href]) a.textContent = cycleNames[href];
      if (/^Ciclos$/i.test((a.textContent || '').trim())) {
        a.textContent = 'Preparación San Marcos';
        a.setAttribute('href', 'iq100.html');
      }
    });

    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (cycleNames[href] && !a.closest('.main-menu') && !a.closest('.th-mobile-menu')) {
        var parentCard = a.closest('.course-box2, .course-box, .blog-card, .price-card, .project-card, .service-card');
        if (parentCard && !parentCard.querySelector('.iq100-cycle-name-badge')) {
          var badge = document.createElement('div');
          badge.className = 'iq100-cycle-name-badge';
          badge.textContent = cycleNames[href];
          var target = parentCard.querySelector('.course-content, .blog-content, .price-card_content') || parentCard;
          target.insertBefore(badge, target.firstChild);
        }
      }
    });
  }

  function ensureNoBlankMenuText() {
    document.querySelectorAll('.main-menu a, .th-mobile-menu a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (!(a.textContent || '').trim()) {
        if (cycleNames[href]) a.textContent = cycleNames[href];
        else if (/index\.html/.test(href)) a.textContent = 'Inicio';
        else if (/blog\.html/.test(href)) a.textContent = 'Noticias';
        else if (/docentes\.html/.test(href)) a.textContent = 'Docentes';
        else if (/cachimbos\.html/.test(href)) a.textContent = 'Cachimbos';
        else if (/sedes\.html/.test(href)) a.textContent = 'UNI';
      }
    });
  }

  function init() {
    document.documentElement.classList.add('iq100-page-pro-root');
    document.body.classList.add('iq100-page-pro');
    injectStyles();
    updateTextNodes();
    updateAttributesAndMeta();
    updateWhatsappLinks();
    fixSedeMenu();
    fixCycleNames();
    ensureNoBlankMenuText();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
  });
})();
