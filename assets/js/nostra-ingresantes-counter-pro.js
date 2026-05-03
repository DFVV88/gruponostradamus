/* ==================================================
   Grupo Nostradamus - Bloque ingresantes PRO en index
   Da más vida a la sección “Más de 3000+ alumnos...”
   y convierte el 3000+ en contador dinámico.
================================================== */
(function () {
  var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isIndex = file === 'index.html' || file === '' || window.location.pathname === '/';
  if (!isIndex) return;

  function injectStyles() {
    var old = document.getElementById('nostra-ingresantes-counter-pro-style');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'nostra-ingresantes-counter-pro-style';
    style.textContent = `
      body .nostra-ingresantes-pro{
        position:relative !important;
        isolation:isolate !important;
        min-height:560px !important;
        display:flex !important;
        align-items:center !important;
        overflow:hidden !important;
        background-position:center !important;
        background-size:cover !important;
      }

      body .nostra-ingresantes-pro::before{
        content:'' !important;
        position:absolute !important;
        inset:0 !important;
        z-index:0 !important;
        background:
          radial-gradient(circle at 23% 35%, rgba(0,194,209,.28), transparent 24%),
          radial-gradient(circle at 78% 72%, rgba(255,255,255,.20), transparent 26%),
          linear-gradient(90deg, rgba(255,255,255,.88) 0%, rgba(232,244,247,.74) 40%, rgba(6,20,38,.32) 100%) !important;
        pointer-events:none !important;
      }

      body .nostra-ingresantes-pro::after{
        content:'' !important;
        position:absolute !important;
        right:-12% !important;
        top:-10% !important;
        width:48% !important;
        height:130% !important;
        z-index:1 !important;
        background:linear-gradient(135deg, rgba(255,255,255,.18), rgba(0,139,150,.14), rgba(6,20,38,.20)) !important;
        transform:skewX(-18deg) !important;
        filter:blur(.2px) !important;
        pointer-events:none !important;
      }

      body .nostra-ingresantes-pro .container,
      body .nostra-ingresantes-pro .row,
      body .nostra-ingresantes-pro [class*='col-']{
        position:relative !important;
        z-index:3 !important;
      }

      body .nostra-ingresantes-card{
        position:relative !important;
        max-width:790px !important;
        padding:34px 36px !important;
        border-radius:30px !important;
        background:linear-gradient(135deg, rgba(255,255,255,.70), rgba(255,255,255,.38)) !important;
        border:1px solid rgba(255,255,255,.55) !important;
        box-shadow:0 26px 70px rgba(6,20,38,.16), 0 0 36px rgba(0,194,209,.14) !important;
        backdrop-filter:blur(10px) !important;
        overflow:hidden !important;
      }

      body .nostra-ingresantes-card::before{
        content:'' !important;
        position:absolute !important;
        left:0 !important;
        top:0 !important;
        width:7px !important;
        height:100% !important;
        background:linear-gradient(180deg,#00c2d1,#008b96,#061426) !important;
        box-shadow:0 0 24px rgba(0,194,209,.45) !important;
      }

      body .nostra-ingresantes-badge{
        display:inline-flex !important;
        align-items:center !important;
        gap:9px !important;
        margin-bottom:14px !important;
        padding:9px 14px !important;
        border-radius:999px !important;
        background:rgba(0,139,150,.10) !important;
        border:1px solid rgba(0,139,150,.24) !important;
        color:#008b96 !important;
        font-size:15px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        letter-spacing:.75px !important;
      }

      body .nostra-ingresantes-title{
        margin:0 !important;
        color:#061426 !important;
        font-size:clamp(42px,5.7vw,92px) !important;
        line-height:.98 !important;
        font-weight:950 !important;
        font-style:italic !important;
        text-transform:uppercase !important;
        letter-spacing:-1.6px !important;
        text-shadow:0 3px 0 rgba(255,255,255,.62), 0 14px 28px rgba(6,20,38,.17) !important;
      }

      body .nostra-ingresantes-number-wrap{
        display:inline-flex !important;
        align-items:baseline !important;
        gap:4px !important;
        margin:0 8px !important;
        padding:0 10px !important;
        border-radius:18px !important;
        color:#00c2d1 !important;
        background:linear-gradient(180deg,#0af1ff 0%,#00a9b8 42%,#03535c 100%) !important;
        -webkit-background-clip:text !important;
        background-clip:text !important;
        -webkit-text-fill-color:transparent !important;
        filter:drop-shadow(0 0 14px rgba(0,194,209,.48)) drop-shadow(0 4px 6px rgba(0,0,0,.28)) !important;
      }

      body .nostra-ingresantes-counter,
      body .nostra-ingresantes-plus{
        color:#00c2d1 !important;
        -webkit-text-fill-color:transparent !important;
      }

      body .nostra-ingresantes-copy{
        max-width:650px !important;
        margin:18px 0 0 !important;
        color:#334456 !important;
        font-size:clamp(16px,1.4vw,20px) !important;
        line-height:1.55 !important;
        font-weight:750 !important;
      }

      body .nostra-ingresantes-stats{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:12px !important;
        margin-top:24px !important;
      }

      body .nostra-ingresantes-stat{
        padding:14px 13px !important;
        border-radius:18px !important;
        background:rgba(255,255,255,.74) !important;
        border:1px solid rgba(0,139,150,.16) !important;
        box-shadow:0 10px 24px rgba(6,20,38,.07) !important;
      }

      body .nostra-ingresantes-stat strong{
        display:block !important;
        color:#008b96 !important;
        font-size:20px !important;
        font-weight:950 !important;
        line-height:1 !important;
      }

      body .nostra-ingresantes-stat span{
        display:block !important;
        margin-top:6px !important;
        color:#061426 !important;
        font-size:12.5px !important;
        font-weight:850 !important;
        line-height:1.22 !important;
        text-transform:uppercase !important;
      }

      body .nostra-ingresantes-actions{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:12px !important;
        margin-top:26px !important;
      }

      body .nostra-ingresantes-btn{
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        min-height:52px !important;
        padding:14px 24px !important;
        border-radius:999px !important;
        background:linear-gradient(135deg,#008b96,#05313d 55%,#061426) !important;
        color:#fff !important;
        font-size:14px !important;
        font-weight:950 !important;
        text-transform:uppercase !important;
        text-decoration:none !important;
        box-shadow:0 16px 32px rgba(0,139,150,.24) !important;
      }

      body .nostra-ingresantes-btn:hover{
        color:#fff !important;
        transform:translateY(-2px) !important;
        box-shadow:0 22px 42px rgba(0,194,209,.30) !important;
      }

      body .nostra-ingresantes-btn--wa{
        background:linear-gradient(135deg,#25d366,#13a54d 52%,#061426) !important;
        box-shadow:0 16px 32px rgba(37,211,102,.24) !important;
      }

      body .nostra-ingresantes-spark{
        position:absolute !important;
        width:12px !important;
        height:12px !important;
        border-radius:50% !important;
        background:#00c2d1 !important;
        box-shadow:0 0 24px rgba(0,194,209,.85) !important;
        opacity:.85 !important;
        animation:nostraSparkFloat 5s ease-in-out infinite !important;
        z-index:2 !important;
      }

      body .nostra-ingresantes-spark.s1{left:8%;top:18%;animation-delay:.1s !important;}
      body .nostra-ingresantes-spark.s2{left:86%;top:28%;animation-delay:1.3s !important;}
      body .nostra-ingresantes-spark.s3{left:72%;top:78%;animation-delay:2.2s !important;}

      @keyframes nostraSparkFloat{
        0%,100%{transform:translateY(0) scale(1);opacity:.55;}
        50%{transform:translateY(-18px) scale(1.35);opacity:1;}
      }

      @media(max-width:991px){
        body .nostra-ingresantes-pro{min-height:520px !important;}
        body .nostra-ingresantes-card{padding:28px 24px !important;}
        body .nostra-ingresantes-stats{grid-template-columns:1fr !important;}
      }

      @media(max-width:575px){
        body .nostra-ingresantes-pro{min-height:auto !important;padding:58px 0 !important;}
        body .nostra-ingresantes-card{padding:24px 18px !important;border-radius:24px !important;}
        body .nostra-ingresantes-title{font-size:clamp(38px,13vw,58px) !important;}
        body .nostra-ingresantes-actions{display:grid !important;grid-template-columns:1fr !important;}
        body .nostra-ingresantes-btn{width:100% !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function findTargetSection() {
    var candidates = Array.from(document.querySelectorAll('section, div'));
    return candidates.find(function (el) {
      var txt = (el.textContent || '').replace(/\s+/g, ' ').toLowerCase();
      return txt.indexOf('más de') !== -1 && txt.indexOf('3000') !== -1 && txt.indexOf('ingreso') !== -1 && txt.indexOf('uni') !== -1;
    });
  }

  function buildContent() {
    return '' +
      '<span class="nostra-ingresantes-spark s1"></span>' +
      '<span class="nostra-ingresantes-spark s2"></span>' +
      '<span class="nostra-ingresantes-spark s3"></span>' +
      '<div class="container">' +
        '<div class="nostra-ingresantes-card">' +
          '<div class="nostra-ingresantes-badge">📘 Rumbo a las mejores universidades</div>' +
          '<h2 class="nostra-ingresantes-title">Más de <span class="nostra-ingresantes-number-wrap"><span class="nostra-ingresantes-counter" data-target="3000">0</span><span class="nostra-ingresantes-plus">+</span></span><br>alumnos lograron<br>su ingreso a la UNI</h2>' +
          '<p class="nostra-ingresantes-copy">Una comunidad de postulantes entrenados con método, disciplina, simulacros tipo admisión y acompañamiento académico constante.</p>' +
          '<div class="nostra-ingresantes-stats">' +
            '<div class="nostra-ingresantes-stat"><strong>16+</strong><span>Años de experiencia</span></div>' +
            '<div class="nostra-ingresantes-stat"><strong>UNI</strong><span>Preparación especializada</span></div>' +
            '<div class="nostra-ingresantes-stat"><strong>100%</strong><span>Enfoque en resultados</span></div>' +
          '</div>' +
          '<div class="nostra-ingresantes-actions">' +
            '<a class="nostra-ingresantes-btn nostra-ingresantes-btn--wa" target="_blank" rel="noopener" href="https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, quiero informes para prepararme e ingresar a la UNI.') + '">📲 Quiero informes</a>' +
            '<a class="nostra-ingresantes-btn" href="#course-sec">Ver ciclos académicos</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function animateCounter(counter) {
    if (!counter || counter.dataset.animated === '1') return;
    counter.dataset.animated = '1';
    var target = parseInt(counter.getAttribute('data-target') || '3000', 10);
    var duration = 1800;
    var start = performance.now();

    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(target * eased);
      counter.textContent = value.toLocaleString('es-PE');
      if (progress < 1) requestAnimationFrame(frame);
      else counter.textContent = target.toLocaleString('es-PE');
    }
    requestAnimationFrame(frame);
  }

  function setupCounter(section) {
    var counter = section.querySelector('.nostra-ingresantes-counter');
    if (!counter) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(counter);
            observer.disconnect();
          }
        });
      }, { threshold: 0.35 });
      observer.observe(section);
    } else {
      animateCounter(counter);
    }
  }

  function init() {
    injectStyles();
    var section = findTargetSection();
    if (!section || section.dataset.nostraIngresantesPro === '1') return;

    section.classList.add('nostra-ingresantes-pro');
    section.innerHTML = buildContent();
    section.dataset.nostraIngresantesPro = '1';
    setupCounter(section);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', function () {
    init();
    setTimeout(init, 800);
  });
})();
