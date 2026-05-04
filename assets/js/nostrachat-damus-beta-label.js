(function(){
  function applyBetaLabel(){
    document.querySelectorAll('[data-damus-id]').forEach(function(btn){
      var mode = btn.getAttribute('data-damus-mode') || 'image';
      var t = btn.textContent || '';
      if (/disponible|analizando|Solicitud enviada|límite/i.test(t)) return;
      btn.textContent = mode === 'text'
        ? '🤖 MODO BETA · Pedir respuesta a DAMUS'
        : '🤖 MODO BETA · Pedir posible solución a DAMUS';
    });
    document.querySelectorAll('.nchat-damus-mini').forEach(function(el){
      el.textContent = 'Beta IA · límite 20/día · verificar con docente.';
    });
  }
  setInterval(applyBetaLabel, 900);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBetaLabel);
  else applyBetaLabel();
})();
