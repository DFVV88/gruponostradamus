/* ==================================================
   Grupo Nostradamus - Sección NostraCHAT desplegable en index
   Se crea cerrada desde el primer render para evitar saltos y parpadeos.
================================================== */
(function () {
  'use strict';

  var path = location.pathname.toLowerCase();
  var fileName = path.split('/').pop() || 'index.html';
  var isIndex = path === '/' || fileName === 'index.html' || fileName === '';
  if (!isIndex) return;
  if (document.getElementById('nostrachat-index-section')) return;

  function injectStyles() {
    if (document.getElementById('nostrachat-index-section-style')) return;

    var style = document.createElement('style');
    style.id = 'nostrachat-index-section-style';
    style.textContent = `
      #nostrachat-index-section,
      #nostrachat-index-section *{box-sizing:border-box;}
      #nostrachat-index-section{
        position:relative;
        overflow:hidden;
        padding:58px 0;
        background:
          radial-gradient(circle at 12% 15%,rgba(0,194,209,.22),transparent 32%),
          radial-gradient(circle at 88% 80%,rgba(255,148,30,.20),transparent 34%),
          linear-gradient(135deg,#02070d 0%,#061426 56%,#07333b 100%);
        color:#fff;
        font-family:'Jost',Arial,sans-serif;
        overflow-anchor:none;
      }
      #nostrachat-index-section:before{
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(90deg,rgba(255,255,255,.04),transparent 40%,rgba(255,255,255,.03));
        pointer-events:none;
      }
      .nostrachat-index-shell{
        width:min(1180px,92%);
        margin:auto;
        position:relative;
        z-index:2;
      }
      .nostrachat-index-summary{
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        gap:28px;
        padding:30px 32px;
        border-radius:30px;
        background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.065));
        border:1px solid rgba(255,255,255,.18);
        box-shadow:0 24px 68px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.10);
        backdrop-filter:blur(12px);
      }
      .nostrachat-index-kicker{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:8px 14px;
        border-radius:999px;
        background:rgba(255,255,255,.09);
        border:1px solid rgba(255,255,255,.22);
        color:#a8f7ff;
        font-size:12px;
        font-weight:950;
        text-transform:uppercase;
        letter-spacing:.55px;
        margin-bottom:11px;
      }
      .nostrachat-index-summary h2{
        margin:0 0 8px;
        color:#fff!important;
        font-family:'Baloo 2','Jost',Arial,sans-serif;
        font-size:clamp(34px,4.7vw,58px);
        line-height:.98;
        text-transform:uppercase;
      }
      .nostrachat-index-summary h2 span{color:#ffcf75;}
      .nostrachat-index-summary p{
        max-width:850px;
        margin:0;
        color:rgba(255,255,255,.78);
        font-size:17px;
        line-height:1.55;
      }
      .nostrachat-index-toggle{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        min-width:310px;
        min-height:66px;
        padding:13px 15px 13px 19px;
        border:1px solid rgba(168,247,255,.28);
        border-radius:20px;
        background:
          radial-gradient(circle at 86% 15%,rgba(0,194,209,.22),transparent 38%),
          linear-gradient(135deg,#061426,#0b3444 68%,#087783);
        color:#fff;
        box-shadow:0 18px 44px rgba(0,0,0,.20),0 0 28px rgba(0,194,209,.10);
        cursor:pointer;
        text-align:left;
        transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease;
      }
      .nostrachat-index-toggle:hover,
      .nostrachat-index-toggle:focus-visible{
        transform:translateY(-3px);
        border-color:rgba(168,247,255,.58);
        box-shadow:0 24px 52px rgba(0,0,0,.26),0 0 34px rgba(0,194,209,.16);
        outline:none;
      }
      .nostrachat-index-toggle__copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
      .nostrachat-index-toggle__copy strong{color:#fff;font-size:15px;font-weight:950;}
      .nostrachat-index-toggle__copy small{color:rgba(255,255,255,.68);font-size:12px;font-weight:700;line-height:1.35;}
      .nostrachat-index-toggle__icon{
        display:grid;
        place-items:center;
        flex:0 0 auto;
        width:42px;
        height:42px;
        border-radius:14px;
        background:linear-gradient(135deg,#f5c542,#ff941e,#078c95);
        border:1px solid rgba(255,255,255,.28);
        box-shadow:0 10px 24px rgba(255,148,30,.24),inset 0 1px 0 rgba(255,255,255,.25);
        color:#fff;
        font-size:24px;
        font-weight:800;
        line-height:1;
        transition:transform .3s ease;
      }
      #nostrachat-index-section[data-chat-open="true"] .nostrachat-index-toggle__icon{transform:rotate(180deg);}
      .nostrachat-index-panel-wrap{
        display:grid;
        grid-template-rows:0fr;
        opacity:0;
        visibility:hidden;
        margin-top:0;
        transition:grid-template-rows .46s ease,opacity .3s ease,visibility 0s linear .46s,margin .36s ease;
      }
      #nostrachat-index-section[data-chat-open="true"] .nostrachat-index-panel-wrap{
        grid-template-rows:1fr;
        opacity:1;
        visibility:visible;
        margin-top:26px;
        transition:grid-template-rows .46s ease,opacity .34s ease,visibility 0s linear 0s,margin .36s ease;
      }
      .nostrachat-index-panel-inner{min-height:0;overflow:hidden;}
      .nostrachat-index-wrap{
        display:grid;
        grid-template-columns:1.02fr .98fr;
        gap:34px;
        align-items:center;
        padding:30px;
        border-radius:30px;
        background:rgba(255,255,255,.065);
        border:1px solid rgba(255,255,255,.14);
        box-shadow:0 24px 68px rgba(0,0,0,.22);
      }
      .nostrachat-index-content h3{
        margin:0 0 16px;
        color:#fff!important;
        font-family:'Baloo 2','Jost',Arial,sans-serif;
        font-size:clamp(30px,3.5vw,48px);
        line-height:1;
        text-transform:uppercase;
      }
      .nostrachat-index-content h3 span{display:block;color:#ffcf75;}
      .nostrachat-index-content p{
        color:rgba(255,255,255,.84);
        font-size:18px;
        line-height:1.62;
        margin:0 0 22px;
      }
      .nostrachat-index-features{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin:24px 0;
      }
      .nostrachat-index-feature{
        padding:13px 14px;
        border-radius:16px;
        background:rgba(255,255,255,.09);
        border:1px solid rgba(255,255,255,.14);
        color:#fff;
        font-size:15px;
        font-weight:850;
        line-height:1.35;
      }
      .nostrachat-index-actions{display:flex;gap:13px;flex-wrap:wrap;align-items:center;}
      .nostrachat-index-btn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:9px;
        min-height:52px;
        padding:14px 22px;
        border-radius:999px;
        color:#fff!important;
        font-weight:950;
        text-transform:uppercase;
        text-decoration:none!important;
        transition:transform .2s ease,filter .2s ease,box-shadow .2s ease;
      }
      .nostrachat-index-btn:hover{transform:translateY(-2px);filter:brightness(1.05);}
      .nostrachat-index-btn.primary{background:linear-gradient(135deg,#ffb539,#078c95,#061426);box-shadow:0 16px 38px rgba(255,148,30,.24);}
      .nostrachat-index-btn.secondary{background:#fff;color:#061426!important;}
      .nostrachat-index-panel{
        position:relative;
        padding:24px;
        border-radius:32px;
        background:rgba(255,255,255,.10);
        border:1px solid rgba(255,255,255,.22);
        box-shadow:0 26px 80px rgba(0,0,0,.26);
        backdrop-filter:blur(12px);
      }
      .nostrachat-index-chathead{display:flex;align-items:center;gap:13px;padding:13px;border-radius:20px;background:rgba(255,255,255,.12);margin-bottom:16px;}
      .nostrachat-index-avatar{width:54px;height:54px;border-radius:18px;display:grid;place-items:center;font-size:26px;background:linear-gradient(135deg,#f5c542,#ff941e);}
      .nostrachat-index-chathead strong{display:block;color:#fff;font-size:19px;line-height:1.1;}
      .nostrachat-index-chathead span{display:block;color:rgba(255,255,255,.74);font-size:14px;margin-top:3px;}
      .nostrachat-index-bubble{max-width:88%;padding:12px 14px;border-radius:18px;margin:10px 0;font-weight:800;line-height:1.43;font-size:15px;}
      .nostrachat-index-bubble.left{background:#fff;color:#26384a;border-bottom-left-radius:5px;}
      .nostrachat-index-bubble.right{margin-left:auto;background:linear-gradient(135deg,#078c95,#00c2d1);color:#fff;border-bottom-right-radius:5px;}
      .nostrachat-index-mini{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;}
      .nostrachat-index-mini-card{border-radius:18px;padding:15px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);}
      .nostrachat-index-mini-card strong{display:block;color:#ffcf75;font-size:16px;margin-bottom:5px;}
      .nostrachat-index-mini-card span{display:block;color:rgba(255,255,255,.82);font-size:14px;line-height:1.35;}
      @media(max-width:991px){
        #nostrachat-index-section{padding:46px 0;}
        .nostrachat-index-summary{grid-template-columns:1fr;padding:25px;}
        .nostrachat-index-toggle{width:100%;min-width:0;}
        .nostrachat-index-wrap{grid-template-columns:1fr;padding:24px;}
        .nostrachat-index-features,.nostrachat-index-mini{grid-template-columns:1fr;}
        .nostrachat-index-actions{flex-direction:column;align-items:stretch;}
        .nostrachat-index-btn{width:100%;}
      }
      @media(max-width:640px){
        #nostrachat-index-section{padding:38px 0;}
        .nostrachat-index-summary{padding:21px 18px;border-radius:24px;}
        .nostrachat-index-summary h2{font-size:31px;}
        .nostrachat-index-summary p{font-size:15px;}
        .nostrachat-index-toggle{min-height:64px;padding:12px 13px 12px 16px;border-radius:18px;}
        .nostrachat-index-toggle__copy strong{font-size:14px;}
        .nostrachat-index-toggle__copy small{font-size:11px;}
        .nostrachat-index-toggle__icon{width:38px;height:38px;border-radius:12px;}
        .nostrachat-index-wrap{padding:20px 16px;border-radius:24px;}
        .nostrachat-index-content p{font-size:16px;}
      }
      @media(prefers-reduced-motion:reduce){
        .nostrachat-index-toggle,
        .nostrachat-index-toggle__icon,
        .nostrachat-index-panel-wrap,
        .nostrachat-index-btn{transition:none!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function setState(section, open) {
    var button = section.querySelector('.nostrachat-index-toggle');
    var panel = section.querySelector('.nostrachat-index-panel-wrap');
    var label = section.querySelector('.nostrachat-index-toggle__label');
    var icon = section.querySelector('.nostrachat-index-toggle__icon');

    section.setAttribute('data-chat-open', open ? 'true' : 'false');
    if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (label) label.textContent = open ? 'Ocultar NostraCHAT' : 'Conocer NostraCHAT';
    if (icon) icon.textContent = open ? '−' : '+';
  }

  function bindToggle(section) {
    var button = section.querySelector('.nostrachat-index-toggle');
    if (!button) return;

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = section.getAttribute('data-chat-open') !== 'true';
      setState(section, open);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'toggle_nostrachat_index', {
          event_category: 'engagement',
          event_label: open ? 'abrir' : 'cerrar',
          page_name: 'home'
        });
      }
    });
  }

  function createSection() {
    var section = document.createElement('section');
    section.id = 'nostrachat-index-section';
    section.setAttribute('data-chat-open', 'false');
    section.innerHTML = `
      <div class="nostrachat-index-shell">
        <div class="nostrachat-index-summary">
          <div>
            <div class="nostrachat-index-kicker">💬 Nueva comunidad académica</div>
            <h2>NostraCHAT <span>para alumnos y postulantes</span></h2>
            <p>Consultas académicas, orientación y acompañamiento dentro del ecosistema Nostradamus.</p>
          </div>
          <button class="nostrachat-index-toggle" type="button" aria-expanded="false" aria-controls="nostrachat-index-details">
            <span class="nostrachat-index-toggle__copy"><strong class="nostrachat-index-toggle__label">Conocer NostraCHAT</strong><small>Descubre cómo funcionará la comunidad académica</small></span>
            <span class="nostrachat-index-toggle__icon" aria-hidden="true">+</span>
          </button>
        </div>

        <div class="nostrachat-index-panel-wrap" id="nostrachat-index-details" aria-hidden="true">
          <div class="nostrachat-index-panel-inner">
            <div class="nostrachat-index-wrap">
              <div class="nostrachat-index-content">
                <h3>NostraCHAT <span>para alumnos y postulantes</span></h3>
                <p>Estamos preparando una zona propia de consultas académicas para que los alumnos puedan organizar sus dudas y los postulantes externos reciban orientación sin salir del ecosistema Nostradamus.</p>
                <div class="nostrachat-index-features">
                  <div class="nostrachat-index-feature">✅ Zona privada para alumnos</div>
                  <div class="nostrachat-index-feature">✅ Zona orientativa para externos</div>
                  <div class="nostrachat-index-feature">✅ Reglas y moderación académica</div>
                  <div class="nostrachat-index-feature">✅ Preparado para futuras consultas con foto</div>
                </div>
                <div class="nostrachat-index-actions">
                  <a class="nostrachat-index-btn primary" href="nostrachat.html">💬 Conocer NostraCHAT</a>
                  <a class="nostrachat-index-btn secondary" href="https://wa.me/51993750351?text=Hola%20Nostradamus,%20quiero%20informes%20sobre%20NostraCHAT" target="_blank" rel="noopener">Solicitar informes</a>
                </div>
              </div>
              <div class="nostrachat-index-panel" aria-label="Vista previa de NostraCHAT">
                <div class="nostrachat-index-chathead">
                  <div class="nostrachat-index-avatar">🧠</div>
                  <div><strong>NostraCHAT Académico</strong><span>Comunidad en desarrollo</span></div>
                </div>
                <div class="nostrachat-index-bubble left">Tengo una duda de un problema tipo UNI.</div>
                <div class="nostrachat-index-bubble right">Ordénala por curso y tema para que la comunidad pueda ayudarte mejor.</div>
                <div class="nostrachat-index-bubble left">¿Los externos también podrán consultar?</div>
                <div class="nostrachat-index-bubble right">Sí, en una zona separada para orientación e informes.</div>
                <div class="nostrachat-index-mini">
                  <div class="nostrachat-index-mini-card"><strong>Alumnos</strong><span>Consultas académicas por curso y acompañamiento.</span></div>
                  <div class="nostrachat-index-mini-card"><strong>Externos</strong><span>Orientación sobre ciclos, horarios y preparación UNI.</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    var about = document.getElementById('about-sec');
    if (about && about.parentNode) {
      about.insertAdjacentElement('afterend', section);
    } else {
      var course = document.getElementById('course-sec');
      if (course && course.parentNode) course.insertAdjacentElement('beforebegin', section);
      else document.body.appendChild(section);
    }

    bindToggle(section);
  }

  function run() {
    injectStyles();
    createSection();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
