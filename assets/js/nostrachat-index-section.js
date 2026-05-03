/* ==================================================
   Grupo Nostradamus - Sección NostraCHAT en index
================================================== */
(function () {
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
        padding:86px 0;
        background:
          radial-gradient(circle at 12% 15%, rgba(0,194,209,.22), transparent 32%),
          radial-gradient(circle at 88% 80%, rgba(255,148,30,.20), transparent 34%),
          linear-gradient(135deg,#02070d 0%,#061426 56%,#07333b 100%);
        color:#fff;
        font-family:'Jost',Arial,sans-serif;
      }
      #nostrachat-index-section:before{
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(90deg,rgba(255,255,255,.04),transparent 40%,rgba(255,255,255,.03));
        pointer-events:none;
      }
      .nostrachat-index-wrap{
        width:min(1180px,92%);
        margin:auto;
        position:relative;
        z-index:2;
        display:grid;
        grid-template-columns:1.02fr .98fr;
        gap:34px;
        align-items:center;
      }
      .nostrachat-index-kicker{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:9px 15px;
        border-radius:999px;
        background:rgba(255,255,255,.10);
        border:1px solid rgba(255,255,255,.24);
        color:#fff;
        font-weight:950;
        text-transform:uppercase;
        letter-spacing:.5px;
        margin-bottom:16px;
      }
      .nostrachat-index-content h2{
        color:#fff !important;
        font-family:'Baloo 2','Jost',Arial,sans-serif;
        font-size:clamp(38px,5.4vw,72px);
        line-height:.96;
        margin:0 0 18px;
        text-transform:uppercase;
      }
      .nostrachat-index-content h2 span{color:#ffcf75;display:block;}
      .nostrachat-index-content p{
        color:rgba(255,255,255,.86);
        font-size:20px;
        line-height:1.65;
        margin:0 0 22px;
      }
      .nostrachat-index-features{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin:26px 0;
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
      .nostrachat-index-actions{
        display:flex;
        gap:13px;
        flex-wrap:wrap;
        align-items:center;
      }
      .nostrachat-index-btn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:9px;
        min-height:52px;
        padding:14px 22px;
        border-radius:999px;
        color:#fff !important;
        font-weight:950;
        text-transform:uppercase;
        text-decoration:none !important;
        transition:.2s ease;
      }
      .nostrachat-index-btn:hover{transform:translateY(-2px);}
      .nostrachat-index-btn.primary{
        background:linear-gradient(135deg,#ff941e,#078c95,#061426);
        box-shadow:0 16px 38px rgba(255,148,30,.28);
      }
      .nostrachat-index-btn.secondary{
        background:#fff;
        color:#061426 !important;
      }
      .nostrachat-index-panel{
        position:relative;
        padding:24px;
        border-radius:32px;
        background:rgba(255,255,255,.10);
        border:1px solid rgba(255,255,255,.22);
        box-shadow:0 26px 80px rgba(0,0,0,.26);
        backdrop-filter:blur(12px);
      }
      .nostrachat-index-chathead{
        display:flex;
        align-items:center;
        gap:13px;
        padding:13px;
        border-radius:20px;
        background:rgba(255,255,255,.12);
        margin-bottom:16px;
      }
      .nostrachat-index-avatar{
        width:54px;
        height:54px;
        border-radius:18px;
        display:grid;
        place-items:center;
        font-size:26px;
        background:linear-gradient(135deg,#f5c542,#ff941e);
      }
      .nostrachat-index-chathead strong{display:block;color:#fff;font-size:19px;line-height:1.1;}
      .nostrachat-index-chathead span{display:block;color:rgba(255,255,255,.74);font-size:14px;margin-top:3px;}
      .nostrachat-index-bubble{
        max-width:88%;
        padding:12px 14px;
        border-radius:18px;
        margin:10px 0;
        font-weight:800;
        line-height:1.43;
        font-size:15px;
      }
      .nostrachat-index-bubble.left{
        background:#fff;
        color:#26384a;
        border-bottom-left-radius:5px;
      }
      .nostrachat-index-bubble.right{
        margin-left:auto;
        background:linear-gradient(135deg,#078c95,#00c2d1);
        color:#fff;
        border-bottom-right-radius:5px;
      }
      .nostrachat-index-mini{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:18px;
      }
      .nostrachat-index-mini-card{
        border-radius:18px;
        padding:15px;
        background:rgba(255,255,255,.10);
        border:1px solid rgba(255,255,255,.14);
      }
      .nostrachat-index-mini-card strong{display:block;color:#ffcf75;font-size:16px;margin-bottom:5px;}
      .nostrachat-index-mini-card span{display:block;color:rgba(255,255,255,.82);font-size:14px;line-height:1.35;}
      @media(max-width:991px){
        #nostrachat-index-section{padding:62px 0;}
        .nostrachat-index-wrap{grid-template-columns:1fr;}
        .nostrachat-index-features,.nostrachat-index-mini{grid-template-columns:1fr;}
        .nostrachat-index-actions{flex-direction:column;align-items:stretch;}
        .nostrachat-index-btn{width:100%;}
      }
    `;
    document.head.appendChild(style);
  }

  function createSection() {
    var section = document.createElement('section');
    section.id = 'nostrachat-index-section';
    section.innerHTML = `
      <div class="nostrachat-index-wrap">
        <div class="nostrachat-index-content">
          <div class="nostrachat-index-kicker">💬 Nueva comunidad académica</div>
          <h2>NostraCHAT <span>para alumnos y postulantes</span></h2>
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
    `;

    var about = document.getElementById('about-sec');
    if (about && about.parentNode) {
      about.insertAdjacentElement('afterend', section);
      return;
    }

    var course = document.getElementById('course-sec');
    if (course && course.parentNode) {
      course.insertAdjacentElement('beforebegin', section);
      return;
    }

    document.body.appendChild(section);
  }

  function run() {
    injectStyles();
    createSection();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
