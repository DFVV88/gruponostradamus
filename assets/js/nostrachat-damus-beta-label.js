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
      var next = 'Beta IA · verificar con docente.';
      if (el.textContent !== next) el.textContent = next;
    });
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      applyBetaLabel();
      startObserver();
    });
  } else {
    applyBetaLabel();
    startObserver();
  }
})();
