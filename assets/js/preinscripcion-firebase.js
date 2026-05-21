/* ==================================================
   Grupo Nostradamus - Preinscripciones Firebase
   Guarda solicitudes en Firestore, no en WhatsApp.
================================================== */
(function(){
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain: 'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId: 'nostrachat-grupo-nostradamus',
    storageBucket: 'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId: '869749182265',
    appId: '1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var form = document.getElementById('preinscripcion-form');
  var box = document.getElementById('preinscripcion-message');
  if(!form || !box) return;

  var firebaseReady = null;

  function msg(type, text){
    box.className = 'form-message ' + type;
    box.innerHTML = text;
  }

  function value(name){
    return (form.elements[name] && form.elements[name].value || '').trim();
  }

  function validate(data){
    if(data.nombre.length < 5) return 'Escribe nombres y apellidos completos.';
    if(data.dni.length < 8) return 'Escribe un DNI válido.';
    if(data.celular.length < 9) return 'Escribe un celular válido.';
    if(data.correo.indexOf('@') === -1) return 'Escribe un correo personal válido.';
    if(!data.ciclo) return 'Selecciona un ciclo de interés.';
    if(!data.confirmacion) return 'Debes aceptar que Coordinación se comunique contigo para continuar el proceso.';
    return '';
  }

  function collect(){
    return {
      nombre: value('nombre'),
      dni: value('dni'),
      celular: value('celular'),
      correo: value('correo').toLowerCase(),
      colegio: value('colegio'),
      situacion: value('situacion'),
      ciclo: value('ciclo'),
      turno: value('turno'),
      apoderado: value('apoderado'),
      celularApoderado: value('celularApoderado'),
      comentario: value('comentario'),
      confirmacion: value('confirmacion'),
      estado: 'nuevo',
      origen: 'web_preinscripcion',
      tipo: 'preinscripcion_inicial',
      correoInstitucionalAsignado: false,
      matriculaAprobada: false,
      userAgent: navigator.userAgent || '',
      pageUrl: location.href
    };
  }

  function initFirebase(){
    if(firebaseReady) return firebaseReady;
    firebaseReady = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(mods){
      var appMod = mods[0];
      var fs = mods[1];
      var app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      var db = fs.getFirestore(app);
      return { fs: fs, db: db };
    });
    return firebaseReady;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();

    var btn = form.querySelector('button[type="submit"]');
    var data = collect();
    var error = validate(data);
    if(error) return msg('error', error);

    if(btn){ btn.disabled = true; btn.textContent = 'Guardando preinscripción...'; }
    msg('info', 'Guardando tus datos de preinscripción en el sistema...');

    initFirebase().then(function(ctx){
      data.createdAt = ctx.fs.serverTimestamp();
      data.updatedAt = ctx.fs.serverTimestamp();
      return ctx.fs.addDoc(ctx.fs.collection(ctx.db, 'preinscripciones'), data);
    }).then(function(ref){
      msg('ok', '✅ Preinscripción registrada correctamente.<br><small>Código de solicitud: ' + ref.id + '</small><br>Coordinación revisará tus datos y se comunicará contigo.');
      form.reset();
      if(typeof gtag === 'function'){
        gtag('event','preinscripcion_firebase_guardada',{event_category:'lead',event_label:data.ciclo});
      }
    }).catch(function(err){
      console.error('Error guardando preinscripción:', err);
      msg('error', 'No se pudo guardar la preinscripción en Firebase. Revisa las reglas de Firestore o intenta nuevamente.');
    }).finally(function(){
      if(btn){ btn.disabled = false; btn.textContent = 'Enviar preinscripción'; }
    });
  }, true);
})();
