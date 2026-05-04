/* ==================================================
   NostraCHAT Images Help
   Muestra límites visibles para adjuntar imágenes.
================================================== */
(function () {
  function applyHelpText() {
    var tool = document.querySelector('.nchat-image-tool');
    var pickBtn = document.getElementById('nchat-image-pick');
    var note = document.querySelector('.nchat-note');

    if (pickBtn && pickBtn.textContent.indexOf('2 MB') === -1) {
      pickBtn.textContent = '📷 Adjuntar imagen';
      pickBtn.title = 'Máximo 2 MB. Formatos permitidos: JPG, PNG o WEBP.';
    }

    if (tool && !document.getElementById('nchat-image-limit-text')) {
      var limit = document.createElement('div');
      limit.id = 'nchat-image-limit-text';
      limit.className = 'nchat-image-limit-text';
      limit.textContent = 'Máx. 2 MB por imagen · JPG, PNG o WEBP · se comprimirá automáticamente.';
      tool.appendChild(limit);
    }

    if (note) {
      note.textContent = 'Sistema mixto: texto + imágenes académicas comprimidas solo para alumnos. Máx. 2 MB por imagen, 5 imágenes al día por dispositivo. Formatos: JPG, PNG o WEBP. No se permiten enlaces externos, videos ni PDFs.';
    }
  }

  function injectStyles() {
    if (document.getElementById('nostrachat-images-help-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-images-help-style';
    style.textContent = '\
      .nchat-image-limit-text{font-size:12px;font-weight:850;color:#5f6b7a;line-height:1.35;padding:4px 2px;}\
      @media(max-width:640px){.nchat-image-limit-text{width:100%;}}\
    ';
    document.head.appendChild(style);
  }

  function run() {
    injectStyles();
    applyHelpText();
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      applyHelpText();
      if (document.getElementById('nchat-image-limit-text') || tries > 30) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
