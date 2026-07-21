/* ==================================================
   Grupo Nostradamus - Datos generales del ciclo
   Muestra fecha de inicio y duración dentro de Descripción.
================================================== */
(function(){
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  var PROGRAMS = {
    'ciclo-anual-uni.html':'nostra-360-uni',
    'ciclo-semianual-uni.html':'nostra-power-uni',
    'ciclo-semestral-uni.html':'nostra-elite-uni',
    'ciclo-repaso-uni.html':'nostra-prime-uni',
    'ciclo-elite-uni.html':'nostra-talentum-uni',
    'ciclo-ien.html':'ciclo-ien',
    'ciclo-proyecto-escolar.html':'proyecto-escolar',
    'ciclo-paralelo-cepre-uni.html':'paralelo-cepre-uni',
    'ciclo-verano-uni.html':'ciclo-verano-uni'
  };
  var programId = PROGRAMS[file];
  if(!programId) return;

  var firebaseConfig = {
    apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
    authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
    projectId:'nostrachat-grupo-nostradamus',
    storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
    messagingSenderId:'869749182265',
    appId:'1:869749182265:web:5f5c9174680585f142e2e8'
  };

  var currentData = null;

  function clean(value){
    return String(value == null ? '' : value).replace(/\s+/g,' ').trim();
  }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g,function(character){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character];
    });
  }
  function dateLabel(value){
    var raw = clean(value);
    if(!raw) return '';
    var date = new Date(raw + 'T12:00:00');
    if(Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'});
  }
  function addStyles(){
    if(document.getElementById('nostra-cycle-description-meta-style')) return;
    var style = document.createElement('style');
    style.id = 'nostra-cycle-description-meta-style';
    style.textContent = [
      '#Coursedescription .nostra-cycle-description-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0 20px}',
      '#Coursedescription .nostra-cycle-description-meta__item{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid rgba(7,140,149,.18);border-radius:16px;background:linear-gradient(135deg,#f5fbfc,#fff);box-shadow:0 9px 24px rgba(6,20,38,.05)}',
      '#Coursedescription .nostra-cycle-description-meta__icon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;background:#078c95;color:#fff;font-size:17px}',
      '#Coursedescription .nostra-cycle-description-meta small{display:block;margin-bottom:2px;color:#607080;font-size:11px;font-weight:900;letter-spacing:.35px;text-transform:uppercase}',
      '#Coursedescription .nostra-cycle-description-meta strong{display:block;color:#061426;font-size:17px;line-height:1.25}',
      '@media(max-width:650px){#Coursedescription .nostra-cycle-description-meta{grid-template-columns:1fr}#Coursedescription .nostra-cycle-description-meta__item{padding:13px 14px}}'
    ].join('');
    document.head.appendChild(style);
  }
  function locateHost(){
    var pane = document.getElementById('Coursedescription');
    if(!pane) return null;
    return pane.querySelector('.course-description') || pane;
  }
  function render(data){
    var host = locateHost();
    if(!host) return false;

    var start = data && data.publicado !== false ? dateLabel(data.fechaInicio) : '';
    var duration = data && data.publicado !== false ? clean(data.duracion) : '';
    var current = host.querySelector('.nostra-cycle-description-meta');

    if(!start && !duration){
      if(current) current.remove();
      return true;
    }

    addStyles();
    if(!current){
      current = document.createElement('div');
      current.className = 'nostra-cycle-description-meta';
      current.setAttribute('aria-label','Información general del ciclo');
      var title = host.querySelector('h5, h4, h3');
      if(title && title.nextSibling) host.insertBefore(current,title.nextSibling);
      else if(title) host.appendChild(current);
      else host.insertBefore(current,host.firstChild);
    }

    var items = [];
    if(start){
      items.push('<div class="nostra-cycle-description-meta__item"><span class="nostra-cycle-description-meta__icon"><i class="far fa-calendar-alt" aria-hidden="true"></i></span><div><small>Inicio de clases</small><strong>' + esc(start) + '</strong></div></div>');
    }
    if(duration){
      items.push('<div class="nostra-cycle-description-meta__item"><span class="nostra-cycle-description-meta__icon"><i class="far fa-hourglass" aria-hidden="true"></i></span><div><small>Duración</small><strong>' + esc(duration) + '</strong></div></div>');
    }
    current.innerHTML = items.join('');
    return true;
  }
  function loadRemote(){
    return Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
    ]).then(function(modules){
      var appModule = modules[0];
      var firestore = modules[1];
      var app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
      return firestore.getDoc(firestore.doc(firestore.getFirestore(app),'programas_publicos',programId));
    }).then(function(snapshot){
      currentData = snapshot.exists() ? snapshot.data() : null;
      render(currentData);
    }).catch(function(error){
      console.warn('No se pudieron mostrar la fecha de inicio y la duración del ciclo:',error);
    });
  }
  function start(){
    addStyles();
    var attempts = 0;
    var timer = setInterval(function(){
      if(currentData) render(currentData);
      attempts += 1;
      if(attempts >= 40 || (currentData && locateHost())) clearInterval(timer);
    },350);
    loadRemote();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',function(){ if(currentData) render(currentData); });
})();
