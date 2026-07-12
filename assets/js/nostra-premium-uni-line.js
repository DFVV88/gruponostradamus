/* Grupo Nostradamus - Nueva línea premium Nostra UNI
   Versión segura: sin observador infinito para evitar preloader bloqueado.
*/
(function(){
  var file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  var map={
    'ciclo-anual-uni.html':{n:'Nostra 360 UNI',c:'360',icon:'🌐',verb:'FORMA',tag:'Preparación integral. Formación completa. Mentalidad de ingreso.',d:'Nostra 360 UNI está diseñado para estudiantes que necesitan desarrollar una preparación completa desde las bases hasta alcanzar el nivel exigido por la Universidad Nacional de Ingeniería. Fortalece conocimientos, disciplina, razonamiento, hábitos de estudio y capacidad para resolver problemas de alta exigencia.',ideal:'Domina cada área, fortalece tu nivel y transforma tu preparación.'},
    'ciclo-semianual-uni.html':{n:'Nostra Power UNI',c:'POWER',icon:'⚡',verb:'TRANSFORMA',tag:'Corrige tus errores. Potencia tu nivel. Vuelve más fuerte.',d:'Nostra Power UNI está dirigido a estudiantes que ya tuvieron una preparación anterior, pero todavía no alcanzaron el resultado esperado. Identifica fallas, corrige debilidades, fortalece conocimientos y desarrolla una estrategia académica mucho más efectiva.',ideal:'Convierte tus intentos anteriores en la fuerza que te llevará hacia tu vacante.'},
    'ciclo-semestral-uni.html':{n:'Nostra Élite UNI',c:'ÉLITE',icon:'🎯',verb:'PERFECCIONA',tag:'Estuviste cerca. Ahora ve por tu vacante.',d:'Nostra Élite UNI es un programa de alto rendimiento para postulantes que ya rindieron el examen de admisión, alcanzaron un nivel competitivo y quedaron a pocos puntos de ingresar. Trabaja velocidad, precisión, estrategia, manejo del tiempo y reducción de errores bajo presión.',ideal:'Cuando estar cerca ya no es suficiente.'},
    'ciclo-repaso-uni.html':{n:'Nostra Prime UNI',c:'PRIME',icon:'🚀',verb:'DEFINE',tag:'Tu máximo nivel. Tu momento decisivo.',d:'Nostra Prime UNI está diseñado para postulantes en la etapa final antes del examen. Cada clase, simulacro y problema tiene un objetivo preciso: llegar al examen con velocidad, seguridad, estrategia y máxima concentración.',ideal:'No llegues solamente preparado. Llega en tu máximo nivel.'},
    'ciclo-elite-uni.html':{n:'Nostra Talentum UNI',c:'TALENTUM',icon:'🏆',verb:'COMPITE',tag:'Talento superior. Exigencia máxima. Rendimiento extraordinario.',d:'Nostra Talentum UNI es un programa especializado para estudiantes con nivel académico sobresaliente, preparados para competir por los primeros lugares del examen de admisión UNI. Desarrolla velocidad, precisión, estrategia, dominio de problemas de alta complejidad y respuesta bajo máxima exigencia.',ideal:'Donde el talento compite por los primeros lugares.'}
  };
  var routes=['ciclo-anual-uni.html','ciclo-semianual-uni.html','ciclo-semestral-uni.html','ciclo-repaso-uni.html','ciclo-elite-uni.html'];
  var reps=[
    ['CICLO ANUAL UNI','Nostra 360 UNI'],['Ciclo Anual UNI','Nostra 360 UNI'],['Anual UNI','Nostra 360 UNI'],
    ['CICLO SEMIANUAL UNI','Nostra Power UNI'],['Ciclo Semianual UNI','Nostra Power UNI'],['Semianual UNI','Nostra Power UNI'],
    ['CICLO SEMESTRAL UNI','Nostra Élite UNI'],['Ciclo Semestral UNI','Nostra Élite UNI'],['Semestral UNI','Nostra Élite UNI'],
    ['CICLO REPASO UNI','Nostra Prime UNI'],['Ciclo Repaso UNI','Nostra Prime UNI'],['Ciclo repaso UNI','Nostra Prime UNI'],['Repaso UNI','Nostra Prime UNI'],
    ['CICLO ÉLITE UNI','Nostra Talentum UNI'],['Ciclo Élite UNI','Nostra Talentum UNI'],['Ciclo Elite UNI','Nostra Talentum UNI'],['Élite UNI','Nostra Talentum UNI'],['Elite UNI','Nostra Talentum UNI']
  ];
  var started=false;

  function meta(name,val){
    var m=document.querySelector('meta[name="'+name+'"]');
    if(!m){m=document.createElement('meta');m.name=name;document.head.appendChild(m)}
    if(m.content!==val)m.content=val;
  }

  function wa(name){
    return 'https://wa.me/51993750351?text='+encodeURIComponent('Hola Nostradamus, quiero informes sobre '+name+'.');
  }

  function hidePreloaderSafe(){
    setTimeout(function(){
      var p=document.querySelector('.preloader');
      if(p){p.style.display='none';p.style.opacity='0';p.style.visibility='hidden';}
    },4500);
  }

  function addStyle(){
    if(document.getElementById('nostra-ruta-premium-style'))return;
    var s=document.createElement('style');
    s.id='nostra-ruta-premium-style';
    s.textContent=`
      #nostra-ruta-premium{position:relative!important;overflow:hidden!important;padding:105px 0!important;background:radial-gradient(circle at 12% 18%,rgba(0,194,209,.35),transparent 30%),radial-gradient(circle at 88% 78%,rgba(255,181,57,.22),transparent 30%),linear-gradient(135deg,#02070d 0%,#061426 38%,#063a48 68%,#078c95 100%)!important;color:#fff!important;}
      #nostra-ruta-premium:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:46px 46px;opacity:.55;pointer-events:none;}
      #nostra-ruta-premium:after{content:"";position:absolute;width:520px;height:520px;border-radius:50%;right:-190px;top:-170px;background:radial-gradient(circle,rgba(0,229,255,.34),transparent 68%);filter:blur(3px);animation:nostraGlow 6s ease-in-out infinite alternate;pointer-events:none;}
      .nostra-ruta-wrap{position:relative;z-index:2;width:min(1180px,92%);margin:auto;text-align:center;}
      .nostra-ruta-kicker{display:inline-flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(168,247,255,.32);color:#a8f7ff;font-weight:950;text-transform:uppercase;letter-spacing:1.1px;box-shadow:0 0 28px rgba(0,194,209,.16);}
      .nostra-ruta-title{margin:18px 0 16px!important;font-size:clamp(44px,6vw,86px)!important;line-height:.92!important;font-style:italic!important;text-transform:uppercase!important;letter-spacing:-2px!important;font-weight:950!important;background:linear-gradient(180deg,#fff 0%,#a8f7ff 26%,#00c2d1 55%,#ffb539 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 6px 0 rgba(0,0,0,.25)) drop-shadow(0 0 24px rgba(0,194,209,.22));}
      .nostra-ruta-lead{max-width:940px;margin:0 auto 46px!important;color:rgba(255,255,255,.88)!important;font-size:clamp(17px,1.6vw,22px)!important;line-height:1.65!important;font-weight:700;}
      .nostra-ruta-grid{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:18px;text-align:left;}
      .nostra-ruta-grid:before{content:"";position:absolute;left:7%;right:7%;top:52px;height:3px;background:linear-gradient(90deg,transparent,#00e5ff,#ffb539,#00e5ff,transparent);box-shadow:0 0 18px rgba(0,229,255,.52);opacity:.65;}
      .nostra-ruta-card{position:relative;min-height:248px;padding:22px 18px 20px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.055));border:1px solid rgba(255,255,255,.20);box-shadow:0 22px 56px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(10px);color:#fff!important;text-decoration:none!important;overflow:hidden;transform:translateY(0);transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease;}
      .nostra-ruta-card:before{content:"";position:absolute;inset:-1px;background:linear-gradient(135deg,rgba(0,229,255,0),rgba(0,229,255,.22),rgba(255,181,57,.18),rgba(0,229,255,0));opacity:0;transition:.28s;pointer-events:none;}
      .nostra-ruta-card:hover{transform:translateY(-12px);border-color:rgba(168,247,255,.58);box-shadow:0 30px 72px rgba(0,0,0,.32),0 0 38px rgba(0,194,209,.20);}
      .nostra-ruta-card:hover:before{opacity:1;}
      .nostra-ruta-number{position:relative;width:58px;height:58px;display:grid;place-items:center;border-radius:20px;background:linear-gradient(135deg,#00c2d1,#078c95 48%,#ffb539);box-shadow:0 16px 34px rgba(0,194,209,.24);font-size:25px;margin-bottom:18px;}
      .nostra-ruta-name{position:relative;display:block;font-size:20px;line-height:1.08;font-weight:950;color:#fff;margin-bottom:9px;}
      .nostra-ruta-verb{position:relative;display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(255,181,57,.14);border:1px solid rgba(255,181,57,.34);color:#ffda85;font-size:11px;font-weight:950;letter-spacing:.7px;margin-bottom:11px;}
      .nostra-ruta-tag{position:relative;display:block;color:rgba(255,255,255,.78);font-size:13.5px;line-height:1.42;font-weight:650;}
      .nostra-ruta-motto{margin:44px auto 0!important;font-size:clamp(27px,3.2vw,48px)!important;line-height:1.13!important;color:#fff!important;font-weight:950!important;text-shadow:0 12px 32px rgba(0,0,0,.35);}
      .nostra-ruta-motto span{background:linear-gradient(90deg,#a8f7ff,#fff,#ffcf75);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
      @keyframes nostraGlow{from{transform:translate3d(0,0,0) scale(.95);opacity:.55}to{transform:translate3d(-70px,60px,0) scale(1.08);opacity:.95}}
      @media(max-width:1100px){.nostra-ruta-grid{grid-template-columns:repeat(2,1fr)}.nostra-ruta-grid:before{display:none}.nostra-ruta-card{min-height:210px}}
      @media(max-width:640px){#nostra-ruta-premium{padding:76px 0!important}.nostra-ruta-grid{grid-template-columns:1fr}.nostra-ruta-title{letter-spacing:-1px!important}.nostra-ruta-card{min-height:auto}}
    `;
    document.head.appendChild(s);
  }

  function replaceText(){
    if(!document.body)return;
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentElement;
      if(!p||/script|style|textarea|input/i.test(p.tagName))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }}),nodes=[];
    while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(function(n){
      var v=n.nodeValue, original=v;
      reps.forEach(function(r){v=v.split(r[0]).join(r[1])});
      if(v!==original)n.nodeValue=v;
    });
  }

  function updateSelects(){
    document.querySelectorAll('select[name="ciclo"]').forEach(function(s){
      if(s.getAttribute('data-nostra-premium-select')==='1')return;
      var keep=['Nostra 360 UNI','Nostra Power UNI','Nostra Élite UNI','Nostra Prime UNI','Nostra Talentum UNI','Ciclo IEN','Paralelo CEPRE UNI','Ciclo Verano UNI','NostraMÓDULOS','Proyecto Escolar'];
      s.innerHTML='<option value="">Seleccionar programa</option>'+keep.map(function(x){return '<option>'+x+'</option>'}).join('');
      s.setAttribute('data-nostra-premium-select','1');
    });
  }

  function schema(d){
    var sc=document.getElementById('nostra-schema-course');
    var data={'@context':'https://schema.org','@type':'Course','name':d.n,'description':d.d+' '+d.ideal,'provider':{'@type':'EducationalOrganization','name':'Grupo Nostradamus'},'educationalLevel':'Preuniversitario','inLanguage':'es-PE','url':location.href};
    if(!sc){sc=document.createElement('script');sc.type='application/ld+json';sc.id='nostra-schema-course';document.head.appendChild(sc)}
    var text=JSON.stringify(data);
    if(sc.textContent!==text)sc.textContent=text;
  }

  function detail(){
    var d=map[file];
    if(!d)return;
    document.title=d.n+' | Grupo Nostradamus Premium';
    meta('description',d.d+' '+d.ideal);
    meta('keywords','Grupo Nostradamus Premium, '+d.n+', preparación UNI, ruta Nostra UNI, academia UNI, simulacros UNI');
    ['.breadcumb-title','.course-title','h1.breadcumb-title','.breadcumb-content h1'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(e){if(e.textContent!==d.n)e.textContent=d.n});
    });
    document.querySelectorAll('.breadcumb-menu li,.breadcumb-menu a,.breadcumb-menu span').forEach(function(e){
      var v=e.textContent, original=v;
      reps.forEach(function(r){v=v.split(r[0]).join(r[1])});
      if(v!==original)e.textContent=v;
    });
    var p=document.querySelector('.course-description p');
    if(p && p.getAttribute('data-nostra-premium-copy')!=='1'){
      p.innerHTML=d.d+'<br><br><strong>'+d.tag+'</strong><span class="nostra-cycle-ideal"> '+d.ideal+'</span>';
      p.setAttribute('data-nostra-premium-copy','1');
    }
    var h=document.querySelector('.nostra-cycle-hero__title');if(h&&h.textContent!==d.tag)h.textContent=d.tag;
    var ht=document.querySelector('.nostra-cycle-hero__text');if(ht&&ht.textContent!==d.d)ht.textContent=d.d;
    document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){if((a.textContent||'').toLowerCase().indexOf('informes')>-1)a.href=wa(d.n)});
    schema(d);
  }

  function navNames(){
    routes.forEach(function(r){
      var d=map[r];
      document.querySelectorAll('a[href$="'+r+'"]').forEach(function(a){if(a.textContent!==d.n)a.textContent=d.n});
    });
  }

  function premiumBlock(){
    addStyle();
    if(document.getElementById('nostra-ruta-premium'))return;
    var target=document.querySelector('#course-sec,.course-area,.space');
    if(!target)return;
    var sec=document.createElement('section');
    sec.id='nostra-ruta-premium';
    sec.innerHTML='<div class="nostra-ruta-wrap"><span class="nostra-ruta-kicker">✦ Nueva línea premium Nostra UNI</span><h2 class="nostra-ruta-title">La Ruta Nostra UNI</h2><p class="nostra-ruta-lead">No todos los postulantes comienzan desde el mismo punto. Identificamos su nivel, entendemos su historia y le asignamos el programa que realmente necesita para avanzar con exigencia.</p><div class="nostra-ruta-grid">'+routes.map(function(r){var d=map[r];return '<a class="nostra-ruta-card" href="'+r+'"><span class="nostra-ruta-number">'+d.icon+'</span><b class="nostra-ruta-name">'+d.n+'</b><span class="nostra-ruta-verb">'+d.verb+'</span><span class="nostra-ruta-tag">'+d.tag+'</span></a>'}).join('')+'</div><h3 class="nostra-ruta-motto"><span>360 forma.</span> Power transforma. Élite perfecciona. Prime define. Talentum compite.</h3></div>';
    target.parentNode.insertBefore(sec,target);
  }

  function run(){
    addStyle();
    replaceText();
    updateSelects();
    detail();
    navNames();
    if(file==='index.html'||file===''||location.pathname==='/'||file==='ciclos.html')premiumBlock();
  }

  function start(){
    if(started)return;
    started=true;
    hidePreloaderSafe();
    run();
    [350,900,1600,2600,3800].forEach(function(ms){setTimeout(run,ms)});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.addEventListener('load',function(){run();hidePreloaderSafe()});
})();