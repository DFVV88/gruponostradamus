/* Grupo Nostradamus - Panel lateral para todos los ciclos */
(function () {
  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  var cycles = {
    'ciclo-anual-uni.html': { name: 'Nostra 360 UNI', tag: 'Preparación integral. Formación completa.', icon: '🌐', badge: 'Ruta premium UNI' },
    'ciclo-semianual-uni.html': { name: 'Nostra Power UNI', tag: 'Corrige tus errores. Potencia tu nivel.', icon: '⚡', badge: 'Ruta premium UNI' },
    'ciclo-semestral-uni.html': { name: 'Nostra Élite UNI', tag: 'Estuviste cerca. Ahora ve por tu vacante.', icon: '🎯', badge: 'Ruta premium UNI' },
    'ciclo-repaso-uni.html': { name: 'Nostra Prime UNI', tag: 'Tu máximo nivel. Tu momento decisivo.', icon: '🚀', badge: 'Ruta premium UNI' },
    'ciclo-elite-uni.html': { name: 'Nostra Talentum UNI', tag: 'Talento superior. Exigencia máxima.', icon: '🏆', badge: 'Ruta premium UNI' },
    'ciclo-ien.html': { name: 'Ciclo IEN', tag: 'Preparación académica enfocada, práctica y progresiva.', icon: '📘', badge: 'Programa especializado' },
    'ciclo-proyecto-escolar.html': { name: 'Proyecto Escolar', tag: 'Refuerzo, nivelación y acompañamiento académico escolar.', icon: '🎒', badge: 'Programa escolar' },
    'ciclo-paralelo-cepre-uni.html': { name: 'Paralelo CEPRE UNI', tag: 'Acompañamiento estratégico para estudiantes de CEPRE UNI.', icon: '🏛️', badge: 'Programa paralelo UNI' },
    'ciclo-verano-uni.html': { name: 'Ciclo Verano UNI', tag: 'Avanza en vacaciones con base, práctica y método.', icon: '☀️', badge: 'Programa de verano' }
  };

  var data = cycles[file];
  if (!data) return;

  var WHATSAPP = 'https://wa.me/51993750351?text=' + encodeURIComponent('Hola Nostradamus, quiero informes sobre ' + data.name + '.');
  var PREINSCRIPCION = 'https://gruponostradamus.edu.pe/preinscripcion.html';
  var CLASES = 'https://gruponostradamus.edu.pe/clases-en-vivo.html';
  var MAPA_UNI = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15609.098250165553!2d-77.04858391073591!3d-12.02460935322607!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf05f8bcc23b%3A0xa4969aade22a3db5!2sGRUPO%20NOSTRADAMUS%20UNI!5e0!3m2!1ses-419!2spe!4v1720420344476!5m2!1ses-419!2spe';

  function addStyle() {
    if (document.getElementById('nostra-cycle-sidebar-premium-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cycle-sidebar-premium-style';
    style.textContent = `
      .nostra-cycle-panel{position:sticky;top:105px;border-radius:28px;overflow:hidden;background:radial-gradient(circle at 12% 12%,rgba(0,229,255,.18),transparent 34%),linear-gradient(155deg,#02070d 0%,#061426 46%,#063a48 100%);border:1px solid rgba(168,247,255,.24);box-shadow:0 28px 70px rgba(0,0,0,.18),0 0 34px rgba(0,194,209,.12);color:#fff;padding:24px;}
      .nostra-cycle-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.06),transparent 38%,rgba(255,181,57,.08));pointer-events:none;}
      .nostra-cycle-panel>*{position:relative;z-index:2;}
      .nostra-cycle-panel__badge{display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(168,247,255,.26);color:#a8f7ff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:.5px;}
      .nostra-cycle-panel__title{margin:16px 0 6px;color:#fff;font-size:27px;line-height:1.05;font-weight:950;}
      .nostra-cycle-panel__tag{margin:0 0 18px;color:rgba(255,255,255,.78);line-height:1.45;font-weight:700;}
      .nostra-cycle-panel__btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:52px;border-radius:16px;margin-top:10px;color:#fff!important;text-decoration:none!important;font-weight:950;letter-spacing:.2px;box-shadow:0 16px 32px rgba(0,0,0,.18);transition:transform .22s ease,box-shadow .22s ease,filter .22s ease;}
      .nostra-cycle-panel__btn:hover{transform:translateY(-3px);box-shadow:0 22px 42px rgba(0,0,0,.26);filter:brightness(1.05);}
      .nostra-cycle-panel__btn--wa{background:linear-gradient(135deg,#16c763,#079b4d);}
      .nostra-cycle-panel__btn--pre{background:linear-gradient(135deg,#ffb539,#ff7a18);color:#061426!important;}
      .nostra-cycle-panel__btn--live{background:linear-gradient(135deg,#00c2d1,#1749e8);}
      .nostra-cycle-panel__trust{display:grid;grid-template-columns:1fr;gap:9px;margin:18px 0 20px;}
      .nostra-cycle-panel__trust span{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.86);font-weight:750;font-size:14px;}
      .nostra-cycle-map{margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.13);}
      .nostra-cycle-map h4{margin:0 0 8px;color:#fff;font-size:18px;font-weight:950;}
      .nostra-cycle-map p{margin:0 0 12px;color:rgba(255,255,255,.72);font-size:14px;line-height:1.45;}
      .nostra-cycle-map iframe{width:100%!important;height:210px!important;border:0!important;border-radius:18px;filter:saturate(1.08) contrast(1.03);}
      .nostra-cycle-side-note{margin-top:13px;color:#a8f7ff;font-weight:850;font-size:13px;text-align:center;}
      @media(max-width:991px){.nostra-cycle-panel{position:relative;top:auto;margin-top:28px;}}
    `;
    document.head.appendChild(style);
  }

  function buildPanel() {
    addStyle();
    var sidebar = document.querySelector('.sidebar-area');
    if (!sidebar || sidebar.getAttribute('data-nostra-cycle-panel') === '1') return;
    sidebar.setAttribute('data-nostra-cycle-panel', '1');
    sidebar.innerHTML = `
      <div class="nostra-cycle-panel">
        <span class="nostra-cycle-panel__badge">${data.icon} ${data.badge}</span>
        <h3 class="nostra-cycle-panel__title">${data.name}</h3>
        <p class="nostra-cycle-panel__tag">${data.tag}</p>
        <a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--wa" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">💬 Solicitar informes</a>
        <a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--pre" href="${PREINSCRIPCION}">📝 Preinscribirme ahora</a>
        <a class="nostra-cycle-panel__btn nostra-cycle-panel__btn--live" href="${CLASES}">🔴 Clases en vivo</a>
        <div class="nostra-cycle-panel__trust">
          <span>✅ Cupos limitados</span>
          <span>✅ Seguimiento académico</span>
          <span>✅ Evaluaciones y práctica constante</span>
          <span>✅ Plana docente especialista</span>
        </div>
        <div class="nostra-cycle-map">
          <h4>📍 Sede UNI</h4>
          <p>Ubícanos cerca de la Universidad Nacional de Ingeniería.</p>
          <iframe src="${MAPA_UNI}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="nostra-cycle-side-note">Atención rápida por WhatsApp</div>
      </div>
    `;
  }

  function start() {
    buildPanel();
    setTimeout(buildPanel, 500);
    setTimeout(buildPanel, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', start);
})();