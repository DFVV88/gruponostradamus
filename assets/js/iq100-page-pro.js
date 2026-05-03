(function(){
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='iq100.html')return;
  var WA='https://wa.me/51993750351?text=Hola%2C%20quiero%20informes%20sobre%20IQ100%20para%20preparaci%C3%B3n%20San%20Marcos.';
  var cycles={'ciclo-anual-uni.html':'Anual San Marcos','ciclo-semianual-uni.html':'Semianual San Marcos','ciclo-semestral-uni.html':'Semestral San Marcos','ciclo-elite-uni.html':'Élite San Marcos','ciclo-ien.html':'IEN San Marcos','ciclo-proyecto-escolar.html':'Proyecto Escolar San Marcos','ciclo-repaso-uni.html':'Repaso San Marcos','ciclo-paralelo-cepre-uni.html':'Paralelo CEPRE San Marcos','ciclo-verano-uni.html':'Verano San Marcos'};
  function addStyle(){
    if(document.getElementById('iq100-safe-style'))return;
    var s=document.createElement('style');
    s.id='iq100-safe-style';
    s.textContent='body.iq100-page-pro .menu-area{background:#fff!important}body.iq100-page-pro .main-menu a,body.iq100-page-pro .th-mobile-menu a{color:#061426!important;opacity:1!important;visibility:visible!important;font-weight:900!important;text-shadow:none!important}body.iq100-page-pro .sub-menu,body.iq100-page-pro .dropdown-menu{background:#fff!important;border:1px solid rgba(21,153,196,.24)!important}body.iq100-page-pro .sub-menu a,body.iq100-page-pro .dropdown-menu a{color:#061426!important;background:#fff!important;display:block!important}.iq100-cycle-name-badge{display:block!important;margin:0 0 10px!important;color:#061426!important;font-size:18px!important;font-weight:950!important;text-transform:uppercase!important;line-height:1.15!important}body.iq100-page-pro .iq100-wa-pro{background:linear-gradient(135deg,#f9a331,#f58220,#061426)!important;color:#fff!important}';
    document.head.appendChild(s);
  }
  function setCommercialLinks(){
    document.querySelectorAll('a[href]').forEach(function(a){
      var h=a.getAttribute('href')||'';
      var t=a.textContent||'';
      var commercial=/matric|inscrib|informes|brochure|plan/i.test(t);
      var oldPlatform=h.indexOf('gruponostradamus')>-1&&h.indexOf('q10')>-1;
      if(oldPlatform||h.indexOf('wa.link')>-1||commercial){
        a.setAttribute('href',WA);a.setAttribute('target','_blank');a.setAttribute('rel','noopener');a.classList.add('iq100-wa-pro');
      }
    });
  }
  function fixSede(){
    document.querySelectorAll('.main-menu li.menu-item-has-children,.th-mobile-menu li.menu-item-has-children').forEach(function(li){
      var a=li.querySelector(':scope > a');
      if(a&&/sede/i.test(a.textContent||'')){
        a.textContent='Sede';
        var sub=li.querySelector(':scope > ul.sub-menu')||document.createElement('ul');
        sub.className='sub-menu';
        sub.innerHTML='<li><a href="sedes.html">UNI</a></li>';
        if(!sub.parentElement)li.appendChild(sub);
      }
    });
  }
  function fixCycles(){
    document.querySelectorAll('.main-menu a,.th-mobile-menu a').forEach(function(a){var h=(a.getAttribute('href')||'').split('/').pop();if(cycles[h])a.textContent=cycles[h];});
    document.querySelectorAll('a[href]').forEach(function(a){var h=(a.getAttribute('href')||'').split('/').pop();var card=a.closest('.course-box2,.course-box,.blog-card,.price-card,.project-card,.service-card');if(card&&cycles[h]&&!card.querySelector('.iq100-cycle-name-badge')){var b=document.createElement('div');b.className='iq100-cycle-name-badge';b.textContent=cycles[h];var target=card.querySelector('.course-content,.blog-content,.price-card_content')||card;target.insertBefore(b,target.firstChild);}});
  }
  function fixText(){
    document.body.innerHTML=document.body.innerHTML.replace(/Universidad Nacional de Ingeniería/g,'Universidad Nacional Mayor de San Marcos').replace(/CEPRE UNI/g,'CEPRE San Marcos').replace(/Q10/g,'Microsoft 365');
  }
  function init(){document.body.classList.add('iq100-page-pro');addStyle();setCommercialLinks();fixSede();fixCycles();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();window.addEventListener('load',init);[500,1500,3000].forEach(function(t){setTimeout(init,t)});
})();
