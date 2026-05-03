/* ==================================================
   IQ100 - Correcciones finales
   - Menú visible
   - Sede: solo UNI
   - Ciclos con nombres visibles
   - Enlaces comerciales a WhatsApp
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

  function injectFinalStyles() {
    var old = document.getElementById('iq100-final-fixes-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'iq100-final-fixes-style';
    style.textContent = `
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

      body.iq100-page-pro .course-title,
      body.iq100-page-pro .price-card_title,
      body.iq100-page-pro .course-curriculam .h5{
        opacity:1 !important;
        visibility:visible !important;
      }

      body.iq100-page-pro .iq100-cycle-name-badge{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        margin:0 0 12px !important;
        padding:9px 13px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#1599c4,#0b6f95) !important;
        color:#fff !important;
        font-size:13px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.35px !important;
        box-shadow:0 12px 24px rgba(21,153,196,.18) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function forceWhatsappLinks() {
    document.querySelectorAll('a').forEach(function (a) {
      var txt = (a.textContent || '').trim();
      var href = a.getAttribute('href') || '';
      if (/wa\.link|wa\.me|whatsapp|informes|inscríbete|inscribete|matr[ií]cula|brochure/i.test(href + ' ' + txt)) {
        a.setAttribute('href', WA);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
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
      if (cycleNames[href]) {
        a.textContent = cycleNames[href];
      }
    });

    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (cycleNames[href] && !a.querySelector('.iq100-cycle-name-badge') && !a.closest('.main-menu') && !a.closest('.th-mobile-menu')) {
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
    document.body.classList.add('iq100-page-pro');
    injectFinalStyles();
    fixSedeMenu();
    fixCycleNames();
    ensureNoBlankMenuText();
    forceWhatsappLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
  });
})();
