/* ==================================================
   NostraCHAT Admin Images v2
   Usa los datos ya cargados por el panel, sin getDoc adicional.
================================================== */
(function () {
  function escapeHTML(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c;
    });
  }
  function injectStyles() {
    if (document.getElementById('nostrachat-admin-images-style')) return;
    var style = document.createElement('style');
    style.id = 'nostrachat-admin-images-style';
    style.textContent = '.admin-image-box{margin:12px 0 4px;padding:10px;border:1px solid rgba(7,140,149,.16);border-radius:16px;background:#f7fdff}.admin-image-box img{display:block;width:min(360px,100%);max-height:380px;object-fit:contain;border-radius:14px;background:#fff;border:1px solid rgba(6,20,38,.12);cursor:zoom-in}.admin-image-info{margin-top:7px;font-size:12px;font-weight:900;color:#5f6b7a}';
    document.head.appendChild(style);
  }
  function appendImage(item) {
    if (!item || item.querySelector('.admin-image-box')) return;
    var src = item.getAttribute('data-image-src') || '';
    if (!src) return;
    var size = Number(item.getAttribute('data-image-size') || 0);
    var mime = item.getAttribute('data-image-mime') || '';
    var box = document.createElement('div');
    box.className = 'admin-image-box';
    box.innerHTML = '<img src="' + escapeHTML(src) + '" alt="Imagen académica adjunta" loading="lazy"><div class="admin-image-info">📷 Imagen académica · ' + Math.round(size / 1024) + ' KB · ' + escapeHTML(mime) + '</div>';
    var text = item.querySelector('.admin-text');
    if (text) text.insertAdjacentElement('afterend', box);
    else item.appendChild(box);
  }
  function scan() { document.querySelectorAll('.admin-item[data-image-src]').forEach(appendImage); }
  function run() {
    injectStyles();
    scan();
    window.addEventListener('nostrachat-admin:rendered', scan);
    document.addEventListener('click', function (event) {
      var img = event.target && event.target.closest ? event.target.closest('.admin-image-box img') : null;
      if (!img) return;
      var win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write('<title>Imagen NostraCHAT</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="' + img.src + '" style="max-width:98vw;max-height:98vh;object-fit:contain"></body>');
        win.document.close();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();