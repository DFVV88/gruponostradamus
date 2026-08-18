/* ==================================================
   Grupo Nostradamus - Seguridad de modales administrativos
   Evita cierres accidentales al hacer clic fuera de una ventana flotante.
   Los botones Cerrar / Cancelar y las acciones explícitas siguen funcionando.
================================================== */
(function(){
  'use strict';

  const EXPLICIT_BACKDROPS = [
    '#modal-back',
    '#manual-student-back',
    '.modal-back',
    '.manual-student-back',
    '.admin-modal-back',
    '.admin-modal-backdrop'
  ].join(',');

  function looksLikeAdminBackdrop(element){
    if(!(element instanceof Element)) return false;
    if(element.dataset && element.dataset.adminBackdropClose === 'true') return false;
    if(element.matches(EXPLICIT_BACKDROPS)) return true;

    const signature = ((element.id || '') + ' ' + (typeof element.className === 'string' ? element.className : '')).toLowerCase();
    if(!/(?:^|[\s_-])(back|backdrop|overlay)(?:$|[\s_-])/.test(signature)) return false;

    const style = window.getComputedStyle(element);
    if(style.position !== 'fixed') return false;

    const rect = element.getBoundingClientRect();
    const coversViewport = rect.width >= window.innerWidth * 0.7 && rect.height >= window.innerHeight * 0.7;
    if(!coversViewport) return false;

    return Boolean(element.querySelector('[role="dialog"], .modal, [class*="modal"], [class*="dialog"]'));
  }

  document.addEventListener('click', function(event){
    if(!looksLikeAdminBackdrop(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
