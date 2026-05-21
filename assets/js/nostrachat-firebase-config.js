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
window.NOSTRA_MICROSOFT_TENANT_ID = "23b6326f-b776-4ffd-8b1d-cd9d10e38d84";
window.NOSTRA_DAMUS_VISION_ENDPOINT = "https://script.google.com/macros/s/AKfycbxlmtgspmeFMOqyWnHpbcHIOvpU6Ihr9c_NxtV9e4E89aa9SdwV4H6G9rBVuItVRQPhpw/exec";
(function(){
  var ADSENSE_CLIENT='ca-pub-9810053992087127';
  function loadScript(src){if(document.querySelector('script[src="'+src+'"]')) return; var script=document.createElement('script'); script.src=src; script.defer=true; document.head.appendChild(script);}
  function loadAdSense(){if(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return; var script=document.createElement('script'); script.async=true; script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADSENSE_CLIENT; script.crossOrigin='anonymous'; document.head.appendChild(script);}
  var path=(window.location.pathname||'').toLowerCase();
  var version='v=2026-64-cuenta-router';
  if(path.indexOf('nostrachat.html')!==-1||path.endsWith('/nostrachat')){
    loadAdSense();
    loadScript('assets/js/nostrachat-mobile-polish.js?'+version);
    loadScript('assets/js/nostrachat-auth-users-v2.js?'+version);
    loadScript('assets/js/nostrachat-images-firestore.js?'+version);
    loadScript('assets/js/nostrachat-images-help.js?'+version);
    loadScript('assets/js/nostrachat-damus-vision.js?'+version);
    loadScript('assets/js/nostrachat-damus-beta-label.js?'+version);
    loadScript('assets/js/nostrachat-online-users.js?'+version);
    loadScript('assets/js/nostra-cuenta-router.js?'+version);
  }
  if(path.indexOf('nostrachat-admin.html')!==-1||path.endsWith('/nostrachat-admin')){
    loadAdSense();
    loadScript('assets/js/nostrachat-admin-mathjax.js?'+version);
    loadScript('assets/js/nostrachat-admin-users.js?'+version);
    loadScript('assets/js/nostrachat-admin-images.js?'+version);
  }
})();