/* NostraCHAT - Prompt avanzado de DAMUS */
(function(){
  if(window.NOSTRA_DAMUS_PROMPT_PATCHED) return;
  window.NOSTRA_DAMUS_PROMPT_PATCHED = true;

  var originalFetch = window.fetch;
  var endpoint = window.NOSTRA_DAMUS_VISION_ENDPOINT || '';

  window.NOSTRA_DAMUS_SOLUCIONARIOS_PROMPT = [
    'Actúa como DAMUS Académico, tutor experto del Grupo Nostradamus para postulantes UNI y otros exámenes exigentes.',
    'Resuelve ejercicios con rigor docente, no solo marcando la clave.',
    'Mantén la estructura: 📌 Tema probable, 🧠 Datos o condición clave, 🖼️ Representación o esquema explicativo, ✅ Validación del esquema, ✏️ Desarrollo paso a paso, 🔎 Análisis de alternativas, ✅ Posible respuesta final, 🔑 Posible clave, ⚠️ Verificación y Punto de atención para el estudiante.',
    'Usa LaTeX estándar renderizable con MathJax: fórmulas inline entre \\( y \\), fórmulas importantes entre \\[ y \\]. No uses signos de dólar.',
    'No inventes datos. Si algo no se lee, escribe [texto poco legible], [dato no completamente visible] o [símbolo no totalmente claro].',
    'Si hay figura, describe y respeta sus datos visuales. No agregues perpendicularidades, paralelismos, puntos medios, simetrías ni configuraciones especiales no dadas.',
    'Si no hay figura, propone un esquema referencial u organizador visual sin añadir datos externos.',
    'La representación visual debe ayudar a entender, pero nunca debe ser fuente de datos nuevos.',
    'Explica cada fórmula, propiedad, sustitución y transformación importante. Evita saltos como operando resulta, se ve que o de manera directa.',
    'Analiza las alternativas A, B, C, D y E si existen. Si no existen, indica que no se proporcionaron alternativas.',
    'DAMUS es apoyo académico: la respuesta debe verificarse con el docente.'
  ].join('\n');

  function clean(text){ return String(text || '').replace(/\s+/g,' ').trim(); }

  function makePrompt(studentText, mode){
    var tipo = mode === 'image'
      ? 'El alumno envió una imagen o captura de un ejercicio. Analiza solo lo visible y aclara cualquier dato poco legible.'
      : 'El alumno envió una consulta escrita. Si es ejercicio, resuélvelo con desarrollo completo.';
    return window.NOSTRA_DAMUS_SOLUCIONARIOS_PROMPT + '\n\n' + tipo + '\n\nConsulta del alumno: ' + (clean(studentText) || 'Sin texto adicional.');
  }

  window.fetch = function(input, init){
    try{
      var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      if(endpoint && url.indexOf(endpoint) === 0 && init && typeof init.body === 'string'){
        var data = JSON.parse(init.body || '{}');
        data.prompt = makePrompt(data.studentText || '', data.mode || 'text');
        data.promptVersion = 'damus-solucionarios-v1';
        init = Object.assign({}, init, { body: JSON.stringify(data) });
      }
    }catch(e){ console.warn('DAMUS prompt avanzado no aplicado:', e); }
    return originalFetch.call(this, input, init);
  };
})();
