/* ==================================================
   Grupo Nostradamus - Puente de compatibilidad del cierre diario
   El guardado y la validación viven únicamente en el controlador V5.
================================================== */
import('./admin-cierres-controller-v5.js?v=2026-08-03-1').catch(error => {
  console.error('No se pudo cargar el controlador único del cierre diario.',error);
});
