/* ==================================================
   Grupo Nostradamus - Vinculación de alumno existente
   Se ejecuta antes del flujo normal de preinscripción.
   Si el DNI pertenece a un alumno manual, completa la misma ficha sin tocar Finanzas.
================================================== */
(function(){
  'use strict';

  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var REGISTRY_COLLECTION = 'alumnos_registro_dni';
  var PRE_COLLECTION = 'preinscripciones';
  var firebaseReady = null;
  var checking = false;

  function clean(value){ return String(value == null ? '' : value).replace(/\s+/g,' ').trim(); }
  function dniDigits(value){ return clean(value).replace(/\D/g,'').slice(0,12); }
  function esc(value){
    return clean(value).replace(/[&<>'"]/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char];
    });
  }
  function value(form,name){ return clean(form.elements[name] && form.elements[name].value); }
  function message(type,text){
    var box = document.getElementById('preinscripcion-message');
    if(!box) return;
    box.className = 'form-message ' + type;
    box.innerHTML = text;
  }
  function setButton(form,busy,text){
    var button = form.querySelector('button[type="submit"]');
    if(!button) return;
    button.disabled = busy;
    button.textContent = text || 'Enviar preinscripción';
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
      return {fs:fs,db:fs.getFirestore(app)};
    });
    return firebaseReady;
  }
  function sha256(value){
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)).then(function(buffer){
      return Array.from(new Uint8Array(buffer)).map(function(byte){ return byte.toString(16).padStart(2,'0'); }).join('');
    });
  }
  function safePatch(form,fs){
    return {
      nombre:value(form,'nombre'),
      correo:value(form,'correo').toLowerCase(),
      colegio:value(form,'colegio'),
      situacion:value(form,'situacion'),
      apoderado:value(form,'apoderado'),
      celularApoderado:value(form,'celularApoderado'),
      comentario:value(form,'comentario'),
      confirmacion:value(form,'confirmacion'),
      formularioWebCompletado:true,
      formularioWebUpdatedAt:fs.serverTimestamp(),
      origenFormularioWeb:'web_preinscripcion_complementaria',
      userAgentFormularioWeb:navigator.userAgent || '',
      pageUrlFormularioWeb:location.href,
      updatedAt:fs.serverTimestamp()
    };
  }
  function validateIdentity(form){
    var dni = dniDigits(value(form,'dni'));
    var phone = value(form,'celular');
    if(dni.length < 8) return {error:'Escribe un DNI válido.'};
    if(phone.length < 9) return {error:'Escribe el mismo celular registrado previamente por administración.'};
    return {dni:dni,phone:phone};
  }
  function resumeNormalFlow(form){
    form.dataset.existingStudentBypass = '1';
    checking = false;
    setButton(form,false,'Enviar preinscripción');
    window.setTimeout(function(){
      if(typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    },0);
  }

  document.addEventListener('submit',function(event){
    var form = event.target;
    if(!form || form.id !== 'preinscripcion-form') return;

    if(form.dataset.existingStudentBypass === '1'){
      delete form.dataset.existingStudentBypass;
      return;
    }
    if(checking){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    var identity = validateIdentity(form);
    if(identity.error) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    checking = true;
    setButton(form,true,'Verificando DNI...');
    message('info','Verificando si ya existe una ficha administrativa para este DNI...');

    var ctx;
    sha256(identity.dni).then(function(hash){
      return initFirebase().then(function(context){
        ctx = context;
        return ctx.fs.getDoc(ctx.fs.doc(ctx.db,REGISTRY_COLLECTION,hash));
      });
    }).then(function(registrySnapshot){
      if(!registrySnapshot.exists()){
        resumeNormalFlow(form);
        return null;
      }
      var registry = registrySnapshot.data() || {};
      var recordId = clean(registry.registroId);
      if(!recordId) throw Object.assign(new Error('Registro administrativo incompleto'),{code:'invalid-registry'});

      message('info','Encontramos una ficha creada por administración. Completando tus datos sin modificar matrícula ni pagos...');
      var patch = safePatch(form,ctx.fs);
      patch.dni = identity.dni;
      patch.celular = identity.phone;
      return ctx.fs.updateDoc(ctx.fs.doc(ctx.db,PRE_COLLECTION,recordId),patch).then(function(){
        message('ok','✅ Tus datos fueron vinculados a la ficha que ya tenía Coordinación.<br><b>No se creó una segunda preinscripción.</b><br><small>Tu matrícula, precio acordado, cronograma y pagos existentes permanecen sin cambios.</small>');
        form.reset();
        var cycle = form.elements.ciclo;
        if(cycle) cycle.dispatchEvent(new Event('change',{bubbles:true}));
        if(typeof window.gtag === 'function'){
          window.gtag('event','alumno_existente_formulario_completado',{
            event_category:'student_update',
            event_label:'ficha_manual_vinculada'
          });
        }
      });
    }).catch(function(error){
      console.error('No se pudo comprobar o vincular el alumno existente:',error);
      if(error && error.code === 'permission-denied'){
        message('error','El DNI ya está registrado, pero el celular no coincide con la ficha administrativa. Verifica el número o comunícate con Coordinación para evitar duplicar tu registro.');
      }else{
        message('error','No pudimos comprobar tu ficha en este momento. No se creó una preinscripción duplicada. Intenta nuevamente o comunícate con Coordinación.');
      }
    }).finally(function(){
      if(form.dataset.existingStudentBypass !== '1'){
        checking = false;
        setButton(form,false,'Enviar preinscripción');
      }
    });
  },true);
})();
