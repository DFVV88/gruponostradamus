(function(){
  function wantedText(mode){
    return mode === 'text'
      ? '🤖 MODO BETA · Pedir respuesta a DAMUS'
      : '🤖 MODO BETA · Pedir posible solución a DAMUS';
  }

  function shouldKeepCurrent(text){
    return /disponible|analizando|Solicitud enviada|alcanzado|ocupado/i.test(String(text || ''));
  }

  function injectDamusLayoutStyle(){
    if(document.getElementById('nostrachat-damus-layout-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-damus-layout-style';
    style.textContent = `
      .nchat-msg.other .nchat-text[data-damus-formatted="1"]{
        line-height:1.72!important;
        letter-spacing:.01em;
      }
      .nchat-msg.other .nchat-text[data-damus-formatted="1"] strong{
        display:block!important;
        margin:18px 0 8px!important;
        padding:9px 12px!important;
        border-radius:14px!important;
        background:linear-gradient(135deg,rgba(0,194,209,.10),rgba(255,148,30,.08))!important;
        border:1px solid rgba(0,194,209,.16)!important;
        color:#061426!important;
        font-size:15px!important;
        line-height:1.25!important;
      }
      .nchat-msg.other .nchat-text[data-damus-formatted="1"] strong:first-child{margin-top:4px!important;}
      .nchat-msg.other .nchat-text[data-damus-formatted="1"] mjx-container[jax="CHTML"][display="true"]{
        display:block!important;
        text-align:center!important;
        margin:12px 0!important;
        padding:8px 10px!important;
        max-width:100%!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        background:rgba(255,255,255,.65)!important;
        border-radius:12px!important;
      }
      .nchat-msg.other .nchat-text[data-damus-formatted="1"] mjx-container:not([display="true"]){
        margin:0 2px!important;
      }
      @media(max-width:640px){
        .nchat-msg.other .nchat-text[data-damus-formatted="1"]{line-height:1.68!important;font-size:14px!important;}
        .nchat-msg.other .nchat-text[data-damus-formatted="1"] strong{font-size:14px!important;margin:16px 0 7px!important;padding:8px 10px!important;}
        .nchat-msg.other .nchat-text[data-damus-formatted="1"] mjx-container[jax="CHTML"][display="true"]{font-size:96%!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function applyBetaLabel(){
    document.querySelectorAll('[data-damus-id]').forEach(function(btn){
      var mode = btn.getAttribute('data-damus-mode') || 'image';
      var text = btn.textContent || '';
      if (shouldKeepCurrent(text)) return;
      var next = wantedText(mode);
      if (text !== next) btn.textContent = next;
    });

    document.querySelectorAll('.nchat-damus-mini').forEach(function(el){
      var next = 'Beta IA · solucionario guiado · verificar con docente.';
      if (el.textContent !== next) el.textContent = next;
    });
  }

  function clean(text){ return String(text || '').replace(/\s+/g,' ').trim(); }

  function advancedPrompt(studentText, mode){
    var intro = mode === 'image'
      ? 'El alumno envió una imagen o captura de un ejercicio. Analiza solo lo visible y aclara cualquier dato poco legible.'
      : 'El alumno envió una consulta escrita. Si es ejercicio, resuélvelo con desarrollo completo.';
    return [
      'Actúa como DAMUS Académico, tutor experto del Grupo Nostradamus para postulantes UNI y otros exámenes exigentes.',
      'Resuelve ejercicios con rigor docente, no solo marcando la clave.',
      intro,
      '',
      'DISTRIBUCIÓN OBLIGATORIA PARA QUE SE LEA BIEN EN CELULAR:',
      'Escribe como separata corta, no como bloque corrido.',
      'Cada sección debe tener párrafos breves de máximo 2 o 3 líneas.',
      'Separa cada paso con subtítulos claros: Paso 1, Paso 2, Paso 3.',
      'Coloca las fórmulas importantes en una línea aparte usando \\[ ... \\].',
      'Evita mezclar fórmulas largas dentro de párrafos extensos.',
      'Cuando haya dos o más condiciones, preséntalas como lista ordenada.',
      'Cuando obtengas una condición final, destácala en una línea independiente.',
      '',
      'Mantén esta estructura obligatoria:',
      '📌 Tema probable:',
      '🧠 Datos o condición clave:',
      '🖼️ Representación o esquema explicativo:',
      '✅ Validación del esquema:',
      '✏️ Desarrollo paso a paso:',
      '🔎 Análisis de alternativas:',
      '✅ Posible respuesta final:',
      '🔑 Posible clave:',
      '⚠️ Verificación:',
      'PUNTO DE ATENCIÓN PARA EL ESTUDIANTE:',
      '',
      'Reglas:',
      'Usa LaTeX estándar renderizable con MathJax: fórmulas inline entre \\( y \\), fórmulas importantes entre \\[ y \\]. No uses signos de dólar.',
      'No inventes datos. Si algo no se lee, escribe [texto poco legible], [dato no completamente visible] o [símbolo no totalmente claro].',
      'Si hay figura, describe y respeta sus datos visuales. No agregues perpendicularidades, paralelismos, puntos medios, simetrías ni configuraciones especiales no dadas.',
      'Si no hay figura, propone un esquema referencial u organizador visual sin añadir datos externos.',
      'La representación visual ayuda a entender, pero nunca debe ser fuente de datos nuevos.',
      'Explica cada fórmula, propiedad, sustitución y transformación importante. Evita saltos como operando resulta, se ve que o de manera directa.',
      'Analiza las alternativas A, B, C, D y E si existen. Si no existen, indica que no se proporcionaron alternativas.',
      'DAMUS es apoyo académico: la respuesta debe verificarse con el docente.',
      '',
      'Consulta del alumno: ' + (clean(studentText) || 'Sin texto adicional.')
    ].join('\n');
  }

  function patchDamusFetch(){
    if (window.NOSTRA_DAMUS_PROMPT_PATCHED) return;
    if (!window.fetch) return;
    window.NOSTRA_DAMUS_PROMPT_PATCHED = true;
    var originalFetch = window.fetch;
    window.fetch = function(input, init){
      try{
        var endpoint = window.NOSTRA_DAMUS_VISION_ENDPOINT || '';
        var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        if(endpoint && url.indexOf(endpoint) === 0 && init && typeof init.body === 'string'){
          var data = JSON.parse(init.body || '{}');
          data.prompt = advancedPrompt(data.studentText || '', data.mode || 'text');
          data.promptVersion = 'damus-solucionarios-layout-v2';
          init = Object.assign({}, init, { body: JSON.stringify(data) });
        }
      }catch(e){ console.warn('DAMUS prompt avanzado no aplicado:', e); }
      return originalFetch.call(this, input, init);
    };
  }

  function startObserver(){
    var target = document.body || document.documentElement;
    if (!target || typeof MutationObserver === 'undefined') return;
    var scheduled = false;
    var observer = new MutationObserver(function(){
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function(){
        scheduled = false;
        applyBetaLabel();
      });
    });
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  function init(){
    injectDamusLayoutStyle();
    patchDamusFetch();
    applyBetaLabel();
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
