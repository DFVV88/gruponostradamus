/* ==================================================
   Grupo Nostradamus - Noticias desplegables en index
   Reemplaza solo las noticias antiguas del inicio.
   Mantiene las fuentes, tarjetas y enlaces actuales.
================================================== */
(function () {
  'use strict';

  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  var whatsappURL = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, vi la sección de información UNI y quiero informes para prepararme.');

  var bloques = [
    {
      icono: '🎓',
      etiqueta: 'Admisión UNI',
      titulo: 'Modalidades de ingreso',
      texto: 'Revisa las modalidades oficiales para postular a la Universidad Nacional de Ingeniería y elige la ruta que mejor se adapta a tu perfil académico.',
      url: 'https://admision.uni.edu.pe/modalidades/',
      boton: 'Ver modalidades',
      clase: 'modalidades'
    },
    {
      icono: '🧭',
      etiqueta: 'Decide tu carrera',
      titulo: 'Orientación vocacional',
      texto: 'Accede a información útil para elegir mejor tu carrera, reconocer tus intereses y tomar una decisión más segura antes de iniciar tu preparación.',
      url: 'https://admision.uni.edu.pe/orientacion-vocacional/',
      boton: 'Ver orientación',
      clase: 'vocacional'
    },
    {
      icono: '📰',
      etiqueta: 'Actualidad UNI',
      titulo: 'Noticias UNI',
      texto: 'Mantente informado con novedades, comunicados y actividades oficiales de la Universidad Nacional de Ingeniería para postulantes y comunidad UNI.',
      url: 'https://portal.uni.edu.pe/index.php/accesos/prensa/noticias-uni',
      boton: 'Leer noticias',
      clase: 'noticias'
    }
  ];

  function injectStyles() {
    var old = document.getElementById('nostra-index-noticias-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-index-noticias-pro-style';
    style.textContent = `
      body .nostra-index-news-section{
        position:relative!important;
        padding:58px 0!important;
        background:
          radial-gradient(circle at 12% 0%,rgba(0,194,209,.16),transparent 34%),
          radial-gradient(circle at 88% 18%,rgba(0,139,150,.11),transparent 34%),
          linear-gradient(180deg,#f8fdff 0%,#ffffff 100%)!important;
        overflow:hidden!important;
        overflow-anchor:none!important;
        transition:padding .38s ease!important;
      }
      body .nostra-index-news-section[data-nin-open="true"]{padding:76px 0!important;}
      body .nostra-index-news-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(300px,430px)!important;
        gap:30px!important;
        align-items:center!important;
        margin:0!important;
      }
      body .nostra-index-news-kicker{
        display:inline-flex!important;
        align-items:center!important;
        gap:8px!important;
        margin-bottom:12px!important;
        color:#008b96!important;
        font-size:15px!important;
        font-weight:950!important;
        text-transform:uppercase!important;
        letter-spacing:.75px!important;
      }
      body .nostra-index-news-title{
        margin:0!important;
        max-width:850px!important;
        color:#061426!important;
        font-size:clamp(34px,4.2vw,62px)!important;
        line-height:1.01!important;
        font-weight:950!important;
        font-style:italic!important;
        text-transform:uppercase!important;
        letter-spacing:-1.1px!important;
        background:linear-gradient(180deg,#061426 0%,#0b3444 42%,#008b96 72%,#061426 100%)!important;
        -webkit-background-clip:text!important;
        background-clip:text!important;
        -webkit-text-fill-color:transparent!important;
        filter:drop-shadow(0 2px 0 rgba(255,255,255,.72))!important;
      }
      body .nostra-index-news-intro{
        max-width:760px!important;
        margin:15px 0 0!important;
        color:#516479!important;
        font-size:16px!important;
        line-height:1.58!important;
        font-weight:600!important;
      }
      body .nostra-index-news-toggle{
        position:relative!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:18px!important;
        width:100%!important;
        min-height:76px!important;
        padding:15px 16px 15px 21px!important;
        border:1px solid rgba(0,194,209,.34)!important;
        border-radius:24px!important;
        background:
          radial-gradient(circle at 84% 14%,rgba(0,194,209,.22),transparent 35%),
          linear-gradient(135deg,#061426,#0a2a3c 64%,#075b65)!important;
        color:#fff!important;
        box-shadow:0 19px 46px rgba(6,20,38,.18),0 0 28px rgba(0,194,209,.10)!important;
        text-align:left!important;
        cursor:pointer!important;
        transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important;
      }
      body .nostra-index-news-toggle:hover,
      body .nostra-index-news-toggle:focus-visible{
        transform:translateY(-3px)!important;
        border-color:rgba(0,212,223,.62)!important;
        box-shadow:0 25px 56px rgba(6,20,38,.23),0 0 32px rgba(0,194,209,.18)!important;
        outline:none!important;
      }
      body .nostra-index-news-toggle__copy{display:flex!important;flex-direction:column!important;gap:3px!important;min-width:0!important;}
      body .nostra-index-news-toggle__copy strong{color:#fff!important;font-size:15px!important;font-weight:950!important;text-transform:uppercase!important;}
      body .nostra-index-news-toggle__copy small{color:rgba(255,255,255,.73)!important;font-size:12px!important;font-weight:700!important;line-height:1.35!important;}
      body .nostra-index-news-toggle__icon{
        display:grid!important;
        place-items:center!important;
        flex:0 0 auto!important;
        width:43px!important;
        height:43px!important;
        border-radius:14px!important;
        background:linear-gradient(135deg,#ffb52e,#00c2d1,#078c95)!important;
        border:1px solid rgba(255,255,255,.28)!important;
        box-shadow:0 10px 24px rgba(0,194,209,.27),inset 0 1px 0 rgba(255,255,255,.27)!important;
        color:#fff!important;
        font-size:25px!important;
        font-weight:800!important;
        line-height:1!important;
        transition:transform .32s ease!important;
      }
      body .nostra-index-news-section[data-nin-open="true"] .nostra-index-news-toggle__icon{transform:rotate(180deg)!important;}
      body .nostra-index-news-panel{
        display:grid!important;
        grid-template-rows:0fr!important;
        margin-top:0!important;
        opacity:0!important;
        visibility:hidden!important;
        transition:grid-template-rows .48s ease,opacity .3s ease,visibility 0s linear .48s,margin .38s ease!important;
      }
      body .nostra-index-news-section[data-nin-open="true"] .nostra-index-news-panel{
        grid-template-rows:1fr!important;
        margin-top:34px!important;
        opacity:1!important;
        visibility:visible!important;
        transition:grid-template-rows .48s ease,opacity .34s ease,visibility 0s linear 0s,margin .38s ease!important;
      }
      body .nostra-index-news-panel__inner{min-height:0!important;overflow:hidden!important;}
      body .nostra-index-news-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:28px!important;}
      body .nostra-index-news-card{
        position:relative!important;
        min-height:390px!important;
        display:flex!important;
        flex-direction:column!important;
        padding:28px!important;
        border-radius:28px!important;
        background:linear-gradient(180deg,#ffffff,#f2fdff)!important;
        border:1px solid rgba(0,194,209,.24)!important;
        box-shadow:0 20px 50px rgba(6,20,38,.08),0 0 28px rgba(0,194,209,.08)!important;
        overflow:hidden!important;
        transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease!important;
      }
      body .nostra-index-news-card::before{content:''!important;position:absolute!important;inset:0 0 auto 0!important;height:7px!important;background:linear-gradient(90deg,#00c2d1,#008b96,#061426)!important;}
      body .nostra-index-news-card:hover{transform:translateY(-8px)!important;border-color:rgba(0,194,209,.48)!important;box-shadow:0 30px 68px rgba(6,20,38,.13),0 0 38px rgba(0,194,209,.14)!important;}
      body .nostra-index-news-icon{width:70px!important;height:70px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin-bottom:20px!important;border-radius:22px!important;background:linear-gradient(135deg,#061426,#008b96)!important;color:#fff!important;font-size:31px!important;box-shadow:0 16px 30px rgba(0,139,150,.22)!important;}
      body .nostra-index-news-label{display:inline-flex!important;align-self:flex-start!important;margin-bottom:10px!important;padding:6px 10px!important;border-radius:999px!important;background:rgba(0,194,209,.10)!important;color:#008b96!important;font-size:11px!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:.45px!important;}
      body .nostra-index-news-card h3{margin:0 0 14px!important;color:#061426!important;font-size:clamp(24px,2vw,34px)!important;line-height:1.08!important;font-weight:950!important;text-transform:uppercase!important;letter-spacing:-.45px!important;}
      body .nostra-index-news-card p{margin:0 0 22px!important;color:#566575!important;font-size:15.5px!important;line-height:1.62!important;font-weight:650!important;}
      body .nostra-index-news-actions{margin-top:auto!important;display:grid!important;grid-template-columns:1fr!important;gap:10px!important;}
      body .nostra-index-news-btn,body .nostra-index-news-wa{min-height:47px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;padding:12px 16px!important;border-radius:999px!important;color:#fff!important;font-size:13.5px!important;font-weight:950!important;text-transform:uppercase!important;text-decoration:none!important;}
      body .nostra-index-news-btn{background:linear-gradient(135deg,#008b96 0%,#05313d 55%,#061426 100%)!important;box-shadow:0 13px 26px rgba(0,139,150,.20)!important;}
      body .nostra-index-news-wa{background:linear-gradient(135deg,#25d366 0%,#13a54d 48%,#061426 100%)!important;box-shadow:0 13px 26px rgba(37,211,102,.20)!important;}
      body .nostra-index-news-btn:hover,body .nostra-index-news-wa:hover{color:#fff!important;transform:translateY(-2px)!important;box-shadow:0 18px 34px rgba(0,194,209,.28)!important;}
      body .nostra-index-news-note{margin:34px auto 0!important;max-width:980px!important;padding:20px 22px!important;border-radius:22px!important;background:linear-gradient(135deg,#061426,#083044 62%,#008b96)!important;color:#fff!important;text-align:center!important;box-shadow:0 22px 48px rgba(6,20,38,.15)!important;font-size:15.5px!important;font-weight:700!important;line-height:1.55!important;}
      body .nostra-index-news-note strong{color:#a8f7ff!important;}
      body .nostra-index-news-footer{display:flex!important;justify-content:center!important;margin-top:22px!important;}
      body .nostra-index-news-all{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;min-height:50px!important;padding:13px 22px!important;border-radius:999px!important;background:#fff!important;border:1px solid rgba(0,139,150,.30)!important;color:#061426!important;font-size:14px!important;font-weight:950!important;text-transform:uppercase!important;text-decoration:none!important;box-shadow:0 14px 32px rgba(6,20,38,.10)!important;}
      body .nostra-index-news-all:hover{color:#008b96!important;transform:translateY(-2px)!important;box-shadow:0 20px 38px rgba(0,139,150,.16)!important;}
      @media(max-width:1199px){body .nostra-index-news-grid{grid-template-columns:1fr!important;}body .nostra-index-news-card{min-height:auto!important;}}
      @media(max-width:991px){body .nostra-index-news-head{grid-template-columns:1fr!important;align-items:start!important;}body .nostra-index-news-toggle{max-width:680px!important;}}
      @media(max-width:575px){body .nostra-index-news-section{padding:46px 0!important;}body .nostra-index-news-section[data-nin-open="true"]{padding:56px 0!important;}body .nostra-index-news-title{font-size:34px!important;}body .nostra-index-news-intro{font-size:14.5px!important;}body .nostra-index-news-toggle{min-height:68px!important;padding:13px 13px 13px 16px!important;border-radius:19px!important;}body .nostra-index-news-toggle__copy strong{font-size:13.5px!important;}body .nostra-index-news-toggle__copy small{font-size:11px!important;}body .nostra-index-news-toggle__icon{width:39px!important;height:39px!important;border-radius:12px!important;}body .nostra-index-news-card{padding:22px!important;border-radius:22px!important;}}
      @media(prefers-reduced-motion:reduce){body .nostra-index-news-section,body .nostra-index-news-toggle,body .nostra-index-news-toggle__icon,body .nostra-index-news-panel,body .nostra-index-news-card{transition:none!important;}}
    `;
    document.head.appendChild(style);
  }

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findSection() {
    var nodes = Array.from(document.querySelectorAll('section'));
    var matches = nodes.filter(function (el) {
      if (el.classList.contains('nostra-index-news-section')) return false;
      var txt = normalize(el.textContent);

      var isFAQ = txt.indexOf('preguntas frecuentes') !== -1 ||
        txt.indexOf('resuelve tus dudas') !== -1 ||
        txt.indexOf('que ciclo debo elegir') !== -1 ||
        txt.indexOf('como puedo inscribirme') !== -1 ||
        txt.indexOf('como puedo acceder a la intranet') !== -1;
      if (isFAQ) return false;

      var hasOldTitle = txt.indexOf('explora nuestro mundo academico') !== -1;
      var hasOldBlogCards = txt.indexOf('conoces las modalidades para ingresar a la uni') !== -1 &&
        txt.indexOf('examen de admision uni') !== -1 &&
        txt.indexOf('orientacion vocacional') !== -1;
      var hasBlogStructure = !!el.querySelector('.blog-card, .blog-box, .blog-grid, .th-blog, [class*="blog"]');

      return (hasOldTitle || hasOldBlogCards) && hasBlogStructure;
    });

    if (!matches.length) return null;
    matches.sort(function (a, b) { return a.textContent.length - b.textContent.length; });
    return matches[0];
  }

  function cardHTML(item) {
    return '' +
      '<article class="nostra-index-news-card nostra-index-news-card--' + item.clase + '">' +
        '<div class="nostra-index-news-icon">' + item.icono + '</div>' +
        '<span class="nostra-index-news-label">' + item.etiqueta + '</span>' +
        '<h3>' + item.titulo + '</h3>' +
        '<p>' + item.texto + '</p>' +
        '<div class="nostra-index-news-actions">' +
          '<a class="nostra-index-news-btn" href="' + item.url + '" target="_blank" rel="noopener noreferrer">' + item.boton + ' <i class="fas fa-arrow-right"></i></a>' +
          '<a class="nostra-index-news-wa" href="' + whatsappURL + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Quiero prepararme</a>' +
        '</div>' +
      '</article>';
  }

  function buildSection() {
    return '' +
      '<div class="container">' +
        '<div class="nostra-index-news-head">' +
          '<div>' +
            '<span class="nostra-index-news-kicker">📌 Información oficial para postulantes</span>' +
            '<h2 class="nostra-index-news-title">Explora información clave para ingresar a la UNI</h2>' +
            '<p class="nostra-index-news-intro">Fechas, modalidades, orientación y novedades oficiales para tomar mejores decisiones durante tu preparación.</p>' +
          '</div>' +
          '<button class="nostra-index-news-toggle" type="button" data-nostra-ignore-live="true" aria-expanded="false" aria-controls="nostra-index-news-details">' +
            '<span class="nostra-index-news-toggle__copy"><strong class="nostra-index-news-toggle__label">Ver noticias académicas</strong><small>Modalidades, orientación vocacional y actualidad UNI</small></span>' +
            '<span class="nostra-index-news-toggle__icon" aria-hidden="true">+</span>' +
          '</button>' +
        '</div>' +
        '<div class="nostra-index-news-panel" id="nostra-index-news-details" aria-hidden="true">' +
          '<div class="nostra-index-news-panel__inner">' +
            '<div class="nostra-index-news-grid">' + bloques.map(cardHTML).join('') + '</div>' +
            '<div class="nostra-index-news-note"><strong>Tip Nostradamus:</strong> revisa estas fuentes oficiales y luego solicita asesoría para elegir el ciclo que mejor se ajusta a tu nivel y objetivo de ingreso.</div>' +
            '<div class="nostra-index-news-footer"><a class="nostra-index-news-all" href="blog.html">Ver todas las noticias <i class="fas fa-arrow-right"></i></a></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function setState(section, open) {
    var button = section.querySelector('.nostra-index-news-toggle');
    var panel = section.querySelector('.nostra-index-news-panel');
    var label = section.querySelector('.nostra-index-news-toggle__label');
    var icon = section.querySelector('.nostra-index-news-toggle__icon');

    section.setAttribute('data-nin-open', open ? 'true' : 'false');
    if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (label) label.textContent = open ? 'Ocultar noticias académicas' : 'Ver noticias académicas';
    if (icon) icon.textContent = open ? '−' : '+';
  }

  function bindToggle(section) {
    var button = section.querySelector('.nostra-index-news-toggle');
    if (!button) return;

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = section.getAttribute('data-nin-open') !== 'true';
      setState(section, open);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'toggle_noticias_index', {
          event_category: 'engagement',
          event_label: open ? 'abrir' : 'cerrar',
          page_name: 'home'
        });
      }
    });
  }

  function init() {
    injectStyles();
    var section = findSection();
    if (!section) return;

    section.classList.add('nostra-index-news-section');
    section.innerHTML = buildSection();
    section.setAttribute('data-nin-ready', '1');
    section.setAttribute('data-nostra-index-noticias-pro', '4');
    setState(section, false);
    bindToggle(section);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () {
    init();
    window.setTimeout(init, 400);
    window.setTimeout(init, 1000);
  });
})();
