/* ==================================================
   Grupo Nostradamus - Ciclos académicos desplegables en el index
   Mantiene las tarjetas existentes y reduce la altura inicial.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var file = path.split('/').pop() || 'index.html';
  var isHome = path === '/' || file === 'index.html' || file === '';
  if (!isHome) return;

  function addStyles() {
    if (document.getElementById('nostra-home-cycles-accordion-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-home-cycles-accordion-style';
    style.textContent = `
      #course-sec{
        position:relative!important;
        overflow:hidden!important;
        overflow-anchor:none!important;
        padding:54px 0!important;
        background:
          radial-gradient(circle at 10% 18%,rgba(0,194,209,.10),transparent 30%),
          linear-gradient(180deg,#f8fbfc 0%,#eef5f7 100%)!important;
        transition:padding .4s ease!important;
      }
      #course-sec[data-nhc-open="true"]{padding:72px 0!important;}
      #course-sec .nostra-home-cycles-summary{
        position:relative;
        z-index:3;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        gap:28px;
        width:100%;
        margin:0!important;
        padding:28px 30px!important;
        border:1px solid rgba(0,194,209,.28);
        border-radius:28px;
        background:
          radial-gradient(circle at 88% 18%,rgba(0,194,209,.22),transparent 35%),
          radial-gradient(circle at 10% 85%,rgba(244,165,28,.13),transparent 34%),
          linear-gradient(135deg,#02070d 0%,#061426 58%,#074d56 100%);
        box-shadow:0 24px 58px rgba(6,20,38,.18),0 0 28px rgba(0,194,209,.08);
        text-align:left!important;
        overflow:hidden;
      }
      #course-sec .nostra-home-cycles-summary:before{
        content:"";
        position:absolute;
        inset:0;
        background-image:
          linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
        background-size:38px 38px;
        pointer-events:none;
      }
      #course-sec .nostra-home-cycles-summary__copy,
      #course-sec .nostra-home-cycles-toggle{position:relative;z-index:2;}
      #course-sec .nostra-home-cycles-kicker{
        display:inline-flex;
        align-items:center;
        gap:8px;
        margin-bottom:8px;
        color:#a8f7ff;
        font-size:12px;
        font-weight:950;
        letter-spacing:.75px;
        text-transform:uppercase;
      }
      #course-sec .nostra-home-cycles-summary h2{
        margin:0!important;
        color:#fff!important;
        font-family:'Baloo 2','Jost',Arial,sans-serif!important;
        font-size:clamp(31px,4vw,52px)!important;
        line-height:1!important;
        letter-spacing:-.8px!important;
        text-transform:uppercase;
      }
      #course-sec .nostra-home-cycles-summary h2 span{color:#ffcf75;}
      #course-sec .nostra-home-cycles-summary p{
        max-width:760px;
        margin:10px 0 0!important;
        color:rgba(255,255,255,.76)!important;
        font-size:16px!important;
        line-height:1.55!important;
        font-weight:650!important;
      }
      #course-sec .nostra-home-cycles-toggle{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        width:min(330px,100%);
        min-height:68px;
        padding:13px 14px 13px 18px;
        border:1px solid rgba(255,255,255,.24);
        border-radius:20px;
        background:linear-gradient(135deg,#f4a51c 0%,#078c95 58%,#061426 100%);
        color:#fff;
        box-shadow:0 15px 34px rgba(0,0,0,.22),0 0 24px rgba(0,194,209,.15);
        text-align:left;
        cursor:pointer;
        transition:transform .22s ease,box-shadow .22s ease,filter .22s ease;
      }
      #course-sec .nostra-home-cycles-toggle:hover,
      #course-sec .nostra-home-cycles-toggle:focus-visible{
        transform:translateY(-3px);
        filter:brightness(1.05);
        box-shadow:0 22px 46px rgba(0,0,0,.28),0 0 30px rgba(0,194,209,.22);
        outline:none;
      }
      #course-sec .nostra-home-cycles-toggle__copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
      #course-sec .nostra-home-cycles-toggle__copy strong{color:#fff;font-size:15px;font-weight:950;line-height:1.2;}
      #course-sec .nostra-home-cycles-toggle__copy small{color:rgba(255,255,255,.76);font-size:11.5px;font-weight:750;line-height:1.3;}
      #course-sec .nostra-home-cycles-toggle__icon{
        display:grid;
        place-items:center;
        flex:0 0 42px;
        width:42px;
        height:42px;
        border-radius:14px;
        background:rgba(255,255,255,.13);
        border:1px solid rgba(255,255,255,.28);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 8px 20px rgba(0,0,0,.18);
        color:#fff;
        font-size:25px;
        font-weight:700;
        line-height:1;
        transition:transform .32s ease;
      }
      #course-sec[data-nhc-open="true"] .nostra-home-cycles-toggle__icon{transform:rotate(180deg);}
      #course-sec .nostra-home-cycles-panel{
        display:grid;
        grid-template-rows:0fr;
        margin-top:0;
        opacity:0;
        visibility:hidden;
        transition:grid-template-rows .5s ease,opacity .32s ease,visibility 0s linear .5s,margin .4s ease;
      }
      #course-sec[data-nhc-open="true"] .nostra-home-cycles-panel{
        grid-template-rows:1fr;
        margin-top:34px;
        opacity:1;
        visibility:visible;
        transition:grid-template-rows .5s ease,opacity .34s ease,visibility 0s linear 0s,margin .4s ease;
      }
      #course-sec .nostra-home-cycles-panel__inner{min-height:0;overflow:hidden;}
      #course-sec .nostra-home-cycles-panel .nostra-home-cycles-grid{padding:4px 2px 10px;}
      @media(max-width:991px){
        #course-sec .nostra-home-cycles-summary{grid-template-columns:1fr;text-align:center!important;gap:20px;}
        #course-sec .nostra-home-cycles-summary p{margin-left:auto!important;margin-right:auto!important;}
        #course-sec .nostra-home-cycles-toggle{width:min(420px,100%);margin:auto;}
      }
      @media(max-width:640px){
        #course-sec{padding:40px 0!important;}
        #course-sec[data-nhc-open="true"]{padding:50px 0!important;}
        #course-sec .nostra-home-cycles-summary{padding:23px 17px!important;border-radius:23px;}
        #course-sec .nostra-home-cycles-summary h2{font-size:30px!important;}
        #course-sec .nostra-home-cycles-summary p{font-size:14.5px!important;}
        #course-sec .nostra-home-cycles-toggle{min-height:64px;padding:12px 12px 12px 15px;border-radius:18px;}
        #course-sec .nostra-home-cycles-toggle__copy strong{font-size:14px;}
        #course-sec .nostra-home-cycles-toggle__copy small{font-size:10.8px;}
        #course-sec .nostra-home-cycles-toggle__icon{flex-basis:38px;width:38px;height:38px;border-radius:12px;}
      }
      @media(prefers-reduced-motion:reduce){
        #course-sec,
        #course-sec .nostra-home-cycles-toggle,
        #course-sec .nostra-home-cycles-toggle__icon,
        #course-sec .nostra-home-cycles-panel{transition:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function setState(section, open) {
    var button = section.querySelector('.nostra-home-cycles-toggle');
    var panel = section.querySelector('.nostra-home-cycles-panel');
    var label = section.querySelector('.nostra-home-cycles-toggle__label');
    var icon = section.querySelector('.nostra-home-cycles-toggle__icon');

    section.setAttribute('data-nhc-open', open ? 'true' : 'false');
    if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (label) label.textContent = open ? 'Ocultar ciclos disponibles' : 'Ver ciclos disponibles';
    if (icon) icon.textContent = open ? '−' : '+';
  }

  function enhance() {
    var section = document.getElementById('course-sec');
    if (!section) return false;
    if (section.getAttribute('data-nhc-ready') === '1') return true;

    var container = section.querySelector('.container');
    var title = container && container.querySelector('.title-area');
    var grid = container && container.querySelector('.filter-active');
    if (!container || !title || !grid) return false;

    addStyles();

    title.className = 'nostra-home-cycles-summary';
    title.innerHTML = `
      <div class="nostra-home-cycles-summary__copy">
        <span class="nostra-home-cycles-kicker">▣ Nuestros ciclos</span>
        <h2>Explora nuestros <span>ciclos académicos</span></h2>
        <p>Conoce la ruta adecuada según tu nivel, experiencia y cercanía al examen de admisión UNI.</p>
      </div>
      <button class="nostra-home-cycles-toggle" type="button" data-nostra-ignore-live="true" aria-expanded="false" aria-controls="nostra-home-cycles-details">
        <span class="nostra-home-cycles-toggle__copy"><strong class="nostra-home-cycles-toggle__label">Ver ciclos disponibles</strong><small>9 programas para cada etapa de preparación</small></span>
        <span class="nostra-home-cycles-toggle__icon" aria-hidden="true">+</span>
      </button>
    `;

    var panel = document.createElement('div');
    panel.id = 'nostra-home-cycles-details';
    panel.className = 'nostra-home-cycles-panel';
    panel.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'nostra-home-cycles-panel__inner';
    panel.appendChild(inner);
    grid.parentNode.insertBefore(panel, grid);
    inner.appendChild(grid);

    section.setAttribute('data-nhc-ready', '1');
    setState(section, false);

    var button = section.querySelector('.nostra-home-cycles-toggle');
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = section.getAttribute('data-nhc-open') !== 'true';
      setState(section, open);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'toggle_ciclos_index', {
          event_category: 'engagement',
          event_label: open ? 'abrir' : 'cerrar',
          page_name: 'home'
        });
      }
    });

    return true;
  }

  function start() {
    addStyles();
    if (enhance()) return;

    var observer = new MutationObserver(function () {
      if (enhance()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (enhance() || attempts >= 30) {
        window.clearInterval(timer);
        observer.disconnect();
      }
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
