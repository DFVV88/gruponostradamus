/* ==================================================
   Grupo Nostradamus - NostraPLATAFORMA desplegable en el inicio
   Mantiene el contenido original y reduce la altura inicial del index.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/');
  if (!isHome) return;

  function addStyles() {
    if (document.getElementById('nostra-plataforma-accordion-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-plataforma-accordion-style';
    style.textContent = `
      #nostra-plataforma-home{
        position:relative!important;
        overflow:hidden!important;
        padding:54px 0!important;
        background:
          radial-gradient(circle at 12% 15%,rgba(0,194,209,.11),transparent 28%),
          linear-gradient(180deg,#ffffff 0%,#eef8fa 100%)!important;
        transition:padding .38s ease!important;
      }
      #nostra-plataforma-home[data-np-open="true"]{padding:68px 0!important;}
      #nostra-plataforma-home:not([data-np-ready="1"])>.container>:not(.title-area){display:none!important;}
      #nostra-plataforma-home .np-shell{position:relative;z-index:2;}
      #nostra-plataforma-home .np-head{max-width:1040px;margin:0 auto 18px!important;text-align:center;}
      #nostra-plataforma-home .np-head .sub-title{margin-bottom:10px!important;}
      #nostra-plataforma-home .np-head h2{
        max-width:980px;
        margin:0 auto!important;
        color:#061426!important;
        font-size:clamp(31px,4vw,52px)!important;
        line-height:1.02!important;
        letter-spacing:-.8px!important;
      }
      #nostra-plataforma-home .np-head p{
        max-width:850px!important;
        margin:14px auto 0!important;
        color:#516479!important;
        font-size:16px!important;
        line-height:1.55!important;
      }
      #nostra-plataforma-home .np-toggle{
        position:relative;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
        width:min(820px,100%);
        min-height:68px;
        margin:0 auto;
        padding:14px 17px 14px 21px;
        border:1px solid rgba(0,194,209,.28);
        border-radius:22px;
        background:
          radial-gradient(circle at 85% 15%,rgba(0,194,209,.20),transparent 34%),
          linear-gradient(135deg,#061426,#0a2a3c 65%,#075b65);
        color:#fff;
        box-shadow:0 18px 44px rgba(6,20,38,.16),0 0 24px rgba(0,194,209,.09);
        text-align:left;
        cursor:pointer;
        transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;
      }
      #nostra-plataforma-home .np-toggle:hover,
      #nostra-plataforma-home .np-toggle:focus-visible{
        transform:translateY(-3px);
        border-color:rgba(0,212,223,.58);
        box-shadow:0 24px 52px rgba(6,20,38,.21),0 0 30px rgba(0,194,209,.17);
        outline:none;
      }
      #nostra-plataforma-home .np-toggle__copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
      #nostra-plataforma-home .np-toggle__copy strong{color:#fff;font-size:15px;font-weight:950;letter-spacing:.1px;}
      #nostra-plataforma-home .np-toggle__copy small{color:rgba(255,255,255,.72);font-size:12px;font-weight:700;line-height:1.35;}
      #nostra-plataforma-home .np-toggle__icon{
        display:grid;
        place-items:center;
        flex:0 0 auto;
        width:40px;
        height:40px;
        border-radius:14px;
        background:linear-gradient(135deg,#00c2d1,#078c95);
        border:1px solid rgba(255,255,255,.26);
        box-shadow:0 9px 22px rgba(0,194,209,.26),inset 0 1px 0 rgba(255,255,255,.25);
        color:#fff;
        font-size:24px;
        font-weight:700;
        line-height:1;
        transition:transform .32s ease;
      }
      #nostra-plataforma-home[data-np-open="true"] .np-toggle__icon{transform:rotate(180deg);}
      #nostra-plataforma-home .np-panel{
        display:grid;
        grid-template-rows:0fr;
        opacity:0;
        visibility:hidden;
        transition:grid-template-rows .48s ease,opacity .3s ease,visibility 0s linear .48s,margin .38s ease;
      }
      #nostra-plataforma-home[data-np-open="true"] .np-panel{
        grid-template-rows:1fr;
        margin-top:28px;
        opacity:1;
        visibility:visible;
        transition:grid-template-rows .48s ease,opacity .34s ease,visibility 0s linear 0s,margin .38s ease;
      }
      #nostra-plataforma-home .np-panel__inner{min-height:0;overflow:hidden;}
      #nostra-plataforma-home .np-benefits-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:18px!important;
      }
      #nostra-plataforma-home .np-benefits-grid article{
        min-height:184px!important;
        padding:23px!important;
        border:1px solid rgba(7,140,149,.17)!important;
        border-radius:24px!important;
        background:linear-gradient(180deg,#fff,#f8fdfe)!important;
        box-shadow:0 15px 36px rgba(6,20,38,.075)!important;
        transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important;
      }
      #nostra-plataforma-home .np-benefits-grid article:hover{
        transform:translateY(-5px);
        border-color:rgba(0,194,209,.38)!important;
        box-shadow:0 23px 48px rgba(6,20,38,.12),0 0 24px rgba(0,194,209,.08)!important;
      }
      #nostra-plataforma-home .np-benefits-grid article strong{font-size:21px!important;line-height:1.16!important;}
      #nostra-plataforma-home .np-actions{margin-top:28px!important;}
      @media(max-width:991px){
        #nostra-plataforma-home .np-benefits-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      }
      @media(max-width:640px){
        #nostra-plataforma-home{padding:42px 0!important;}
        #nostra-plataforma-home[data-np-open="true"]{padding:50px 0!important;}
        #nostra-plataforma-home .np-head h2{font-size:30px!important;}
        #nostra-plataforma-home .np-head p{font-size:14.5px!important;}
        #nostra-plataforma-home .np-toggle{min-height:64px;padding:12px 13px 12px 16px;border-radius:18px;}
        #nostra-plataforma-home .np-toggle__copy strong{font-size:14px;}
        #nostra-plataforma-home .np-toggle__copy small{font-size:11px;}
        #nostra-plataforma-home .np-toggle__icon{width:38px;height:38px;border-radius:12px;}
        #nostra-plataforma-home .np-benefits-grid{grid-template-columns:1fr!important;}
        #nostra-plataforma-home .np-benefits-grid article{min-height:auto!important;}
      }
      @media(prefers-reduced-motion:reduce){
        #nostra-plataforma-home,
        #nostra-plataforma-home .np-toggle,
        #nostra-plataforma-home .np-toggle__icon,
        #nostra-plataforma-home .np-panel,
        #nostra-plataforma-home .np-benefits-grid article{transition:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function setState(section, open, shouldReturn) {
    var button = section.querySelector('.np-toggle');
    var panel = section.querySelector('.np-panel');
    var label = section.querySelector('.np-toggle__label');
    var icon = section.querySelector('.np-toggle__icon');
    if (!button || !panel) return;

    section.setAttribute('data-np-open', open ? 'true' : 'false');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (label) label.textContent = open ? 'Ocultar beneficios de la plataforma' : 'Ver beneficios de la plataforma';
    if (icon) icon.textContent = open ? '−' : '+';

    if (!open && shouldReturn) {
      window.setTimeout(function () {
        var rect = section.getBoundingClientRect();
        if (rect.top < 72) section.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 120);
    }
  }

  function enhance() {
    var section = document.getElementById('nostra-plataforma-home');
    if (!section) return false;
    if (section.getAttribute('data-np-ready') === '1') return true;

    var container = section.querySelector('.container');
    var head = container && container.querySelector('.title-area');
    if (!container || !head) return false;

    var children = Array.from(container.children);
    var grid = children.find(function (element) {
      return element !== head && element.querySelectorAll && element.querySelectorAll('article').length >= 6;
    });
    var actions = grid && grid.nextElementSibling;
    if (!grid || !actions) return false;

    addStyles();
    container.classList.add('np-shell');
    head.classList.add('np-head');
    grid.classList.add('np-benefits-grid');
    actions.classList.add('np-actions');

    var title = head.querySelector('h2');
    if (title) title.textContent = 'NostraPLATAFORMA: todo conectado para tu preparación';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'np-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'nostra-plataforma-beneficios');
    button.innerHTML = '<span class="np-toggle__copy"><strong class="np-toggle__label">Ver beneficios de la plataforma</strong><small>Cuenta, clases en vivo, comunidad, materiales, comunicados y pagos</small></span><span class="np-toggle__icon" aria-hidden="true">+</span>';

    var panel = document.createElement('div');
    panel.id = 'nostra-plataforma-beneficios';
    panel.className = 'np-panel';
    panel.setAttribute('aria-hidden', 'true');

    var inner = document.createElement('div');
    inner.className = 'np-panel__inner';
    panel.appendChild(inner);
    inner.appendChild(grid);
    inner.appendChild(actions);
    head.insertAdjacentElement('afterend', button);
    button.insertAdjacentElement('afterend', panel);

    section.setAttribute('data-np-ready', '1');
    setState(section, false, false);

    button.addEventListener('click', function () {
      var open = section.getAttribute('data-np-open') !== 'true';
      setState(section, open, !open);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'toggle_nostraplataforma', {
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
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();