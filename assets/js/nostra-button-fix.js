/* ==================================================
   Grupo Nostradamus - Corrección global de botones
   Evita que el hover blanco oculte el texto en botones animados.
================================================== */
(function () {
  function injectButtonFix() {
    if (document.getElementById('nostra-button-fix-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-button-fix-style';
    style.textContent = `
      /* Botones principales: texto siempre visible */
      .th-btn,
      .th-btn:visited,
      .th-btn.style3,
      .th-btn.style3:visited,
      .header-button .th-btn,
      .header-button .th-btn:visited,
      .course-content .th-btn,
      .course-content .th-btn:visited,
      .nostra-home-actions .th-btn,
      .nostra-home-actions .th-btn:visited{
        position:relative !important;
        isolation:isolate !important;
        overflow:hidden !important;
      }

      .th-btn.style3,
      .header-button .th-btn.style3,
      .course-content .th-btn.style3,
      .nostra-home-actions .th-btn.style3{
        color:#ffffff !important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 48%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.34) !important;
      }

      .th-btn.style3:hover,
      .th-btn.style3:focus,
      .th-btn.style3:active,
      .header-button .th-btn.style3:hover,
      .header-button .th-btn.style3:focus,
      .header-button .th-btn.style3:active,
      .course-content .th-btn.style3:hover,
      .course-content .th-btn.style3:focus,
      .course-content .th-btn.style3:active,
      .nostra-home-actions .th-btn.style3:hover,
      .nostra-home-actions .th-btn.style3:focus,
      .nostra-home-actions .th-btn.style3:active{
        color:#ffffff !important;
        background:linear-gradient(135deg,#00aab7 0%,#05606a 45%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.42) !important;
        box-shadow:0 0 24px rgba(0,194,209,.55), inset 0 1px 0 rgba(255,255,255,.28) !important;
      }

      .th-btn.style3 *,
      .th-btn.style3:hover *,
      .th-btn.style3:focus *,
      .th-btn.style3:active *,
      .header-button .th-btn.style3 *,
      .header-button .th-btn.style3:hover *,
      .course-content .th-btn.style3 *,
      .course-content .th-btn.style3:hover *{
        color:#ffffff !important;
        fill:#ffffff !important;
      }

      /* Efecto animado: baja opacidad para que no tape el texto */
      .th-btn.style3::before,
      .th-btn.style3::after{
        z-index:-1 !important;
        opacity:.18 !important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.18) 45%,transparent 58%) !important;
      }
      .th-btn.style3:hover::before,
      .th-btn.style3:hover::after,
      .th-btn.style3:focus::before,
      .th-btn.style3:focus::after,
      .th-btn.style3:active::before,
      .th-btn.style3:active::after{
        opacity:.14 !important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.16) 45%,transparent 58%) !important;
      }

      /* Botones claros: texto oscuro siempre visible */
      .th-btn.style6,
      .th-btn.style6:visited{
        color:#061426 !important;
        background:linear-gradient(180deg,#ffffff,#dce6ed 54%,#a9b4bf) !important;
      }
      .th-btn.style6:hover,
      .th-btn.style6:focus,
      .th-btn.style6:active{
        color:#061426 !important;
        background:linear-gradient(180deg,#ffffff,#eef5f8 54%,#b8c3cc) !important;
      }
      .th-btn.style6 *,
      .th-btn.style6:hover *{
        color:#061426 !important;
        fill:#061426 !important;
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', injectButtonFix);
  window.addEventListener('load', injectButtonFix);
})();
