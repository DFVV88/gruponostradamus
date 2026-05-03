/* ==================================================
   DAMUS v3.2
   Bot comercial persistente para NostraCHAT Externos.
   Corrige detección de IEN dentro de palabras como “tienen”.
================================================== */
(function () {
  var WA_NUMBER = '51993750351';
  var botInjected = false;
  var lastRoomTitle = '';
  var lastBotInput = '';
  var lastBotAt = 0;
  var firebaseReady = null;
  var db = null;
  var fsApi = null;

  var roomIdMap = {
    'general': 'externos-general',
    'informes': 'externos-informes',
    'orientación uni': 'externos-orientacion-uni',
    'orientacion uni': 'externos-orientacion-uni'
  };

  var KB = {
    marca: 'Grupo de Estudio Nostradamus',
    enfoque: 'preparación académica para postulantes a la UNI con acompañamiento, teoría, práctica y evaluación',
    sede: 'Av. Gerardo Unger 193, San Martín de Porres',
    horarios: 'Tenemos tres modalidades de horario: Full, Mañana y Tarde. La disponibilidad puede variar según ciclo y vacantes.',
    horarioFull: 'Horario Full: modalidad más completa, pensada para estudiantes que desean mayor carga académica y acompañamiento.',
    horarioManana: 'Horario Mañana: alternativa para estudiantes que desean estudiar principalmente en la primera parte del día.',
    horarioTarde: 'Horario Tarde: alternativa para estudiantes que tienen disponibilidad después del mediodía o desean complementar otras actividades.',
    plataforma: 'La plataforma institucional de trabajo es Microsoft 365. Desde allí se organiza el acceso a recursos, clases y herramientas académicas según corresponda.',
    aulas: 'Cada aula tiene cupos controlados para mantener orden y acompañamiento académico.',
    evaluacion: 'Se realizan evaluaciones y simulacros tipo examen de admisión UNI para medir el avance del estudiante.',
    humanidades: 'Humanidades se trabaja como seminarios o sesiones programadas según el ciclo.',
    cursos: 'Matemática, Ciencias, Aptitud Académica y Humanidades, según el ciclo elegido.',
    ciclos: {
      anual: 'Ciclo Anual UNI: ruta amplia para construir base, avanzar por etapas y sostener una preparación completa hacia la UNI.',
      semianual: 'Ciclo Semianual UNI: preparación intensiva y ordenada para alumnos que necesitan avanzar con mayor ritmo hacia la UNI.',
      semestral: 'Ciclo Semestral UNI: alternativa concentrada para reforzar teoría, práctica y evaluación en menos tiempo.',
      verano: 'Ciclo Verano UNI: preparación de temporada enfocada en avanzar, reforzar base y mantener ritmo académico durante el verano.',
      repaso: 'Repaso UNI: ciclo orientado a reforzar, practicar y consolidar contenidos clave antes de una etapa evaluativa o examen.',
      sabatino: 'Ciclos Sabatinos UNI: opción para estudiantes que necesitan prepararse principalmente los sábados, ideal para complementar estudios o actividades de lunes a viernes.',
      ien: 'Ciclo IEN: ruta especializada para estudiantes que buscan preparación enfocada según su objetivo académico.',
      cepre: 'Paralelo CEPRE UNI: acompañamiento pensado para alumnos que llevan o desean complementar su preparación tipo CEPRE UNI.',
      modulos: 'Módulos: programa enfocado en desarrollo de preguntas, refuerzo y práctica por áreas. Se trabaja especialmente Matemáticas, Ciencias y Aptitud Académica según la programación.'
    }
  };

  function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function encodeWA(text) { return encodeURIComponent(text); }
  function hasWord(text, word) {
    return new RegExp('(^|[^a-záéíóúñ0-9])' + word + '([^a-záéíóúñ0-9]|$)', 'i').test(text);
  }
  function currentRoomText() {
    var title = document.getElementById('nchat-room-title-main');
    return cleanText(title ? title.textContent : '');
  }
  function isExternalRoom() { return currentRoomText().toLowerCase().indexOf('externos') !== -1; }
  function roomLabel() {
    var text = currentRoomText();
    if (text.indexOf('·') !== -1) {
      var parts = text.split('·').map(cleanText);
      return parts[2] || 'General';
    }
    return 'General';
  }
  function currentRoomId() {
    var activeRoom = document.querySelector('.nchat-room.active');
    if (activeRoom && activeRoom.dataset && activeRoom.dataset.roomId) return activeRoom.dataset.roomId;
    var key = roomLabel().toLowerCase();
    return roomIdMap[key] || 'externos-general';
  }
  function userName() {
    var input = document.getElementById('nchat-name');
    return cleanText(input ? input.value : '') || 'Postulante';
  }
  function userExtra() {
    var input = document.getElementById('nchat-extra');
    return cleanText(input ? input.value : '');
  }

  function leadMessage(intent) {
    var sala = roomLabel();
    var nombre = userName();
    var dato = userExtra();
    var base = 'Hola Nostradamus, vengo desde NostraCHAT.\n\n' +
      'Nombre: ' + nombre + '\n' +
      (dato ? 'Dato/WhatsApp: ' + dato + '\n' : '') +
      'Sala: Externos - ' + sala + '\n' +
      'Interés: ' + intent + '\n\n' +
      'Quiero recibir orientación para una posible matrícula.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeWA(base);
  }

  function getFirebase() {
    if (firebaseReady) return firebaseReady;
    firebaseReady = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function (mods) {
      var appMod = mods[0];
      fsApi = mods[1];
      var apps = appMod.getApps();
      var app = apps.length ? apps[0] : appMod.initializeApp(window.NOSTRACHAT_FIREBASE_CONFIG);
      db = fsApi.getFirestore(app);
      return { fs: fsApi, db: db };
    });
    return firebaseReady;
  }

  function injectStyles() {
    if (document.getElementById('damus-style')) return;
    var style = document.createElement('style');
    style.id = 'damus-style';
    style.textContent = `
      .nchat-leadbot{display:none;margin:14px 15px 0;padding:15px;border-radius:20px;background:linear-gradient(135deg,#fff7e6,#f3fdff);border:1px solid rgba(255,148,30,.28);box-shadow:0 12px 30px rgba(6,20,38,.08);}
      .nchat-leadbot.show{display:block;}
      .nchat-leadbot-head{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;}
      .nchat-leadbot-avatar{width:38px;height:38px;border-radius:14px;background:linear-gradient(135deg,#ff941e,#078c95);display:grid;place-items:center;color:#fff;font-size:20px;flex:0 0 auto;}
      .nchat-leadbot-title{font-weight:950;color:#061426;line-height:1.1;}
      .nchat-leadbot-text{font-size:13px;color:#506176;line-height:1.45;margin-top:4px;}
      .nchat-leadbot-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;}
      .nchat-leadbot-btn{border:0;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:950;cursor:pointer;text-decoration:none!important;display:inline-flex;align-items:center;gap:6px;}
      .nchat-leadbot-btn.primary{background:linear-gradient(135deg,#25d366,#078c95);color:#fff!important;}
      .nchat-leadbot-btn.secondary{background:#fff;color:#061426!important;border:1px solid rgba(7,140,149,.18);}
      @media(max-width:700px){.nchat-leadbot-actions{flex-direction:column}.nchat-leadbot-btn{justify-content:center;width:100%;}}
    `;
    document.head.appendChild(style);
  }

  function botHTML() {
    return `
      <div class="nchat-leadbot" id="nchat-leadbot">
        <div class="nchat-leadbot-head">
          <div class="nchat-leadbot-avatar">🤖</div>
          <div>
            <div class="nchat-leadbot-title">DAMUS · Asistente de matrícula</div>
            <div class="nchat-leadbot-text" id="nchat-leadbot-text">Escribe tu consulta. DAMUS responderá usando la información institucional de Nostradamus y, si corresponde, te derivará a WhatsApp.</div>
          </div>
        </div>
        <div class="nchat-leadbot-actions">
          <a class="nchat-leadbot-btn primary" id="nchat-leadbot-wa-matricula" target="_blank" rel="noopener">📲 Quiero matricularme</a>
          <a class="nchat-leadbot-btn secondary" id="nchat-leadbot-wa-ciclos" target="_blank" rel="noopener">📚 Ver ciclos</a>
          <a class="nchat-leadbot-btn secondary" id="nchat-leadbot-wa-orientacion" target="_blank" rel="noopener">🎯 Necesito orientación</a>
        </div>
      </div>`;
  }

  function ensureBotBox() {
    if (botInjected) return;
    var composer = document.querySelector('.nchat-composer');
    if (!composer || !composer.parentNode) return;
    composer.insertAdjacentHTML('beforebegin', botHTML());
    botInjected = true;
  }

  function updateBotBox() {
    ensureBotBox();
    var box = document.getElementById('nchat-leadbot');
    if (!box) return;
    if (!isExternalRoom()) { box.classList.remove('show'); return; }

    var sala = roomLabel();
    var text = document.getElementById('nchat-leadbot-text');
    if (text) {
      if (/informes/i.test(sala)) text.textContent = 'DAMUS está atento a tus dudas sobre ciclos, horarios Full/Mañana/Tarde, vacantes, costos, Microsoft 365 y matrícula.';
      else if (/orientaci/i.test(sala)) text.textContent = 'Cuéntale a DAMUS tu nivel, carrera objetivo y tiempo disponible. Te dará una primera orientación.';
      else text.textContent = 'DAMUS puede orientarte sobre ciclos, módulos, horarios Full/Mañana/Tarde, cursos, Microsoft 365, simulacros, sede y matrícula.';
    }
    var a1 = document.getElementById('nchat-leadbot-wa-matricula');
    var a2 = document.getElementById('nchat-leadbot-wa-ciclos');
    var a3 = document.getElementById('nchat-leadbot-wa-orientacion');
    if (a1) a1.href = leadMessage('Deseo matricularme');
    if (a2) a2.href = leadMessage('Quiero información de ciclos, horarios y costos');
    if (a3) a3.href = leadMessage('Necesito orientación para elegir mi preparación UNI');
    box.classList.add('show');
  }

  function cycleText(t) {
    if (/verano/.test(t)) return KB.ciclos.verano;
    if (/repaso/.test(t)) return KB.ciclos.repaso;
    if (/sabatino|sabado|sábado/.test(t)) return KB.ciclos.sabatino;
    if (/anual/.test(t)) return KB.ciclos.anual;
    if (/semianual/.test(t)) return KB.ciclos.semianual;
    if (/semestral/.test(t)) return KB.ciclos.semestral;
    if (/cepre|paralelo/.test(t)) return KB.ciclos.cepre;
    if (hasWord(t, 'ien')) return KB.ciclos.ien;
    if (/módulo|modulo|modulos|módulos|nostramod|nostra mód/.test(t)) return KB.ciclos.modulos;
    return 'En Nostradamus se manejan varias rutas de preparación: Anual UNI, Semianual UNI, Semestral UNI, Verano UNI, Repaso UNI, Sabatinos UNI, Ciclo IEN, Paralelo CEPRE UNI y Módulos. La mejor opción depende de tu nivel, tiempo disponible y objetivo.';
  }

  function buildReply(userText) {
    var t = cleanText(userText).toLowerCase();
    var sala = roomLabel().toLowerCase();

    if (/full/.test(t)) return { intent: 'Quiero información de horario Full', text: KB.horarioFull + ' Para confirmar el horario exacto, ciclo disponible y vacantes, continúa por WhatsApp con un asesor.' };
    if (/mañana|manana/.test(t)) return { intent: 'Quiero información de horario Mañana', text: KB.horarioManana + ' Para confirmar el horario exacto, ciclo disponible y vacantes, continúa por WhatsApp con un asesor.' };
    if (/tarde/.test(t)) return { intent: 'Quiero información de horario Tarde', text: KB.horarioTarde + ' Para confirmar el horario exacto, ciclo disponible y vacantes, continúa por WhatsApp con un asesor.' };
    if (/horario|horarios|turno|turnos|noche|dias|días|domingo|lunes|clases/.test(t)) return { intent: 'Quiero información de horarios', text: KB.horarios + ' Puedes elegir entre Full, Mañana o Tarde según tu disponibilidad. Para confirmar horarios exactos, ciclo activo y vacantes, lo recomendable es continuar por WhatsApp.' };

    if (/hola|buenas|info|informes|informacion|información/.test(t) || /informes/.test(sala)) return { intent: 'Solicito informes generales', text: '¡Hola! Soy DAMUS, asistente de matrícula de Nostradamus. ' + KB.marca + ' se enfoca en ' + KB.enfoque + '. Puedo orientarte sobre ciclos, módulos, horarios Full/Mañana/Tarde, sede, Microsoft 365, simulacros y matrícula.' };
    if (/ciclo|anual|semianual|semestral|verano|repaso|sabatino|sábado|sabado|cepre|módulo|modulo|módulos|modulos|nostram/.test(t) || hasWord(t, 'ien')) return { intent: 'Quiero información de ciclos y módulos', text: cycleText(t) + ' Para elegir bien, dime tu nivel actual, carrera objetivo y cuándo planeas postular.' };
    if (/fenix|fénix|drakon|dragón|dragon/.test(t)) return { intent: 'Quiero información de módulos', text: 'Actualmente ya no usamos esos nombres. Ahora los llamamos simplemente Módulos. ' + KB.ciclos.modulos };
    if (/curso|matem|fisic|físic|quim|quím|aptitud|humanidades|letras|ciencias/.test(t)) return { intent: 'Quiero información de cursos', text: 'Se trabajan cursos de ' + KB.cursos + ' En los Módulos se refuerza la práctica y resolución por áreas según la programación vigente.' };
    if (/microsoft|365|teams|plataforma|virtual|clases en vivo|recurso|grabaci|grabado|video/.test(t)) return { intent: 'Quiero información de plataforma Microsoft 365', text: KB.plataforma + ' Para detalles de acceso, clases o recursos disponibles, un asesor puede orientarte por WhatsApp.' };
    if (/simulacro|examen|evaluaci|prueba/.test(t)) return { intent: 'Quiero información de simulacros', text: KB.evaluacion + ' Esto ayuda a que el alumno mida su avance y se acostumbre al estilo de evaluación UNI.' };
    if (/sede|direccion|dirección|local|ubicacion|ubicación|smp|san martin|san martín/.test(t)) return { intent: 'Quiero información de sede', text: 'La sede indicada es: ' + KB.sede + '. Para recibir indicaciones o consultar atención, puedes continuar por WhatsApp.' };
    if (/aula|cupos|cupo|vacante|vacantes|cantidad/.test(t)) return { intent: 'Quiero consultar vacantes', text: KB.aulas + ' Como los cupos son limitados, lo mejor es confirmar vacante disponible por WhatsApp.' };
    if (/matric|inscrib|separar|reservar|pagar|pago|precio|costo|cuanto|cuánto|mensualidad|promocion|promoción|descuento/.test(t)) return { intent: 'Deseo información de matrícula y costos', text: 'Puedo ayudarte con una posible matrícula. Los costos y vacantes pueden variar según ciclo, horario y disponibilidad. Continúa por WhatsApp para que un asesor confirme monto, requisitos, cupo y horario.' };
    if (/orient|no sé|no se|recomienda|recomiendan|empezar|desde cero|base|nivel|academia|uni|ingenier|postular|admision|admisión/.test(t) || /orient/.test(sala)) return { intent: 'Necesito orientación académica', text: 'Para orientarte, dime: 1) carrera objetivo, 2) nivel actual en Matemática/Física/Química, 3) si estás en colegio o egresado, 4) cuándo planeas postular. Con eso se puede sugerir un ciclo, módulo o ruta de preparación.' };
    return { intent: 'Consulta general desde NostraCHAT', text: 'Gracias por escribir. DAMUS puede orientarte sobre Anual, Semianual, Semestral, Verano UNI, Repaso UNI, Sabatinos, Paralelo CEPRE UNI, IEN, Módulos, horarios Full/Mañana/Tarde, cursos, Microsoft 365, simulacros, sede y matrícula. ¿Sobre cuál de esos puntos deseas información?' };
  }

  function saveBotReply(reply) {
    if (!isExternalRoom()) return;
    var roomId = currentRoomId();
    var room = roomLabel();
    getFirebase().then(function (api) {
      return api.fs.addDoc(api.fs.collection(api.db, 'rooms/' + roomId + '/messages'), {
        text: reply.text,
        name: 'DAMUS',
        extra: 'Asistente virtual de matrícula',
        zone: 'externos',
        roomId: roomId,
        roomLabel: room,
        sessionId: 'damus-bot',
        type: 'message',
        moderationStatus: 'visible',
        createdAt: api.fs.serverTimestamp()
      });
    }).catch(function (err) {
      console.error('DAMUS no pudo guardar respuesta:', err);
    });
  }

  function maybeBotReply(userText) {
    if (!isExternalRoom()) return;
    var text = cleanText(userText);
    if (!text) return;
    var now = Date.now();
    var normalized = text.toLowerCase();
    if (normalized === lastBotInput && now - lastBotAt < 8000) return;
    if (now - lastBotAt < 1800) return;
    lastBotInput = normalized;
    lastBotAt = now;
    var reply = buildReply(text);
    setTimeout(function () { saveBotReply(reply); }, 1000);
  }

  function hookSend() {
    document.addEventListener('click', function (e) {
      var send = e.target && e.target.closest ? e.target.closest('#nchat-send') : null;
      if (!send) return;
      var input = document.getElementById('nchat-message');
      maybeBotReply(input ? input.value : '');
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey) return;
      var input = e.target && e.target.id === 'nchat-message' ? e.target : null;
      if (!input) return;
      maybeBotReply(input.value);
    }, true);
  }

  function run() {
    injectStyles();
    updateBotBox();
    if (currentRoomText() !== lastRoomTitle) { lastRoomTitle = currentRoomText(); updateBotBox(); }
  }

  function init() { hookSend(); run(); setInterval(run, 900); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
