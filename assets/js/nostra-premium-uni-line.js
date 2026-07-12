/* Grupo Nostradamus - Nueva línea premium Nostra UNI */
(function(){
  var file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  var map={
    'ciclo-anual-uni.html':{n:'Nostra 360 UNI',c:'360 UNI',tag:'Preparación integral. Formación completa. Mentalidad de ingreso.',d:'Nostra 360 UNI está diseñado para estudiantes que necesitan desarrollar una preparación completa desde las bases hasta alcanzar el nivel exigido por la Universidad Nacional de Ingeniería. Fortalece conocimientos, disciplina, razonamiento, hábitos de estudio y capacidad para resolver problemas de alta exigencia.',ideal:'Domina cada área, fortalece tu nivel y transforma tu preparación.'},
    'ciclo-semianual-uni.html':{n:'Nostra Power UNI',c:'Power UNI',tag:'Corrige tus errores. Potencia tu nivel. Vuelve más fuerte.',d:'Nostra Power UNI está dirigido a estudiantes que ya tuvieron una preparación anterior, pero todavía no alcanzaron el resultado esperado. Identifica fallas, corrige debilidades, fortalece conocimientos y desarrolla una estrategia académica mucho más efectiva.',ideal:'Convierte tus intentos anteriores en la fuerza que te llevará hacia tu vacante.'},
    'ciclo-semestral-uni.html':{n:'Nostra Élite UNI',c:'Élite UNI',tag:'Estuviste cerca. Ahora ve por tu vacante.',d:'Nostra Élite UNI es un programa de alto rendimiento para postulantes que ya rindieron el examen de admisión, alcanzaron un nivel competitivo y quedaron a pocos puntos de ingresar. Trabaja velocidad, precisión, estrategia, manejo del tiempo y reducción de errores bajo presión.',ideal:'Cuando estar cerca ya no es suficiente.'},
    'ciclo-repaso-uni.html':{n:'Nostra Prime UNI',c:'Prime UNI',tag:'Tu máximo nivel. Tu momento decisivo.',d:'Nostra Prime UNI está diseñado para postulantes en la etapa final antes del examen. Cada clase, simulacro y problema tiene un objetivo preciso: llegar al examen con velocidad, seguridad, estrategia y máxima concentración.',ideal:'No llegues solamente preparado. Llega en tu máximo nivel.'},
    'ciclo-elite-uni.html':{n:'Nostra Talentum UNI',c:'Talentum UNI',tag:'Talento superior. Exigencia máxima. Rendimiento extraordinario.',d:'Nostra Talentum UNI es un programa especializado para estudiantes con nivel académico sobresaliente, preparados para competir por los primeros lugares del examen de admisión UNI. Desarrolla velocidad, precisión, estrategia, dominio de problemas de alta complejidad y respuesta bajo máxima exigencia.',ideal:'Donde el talento compite por los primeros lugares.'}
  };
  var routes=['ciclo-anual-uni.html','ciclo-semianual-uni.html','ciclo-semestral-uni.html','ciclo-repaso-uni.html','ciclo-elite-uni.html'];
  var reps=[
    ['CICLO ANUAL UNI','Nostra 360 UNI'],['Ciclo Anual UNI','Nostra 360 UNI'],['Anual UNI','Nostra 360 UNI'],
    ['CICLO SEMIANUAL UNI','Nostra Power UNI'],['Ciclo Semianual UNI','Nostra Power UNI'],['Semianual UNI','Nostra Power UNI'],
    ['CICLO SEMESTRAL UNI','Nostra Élite UNI'],['Ciclo Semestral UNI','Nostra Élite UNI'],['Semestral UNI','Nostra Élite UNI'],
    ['CICLO REPASO UNI','Nostra Prime UNI'],['Ciclo Repaso UNI','Nostra Prime UNI'],['Ciclo repaso UNI','Nostra Prime UNI'],['Repaso UNI','Nostra Prime UNI'],
    ['CICLO ÉLITE UNI','Nostra Talentum UNI'],['Ciclo Élite UNI','Nostra Talentum UNI'],['Ciclo Elite UNI','Nostra Talentum UNI'],['Élite UNI','Nostra Talentum UNI'],['Elite UNI','Nostra Talentum UNI']
  ];
  function meta(name,val){var m=document.querySelector('meta[name="'+name+'"]');if(!m){m=document.createElement('meta');m.name=name;document.head.appendChild(m)}m.content=val}
  function wa(name){return 'https://wa.me/51993750351?text='+encodeURIComponent('Hola Nostradamus, quiero informes sobre '+name+'.')}
  function replaceText(){
    if(!document.body)return;
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentElement;if(!p||/script|style|textarea|input/i.test(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}}),nodes=[];
    while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(function(n){var v=n.nodeValue;reps.forEach(function(r){v=v.split(r[0]).join(r[1])});n.nodeValue=v});
  }
  function updateSelects(){document.querySelectorAll('select[name="ciclo"]').forEach(function(s){var keep=['Nostra 360 UNI','Nostra Power UNI','Nostra Élite UNI','Nostra Prime UNI','Nostra Talentum UNI','Ciclo IEN','Paralelo CEPRE UNI','Ciclo Verano UNI','NostraMÓDULOS','Proyecto Escolar'];s.innerHTML='<option value="">Seleccionar programa</option>'+keep.map(function(x){return '<option>'+x+'</option>'}).join('')})}
  function schema(d){var old=document.getElementById('nostra-schema-course');if(old)old.remove();var sc=document.createElement('script');sc.type='application/ld+json';sc.id='nostra-schema-course';sc.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Course','name':d.n,'description':d.d+' '+d.ideal,'provider':{'@type':'EducationalOrganization','name':'Grupo Nostradamus'},'educationalLevel':'Preuniversitario','inLanguage':'es-PE','url':location.href});document.head.appendChild(sc)}
  function detail(){
    var d=map[file];if(!d)return;
    document.title=d.n+' | Grupo Nostradamus Premium';
    meta('description',d.d+' '+d.ideal);meta('keywords','Grupo Nostradamus Premium, '+d.n+', preparación UNI, ruta Nostra UNI, academia UNI, simulacros UNI');
    ['.breadcumb-title','.course-title','h1.breadcumb-title','.breadcumb-content h1'].forEach(function(sel){document.querySelectorAll(sel).forEach(function(e){e.textContent=d.n})});
    document.querySelectorAll('.breadcumb-menu li,.breadcumb-menu a,.breadcumb-menu span').forEach(function(e){reps.forEach(function(r){if((e.textContent||'').indexOf(r[0])!==-1)e.textContent=(e.textContent||'').split(r[0]).join(r[1])})});
    var p=document.querySelector('.course-description p');if(p)p.innerHTML=d.d+'<br><br><strong>'+d.tag+'</strong><span class="nostra-cycle-ideal"> '+d.ideal+'</span>';
    var h=document.querySelector('.nostra-cycle-hero__title');if(h)h.textContent=d.tag;
    var ht=document.querySelector('.nostra-cycle-hero__text');if(ht)ht.textContent=d.d;
    document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){if((a.textContent||'').toLowerCase().indexOf('informes')>-1)a.href=wa(d.n)});
    schema(d);
  }
  function navNames(){routes.forEach(function(r){var d=map[r];document.querySelectorAll('a[href$="'+r+'"]').forEach(function(a){a.textContent=d.n})})}
  function premiumBlock(){if(document.getElementById('nostra-ruta-premium'))return;var target=document.querySelector('#course-sec,.course-area,.space');if(!target)return;var sec=document.createElement('section');sec.id='nostra-ruta-premium';sec.className='space';sec.style.cssText='background:linear-gradient(135deg,#061426,#083044 55%,#008b96);color:#fff';sec.innerHTML='<div class="container text-center"><span class="sub-title" style="color:#a8f7ff!important">Nueva línea premium Nostra UNI</span><h2 class="sec-title" style="color:#fff">La Ruta Nostra UNI</h2><p style="max-width:900px;margin:16px auto 28px;color:rgba(255,255,255,.86);font-size:18px">No todos los postulantes comienzan desde el mismo punto. En Grupo Nostradamus identificamos su nivel, entendemos su historia y le asignamos el programa que realmente necesita.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;text-align:left">'+routes.map(function(r){var d=map[r];return '<a href="'+r+'" style="display:block;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);border-radius:22px;padding:18px;color:#fff;text-decoration:none"><b style="font-size:20px">'+d.n+'</b><small style="display:block;margin-top:8px;color:#a8f7ff;font-weight:800">'+d.tag+'</small></a>'}).join('')+'</div><h3 style="margin-top:28px;color:#fff">360 forma. Power transforma. Élite perfecciona. Prime define. Talentum compite.</h3></div>';target.parentNode.insertBefore(sec,target)}
  function run(){replaceText();updateSelects();detail();navNames();if(file==='index.html'||file===''||file==='ciclos.html')premiumBlock()}
  function start(){run();var n=0,t=setInterval(function(){run();if(++n>80)clearInterval(t)},100);try{new MutationObserver(function(){run()}).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();window.addEventListener('load',start);
})();