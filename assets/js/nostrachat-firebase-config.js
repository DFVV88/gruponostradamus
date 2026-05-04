/* ==================================================
   NostraCHAT - Configuración Firebase
   Proyecto: nostrachat-grupo-nostradamus
================================================== */
window.NOSTRACHAT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM",
  authDomain: "nostrachat-grupo-nostradamus.firebaseapp.com",
  projectId: "nostrachat-grupo-nostradamus",
  storageBucket: "nostrachat-grupo-nostradamus.firebasestorage.app",
  messagingSenderId: "869749182265",
  appId: "1:869749182265:web:5f5c9174680585f142e2e8"
};

/*
  Carga progresiva de módulos NostraCHAT.
  Importante: la subida de imágenes usa Firestore, no Firebase Storage,
  para evitar activar servicios de pago en la primera versión.
*/
(function () {
  function loadScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  var path = (window.location.pathname || '').toLowerCase();
  var version = 'v=2026-47-damus-vision';

  if (path.indexOf('nostrachat.html') !== -1 || path.endsWith('/nostrachat')) {
    loadScript('assets/js/nostrachat-images-firestore.js?' + version);
    loadScript('assets/js/nostrachat-images-help.js?' + version);
    loadScript('assets/js/nostrachat-damus-vision.js?' + version);
  }

  if (path.indexOf('nostrachat-admin.html') !== -1 || path.endsWith('/nostrachat-admin')) {
    loadScript('assets/js/nostrachat-admin-images.js?' + version);
  }
})();
