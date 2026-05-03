/* ==================================================
   DAMUS v3.3
   Bot comercial persistente para NostraCHAT Externos.
   Respuestas más contundentes con base de index, ciclos, docentes,
   cachimbos, sede, noticias y contacto.
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
    trayectoria: '16 años preparando futuros ingenieros del Perú, con miles de alumnos entrenados, simulacros tipo admisión y acompañamiento académico real.',
    respaldo: 'La web destaca 2.5k+ egresados satisfechos, 109.5k+ clases completadas, 90%+ de satisfacción y 3.1k+ estudiantes satisfechos.',
    enfoque: 'preparación UNI con método, disciplina, teoría, práctica intensiva, evaluación constante y seguimiento académico.',
    sede: 'Av. Gerardo Unger 193, San Martín de Porres, cerca al entorno UNI.',
    contacto: 'WhatsApp 993 750 351 y correo informes@gruponostradamus.edu.pe.',
    costos: 'Los costos se confirman por WhatsApp porque dependen del ciclo, turno, vacante disponible y promociones vigentes. Lo más rápido es escribir al 993 750 351 para recibir monto, requisitos y forma de matrícula.',
    horarios: 'Tenemos modalidades Full, Mañana y Tarde. La disponibilidad depende del ciclo y de las vacantes activas.',
    horarioFull: 'Horario Full: modalidad de mayor carga académica. Está pensada para postulantes que quieren máxima exigencia, más horas de entrenamiento y acompañamiento más completo.',
    horarioManana: 'Horario Mañana: ideal para estudiantes que quieren concentrar su preparación en la primera parte del día. En la web se muestran referencias de 8:00 a. m. a 1:00 p. m. según ciclo.',
    horarioTarde: 'Horario Tarde: alternativa para quienes estudian o realizan otras actividades en la mañana y necesitan preparar UNI después del mediodía. Debe confirmarse según ciclo activo.',
    plataforma: 'La plataforma institucional es Microsoft 365. Se usa para organizar recursos, clases en vivo y herramientas académicas según la programación del ciclo.',
    docentes: 'La web resalta una plana docente especialista en UNI, con experiencia, dominio de materia, práctica constante, evaluaciones y acompañamiento.',
    cachimbos: 'La sección Cachimbos muestra los resultados e ingresantes como respaldo del trabajo académico y la exigencia del Grupo Nostradamus.',
    noticias: 'La sección Noticias sirve para publicar novedades, actividades, ciclos, comunicados y contenido académico relevante para postulantes.',
    aulas: 'Los cupos son controlados para mantener orden, interacción y acompañamiento. Por eso conviene separar vacante con anticipación.',
    evaluacion: 'La metodología incluye evaluaciones, simulacros tipo examen UNI, revisión de avance y práctica orientada a resultados.',
    beneficios: 'Beneficios clave: docentes especialistas en UNI, práctica intensiva, evaluaciones, simulacros, asesorías, material académico, acompañamiento y comunicación institucional.',
    humanidades: 'Humanidades se trabaja como seminarios o sesiones programadas según el ciclo.',
    cursos: 'Matemática, Ciencias, Aptitud Académica y Humanidades, según el ciclo elegido.',
    ciclos: {
      anual: 'Ciclo Anual UNI: formación completa desde cero hasta nivel admisión UNI. Es ideal si necesitas construir base sólida, avanzar por etapas y competir con mayor seguridad durante una preparación larga.',
      semianual: 'Ciclo Semianual UNI: entrenamiento intensivo para postulantes con base previa que desean elevar su rendimiento hacia la UNI en menos tiempo, con ritmo fuerte y práctica constante.',
      semestral: 'Ciclo Semestral UNI: preparación estratégica para avanzar con ritmo académico, reforzar teoría, practicar de forma constante y mantener enfoque en admisión UNI.',
      verano: 'Ciclo Verano UNI: preparación de temporada para aprovechar el verano, reforzar base, ganar ritmo y llegar mejor preparado al siguiente tramo académico.',
      repaso: 'Repaso UNI: ciclo para consolidar contenidos, practicar preguntas tipo examen y llegar con mayor seguridad a una etapa evaluativa o admisión.',
      sabatino: 'Ciclo Sabatino UNI: opción para estudiantes que necesitan prepararse principalmente los sábados porque estudian o trabajan de lunes a viernes.',
      ien: 'Ciclo IEN: ruta especializada para estudiantes que buscan preparación enfocada y necesitan una orientación más precisa según su objetivo académico.',
      cepre: 'Paralelo CEPRE UNI: acompañamiento para alumnos que llevan o desean complementar una preparación tipo CEPRE UNI, reforzando lo que necesitan para rendir mejor.',
      elite: 'Élite UNI: ruta de alta exigencia para alumnos que buscan un entrenamiento más competitivo y retador.',
      escolar: 'Proyecto Escolar: ruta para estudiantes de colegio que quieren construir base académica con anticipación y llegar mejor preparados a la etapa preuniversitaria.',
      modulos: 'Módulos: programa enfocado en desarrollo de preguntas, refuerzo y práctica por áreas. Se trabaja especialmente Matemáticas, Ciencias y Aptitud Académica según la programación vigente.'
    }
  };

  function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function encodeWA(text) { return encodeURIComponent(text); }
  function hasWord(text, word) { return new RegExp('(^|[^a-záéíóúñ0-9])' + word + '([^a-záéíóúñ0-9]|$)', 'i').test(text); }
  function currentRoomText() { var title = document.getElementById('nchat-room-title-main'); return cleanText(title ? title.textContent : ''); }
  function isExternalRoom() { return currentRoomText().toLowerCase().indexOf('externos') !== -1; }
  function roomLabel() {
    var text = currentRoomText();
    if (text.indexOf('·') !== -1) { var parts = text.split('·').map(cleanText); return parts[2] || 'General'; }
    return 'General';
  }
  function currentRoomId() {
    var activeRoom = document.querySelector('.nchat-room.active');
    if (activeRoom && activeRoom.dataset && activeRoom.dataset.roomId) return activeRoom.dataset.roomId;
    var key = roomLabel().toLowerCase();
    return roomIdMap[key] || 'externos-general';
  }
  function userName() { var input = document.getElementById('nchat-name'); return cleanText(input ? input.value : '') || 'Postulante'; }
  function userExtra() { var input = document.getElementById('nchat-extra'); return cleanText(input ? input.value : ''); }

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
      if (/informes/i.test(sala)) text.textContent = 'DAMUS responde sobre ciclos, horarios Full/Mañana/Tarde, vacantes, costos, Microsoft 365, sede y matrícula.';
      else if (/orientaci/i.test(sala)) text.textContent = 'Cuéntale a DAMUS tu nivel, carrera objetivo y tiempo disponible para sugerirte una ruta de preparación.';
      else text.textContent = 'DAMUS puede orientarte sobre ciclos, módulos, horarios, docentes, cachimbos, sede, noticias, contacto y matrícula.';
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
    if (/semianual/.test(t)) return KB.ciclos.semianual;
    if (/semestral/.test(t)) return KB.ciclos.semestral;
    if (/anual/.test(t)) return KB.ciclos.anual;
    if (/elite|élite/.test(t)) return KB.ciclos.elite;
    if (/proyecto|escolar|colegio/.test(t)) return KB.ciclos.escolar;
    if (/cepre|paralelo/.test(t)) return KB.ciclos.cepre;
    if (hasWord(t, 'ien')) return KB.ciclos.ien;
    if (/módulo|modulo|modulos|módulos|nostramod|nostra mód/.test(t)) return KB.ciclos.modulos;
    return 'Ciclos disponibles: Anual UNI, Semianual UNI, Semestral UNI, Verano UNI, Repaso UNI, Sabatinos UNI, Élite UNI, Proyecto Escolar, Ciclo IEN, Paralelo CEPRE UNI y Módulos. Si me dices tu nivel y cuándo postulas, te recomiendo la ruta más conveniente.';
  }

  function buildReply(userText) {
    var t = cleanText(userText).toLowerCase();
    var sala = roomLabel().toLowerCase();

    if (/full/.test(t)) return { intent: 'Horario Full', text: KB.horarioFull + ' Recomendado para quien quiere entrenar fuerte para la UNI. La vacante y el horario exacto se confirman por WhatsApp.' };
    if (/mañana|manana/.test(t)) return { intent: 'Horario Mañana', text: KB.horarioManana + ' Es una buena opción si buscas estudiar temprano y mantener la tarde para repaso, tareas o asesorías. Confirma ciclo activo y vacante por WhatsApp.' };
    if (/tarde/.test(t)) return { intent: 'Horario Tarde', text: KB.horarioTarde + ' Es útil si estudias o trabajas en la mañana. La disponibilidad depende del ciclo activo.' };
    if (/horario|horarios|turno|turnos|noche|dias|días|domingo|lunes|clases/.test(t)) return { intent: 'Horarios', text: KB.horarios + ' En general se maneja Full para mayor exigencia, Mañana para preparación concentrada temprano y Tarde para quienes necesitan estudiar después del mediodía. Para darte el horario exacto debo derivarte a WhatsApp, porque cambia según ciclo y cupo.' };

    if (/precio|costo|costos|cuanto|cuánto|mensualidad|pension|pensión|pago|promocion|promoción|descuento/.test(t)) return { intent: 'Costos y promociones', text: KB.costos + ' Te recomiendo tocar “Continuar por WhatsApp” para que te envíen la información vigente y puedas asegurar vacante si el ciclo está disponible.' };
    if (/matric|inscrib|separar|reservar|vacante|vacantes|cupo|cupos/.test(t)) return { intent: 'Matrícula y vacantes', text: 'Sí puedes consultar una posible matrícula. ' + KB.aulas + ' ' + KB.costos + ' DAMUS puede derivarte por WhatsApp para confirmar turno, ciclo, requisitos y vacante.' };

    if (/hola|buenas|info|informes|informacion|información/.test(t) || /informes/.test(sala)) return { intent: 'Informes generales', text: '¡Hola! Soy DAMUS. ' + KB.marca + ' tiene ' + KB.trayectoria + ' Trabajamos con ' + KB.enfoque + ' Puedo orientarte sobre ciclos, costos, horarios, docentes, sede y matrícula.' };
    if (/ciclo|anual|semianual|semestral|verano|repaso|sabatino|sábado|sabado|cepre|elite|élite|proyecto|escolar|módulo|modulo|módulos|modulos|nostram/.test(t) || hasWord(t, 'ien')) return { intent: 'Ciclos y módulos', text: cycleText(t) + ' Además, la preparación se apoya en docentes especialistas, práctica intensiva, evaluaciones y simulacros tipo UNI.' };
    if (/fenix|fénix|drakon|dragón|dragon/.test(t)) return { intent: 'Módulos', text: 'Actualmente ya no usamos esos nombres. Ahora los llamamos simplemente Módulos. ' + KB.ciclos.modulos };

    if (/docente|docentes|profesor|profesores|plana/.test(t)) return { intent: 'Docentes', text: KB.docentes + ' El objetivo es que el alumno no solo reciba teoría, sino entrenamiento, práctica, resolución y seguimiento.' };
    if (/cachimbo|cachimbos|ingresante|ingresantes|resultado|resultados|egresado|egresados/.test(t)) return { intent: 'Cachimbos y resultados', text: KB.cachimbos + ' Además, ' + KB.respaldo + ' Estos datos refuerzan la trayectoria y confianza de la institución.' };
    if (/noticia|noticias|blog|novedad|novedades|comunicado/.test(t)) return { intent: 'Noticias', text: KB.noticias + ' Para novedades específicas, puedes revisar la sección Noticias de la web o consultar por WhatsApp.' };
    if (/contacto|telefono|teléfono|whatsapp|correo|email|informes/.test(t)) return { intent: 'Contacto', text: 'Puedes comunicarte con Nostradamus por ' + KB.contacto + ' También puedes usar el botón de WhatsApp para que llegue tu consulta con tus datos desde NostraCHAT.' };
    if (/sede|direccion|dirección|local|ubicacion|ubicación|smp|san martin|san martín|uni/.test(t)) return { intent: 'Sede', text: 'Nuestra sede principal indicada en la web está en ' + KB.sede + ' Si necesitas ubicación exacta o indicaciones para llegar, te derivo por WhatsApp.' };
    if (/curso|matem|fisic|físic|quim|quím|aptitud|humanidades|letras|ciencias/.test(t)) return { intent: 'Cursos', text: 'Se trabajan cursos de ' + KB.cursos + ' La preparación combina teoría, práctica intensiva, evaluaciones y simulacros tipo UNI.' };
    if (/microsoft|365|teams|plataforma|virtual|clases en vivo|recurso|grabaci|grabado|video/.test(t)) return { intent: 'Microsoft 365', text: KB.plataforma + ' En la web también aparece el acceso a Clases en Vivo mediante Teams/Microsoft 365.' };
    if (/simulacro|examen|evaluaci|evaluación|prueba/.test(t)) return { intent: 'Simulacros y evaluación', text: KB.evaluacion + ' La idea es medir avance, acostumbrar al postulante al estilo UNI y corregir a tiempo.' };
    if (/beneficio|beneficios|incluye|incluyen|metodo|método|acompañamiento|asesoria|asesoría|material/.test(t)) return { intent: 'Beneficios', text: KB.beneficios + ' Es una preparación con exigencia, seguimiento y orientación hacia resultados.' };
    if (/orient|no sé|no se|recomienda|recomiendan|empezar|desde cero|base|nivel|academia|postular|admision|admisión/.test(t) || /orient/.test(sala)) return { intent: 'Orientación académica', text: 'Para orientarte mejor: si estás desde cero, normalmente conviene una ruta amplia como Anual UNI o Proyecto Escolar si aún estás en colegio. Si ya tienes base, podrías evaluar Semianual, Semestral, Repaso, Sabatino o Módulos. Dime tu carrera objetivo, nivel actual y fecha tentativa de postulación.' };

    return { intent: 'Consulta general desde NostraCHAT', text: 'DAMUS puede orientarte sobre ciclos, descripción de cada ciclo, costos vigentes, horarios Full/Mañana/Tarde, docentes, cachimbos, sede, noticias, contacto, Microsoft 365, simulacros y matrícula. ¿Qué punto quieres revisar primero?' };
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
    }).catch(function (err) { console.error('DAMUS no pudo guardar respuesta:', err); });
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
