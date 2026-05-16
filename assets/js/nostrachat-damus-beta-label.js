(function(){
  function wantedText(mode){
    return mode === 'text'
      ? '🤖 MODO BETA · Pedir respuesta a DAMUS'
      : '🤖 MODO BETA · Pedir posible solución a DAMUS';
  }

  function shouldKeepCurrent(text){
    return /disponible|analizando|Solicitud enviada|alcanzado|ocupado/i.test(String(text || ''));
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
          data.promptVersion = 'damus-solucionarios-v1';
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
