/* Grupo Nostradamus - Mejora visual del bloque de orientación del index */
(function(){
  'use strict';
  var path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(!(path==='index.html'||path===''||location.pathname==='/'))return;

  function addStyle(){
    if(document.getElementById('nostra-index-contacto-v2-style'))return;
    var style=document.createElement('style');
    style.id='nostra-index-contacto-v2-style';
    style.textContent=`
      #contacto.nostra-contact-section{padding:72px 0!important;background:radial-gradient(circle at 8% 12%,rgba(0,194,209,.13),transparent 29%),radial-gradient(circle at 92% 86%,rgba(255,181,57,.11),transparent 25%),linear-gradient(180deg,#f7fcfd 0%,#eef8fa 100%)!important;isolation:isolate!important}
      #contacto.nostra-contact-section:before{background-image:linear-gradient(rgba(0,139,150,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,139,150,.04) 1px,transparent 1px);background-size:46px 46px}
      #contacto .nostra-contact-shell{width:min(1240px,92%);grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);border-radius:32px;border-color:rgba(0,139,150,.12);box-shadow:0 28px 74px rgba(6,20,38,.12),0 0 34px rgba(0,194,209,.06)}
      #contacto .nostra-contact-media{min-height:610px;padding:0;background:linear-gradient(155deg,#075861 0%,#0b9eaa 46%,#12b8c4 100%);align-items:flex-end;isolation:isolate}
      #contacto .nostra-contact-media:before{inset:0;z-index:2;border:0;border-radius:0;background:linear-gradient(180deg,rgba(4,38,48,.2) 0%,rgba(4,38,48,0) 36%,rgba(3,26,34,.08) 62%,rgba(3,22,29,.67) 100%)}
      #contacto .nostra-contact-media:after{content:'';position:absolute;inset:18px;z-index:3;border:1px solid rgba(255,255,255,.28);border-radius:24px;pointer-events:none}
      #contacto .nostra-contact-media img{position:absolute!important;z-index:1;inset:0;width:100%;height:100%!important;max-height:none!important;object-fit:cover!important;object-position:center 82%!important;border-radius:0!important;background:transparent!important;transform:scale(1.28);transform-origin:center 82%;filter:saturate(1.04) contrast(1.02)}
      #contacto .nostra-contact-media-tag{position:absolute;top:34px;left:34px;z-index:4;display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border-radius:999px;background:rgba(6,20,38,.72);border:1px solid rgba(255,255,255,.22);box-shadow:0 12px 28px rgba(6,20,38,.18);backdrop-filter:blur(8px);color:#fff;font-size:11.5px;font-weight:900;text-transform:uppercase;letter-spacing:.65px}
      #contacto .nostra-contact-media-tag:before{content:'';width:8px;height:8px;border-radius:50%;background:#ffd36a;box-shadow:0 0 0 4px rgba(255,211,106,.18)}
      #contacto .nostra-contact-badge{left:28px;right:28px;bottom:28px;z-index:4;padding:14px 16px;border-radius:17px;background:rgba(6,20,38,.86)}
      #contacto .nostra-contact-badge__ico{width:43px;height:43px;flex-basis:43px;border-radius:14px;font-size:19px}
      #contacto .nostra-contact-badge strong{font-size:15.5px}
      #contacto .nostra-contact-badge span{font-size:12px}
      #contacto .nostra-contact-content{padding:46px clamp(30px,3.7vw,56px) 44px}
      #contacto .nostra-contact-kicker{padding:8px 12px;font-size:11.5px;letter-spacing:.62px}
      #contacto .nostra-contact-title{margin:16px 0 12px!important;font-size:clamp(36px,3.25vw,48px)!important;line-height:.98!important;letter-spacing:-1.05px!important}
      #contacto .nostra-contact-title span{display:block}
      #contacto .nostra-contact-title .nostra-contact-title-accent{margin-top:4px;color:#008b96!important}
      #contacto .nostra-contact-lead{margin:0 0 20px!important;font-size:15.5px!important;line-height:1.55!important}
      #contacto .nostra-contact-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 22px}
      #contacto .nostra-contact-point{display:flex;align-items:flex-start;gap:8px;padding:0;border:0;border-radius:0;background:transparent;font-size:12.25px;line-height:1.35}
      #contacto .nostra-contact-point:before{width:20px;height:20px;flex:0 0 20px;margin-top:-1px;box-shadow:0 5px 12px rgba(0,139,150,.16)}
      #contacto .nostra-quick-form{gap:12px}
      #contacto .nostra-quick-field label{margin-bottom:6px;font-size:11.5px}
      #contacto .nostra-quick-field input,#contacto .nostra-quick-field select{height:50px;padding:0 14px;border-radius:13px;font-size:14px}
      #contacto .nostra-quick-actions{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.85fr);gap:10px;margin-top:3px}
      #contacto .nostra-quick-submit,#contacto .nostra-quick-pre{min-height:52px;padding:12px 16px;border-radius:13px;font-size:12.5px;text-align:center}
      #contacto .nostra-quick-submit{background:linear-gradient(135deg,#16c763 0%,#079b4d 55%,#056d3c 100%);box-shadow:0 14px 28px rgba(7,155,77,.22)}
      #contacto .nostra-contact-note{font-size:11.5px!important;line-height:1.42!important}
      @media(max-width:1100px){
        #contacto .nostra-contact-shell{grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr)}
        #contacto .nostra-contact-content{padding-left:32px;padding-right:32px}
        #contacto .nostra-contact-title{font-size:40px!important}
        #contacto .nostra-contact-points{grid-template-columns:1fr 1fr}
        #contacto .nostra-contact-point:last-child{grid-column:1/-1}
      }
      @media(max-width:991px){
        #contacto .nostra-contact-shell{grid-template-columns:1fr;max-width:760px}
        #contacto .nostra-contact-media{min-height:420px;padding:0}
        #contacto .nostra-contact-media img{height:100%!important;object-position:center 80%!important;transform:scale(1.17)}
        #contacto .nostra-contact-content{padding:42px 38px 40px}
        #contacto .nostra-contact-points{grid-template-columns:repeat(3,minmax(0,1fr))}
        #contacto .nostra-contact-point:last-child{grid-column:auto}
      }
      @media(max-width:767px){
        #contacto.nostra-contact-section{padding:50px 0!important}
        #contacto .nostra-contact-shell{width:min(94%,620px);border-radius:24px}
        #contacto .nostra-contact-media{min-height:340px;padding:0}
        #contacto .nostra-contact-media:after{inset:10px;border-radius:18px}
        #contacto .nostra-contact-media img{object-position:center 82%!important;transform:scale(1.16)}
        #contacto .nostra-contact-media-tag{top:18px;left:18px;padding:8px 11px;font-size:10.5px}
        #contacto .nostra-contact-badge{position:absolute;left:16px;right:16px;bottom:16px;width:auto;margin:0;padding:12px 13px}
        #contacto .nostra-contact-badge__ico{width:39px;height:39px;flex-basis:39px;border-radius:12px}
        #contacto .nostra-contact-badge strong{font-size:14px}
        #contacto .nostra-contact-badge span{font-size:11px}
        #contacto .nostra-contact-content{padding:34px 20px 31px}
        #contacto .nostra-contact-title{font-size:34px!important;line-height:1.01!important;letter-spacing:-.75px!important}
        #contacto .nostra-contact-lead{font-size:14.5px!important;margin-bottom:18px!important}
        #contacto .nostra-contact-points{grid-template-columns:1fr;gap:9px;margin-bottom:20px}
        #contacto .nostra-contact-point:last-child{grid-column:auto}
        #contacto .nostra-quick-actions{grid-template-columns:1fr}
      }
      @media(max-width:420px){
        #contacto .nostra-contact-media{min-height:310px}
        #contacto .nostra-contact-media-tag{max-width:calc(100% - 36px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #contacto .nostra-contact-title{font-size:31px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function setText(selector,text){
    var el=document.querySelector(selector);
    if(el&&el.textContent!==text)el.textContent=text;
  }

  function patch(){
    addStyle();
    var section=document.getElementById('contacto');
    if(!section)return false;
    var media=section.querySelector('.nostra-contact-media');
    var content=section.querySelector('.nostra-contact-content');
    if(!media||!content)return false;

    if(!media.querySelector('.nostra-contact-media-tag')){
      var tag=document.createElement('span');
      tag.className='nostra-contact-media-tag';
      tag.textContent='Comunidad Nostradamus · 16 años';
      media.appendChild(tag);
    }

    var title=content.querySelector('.nostra-contact-title');
    if(title)title.innerHTML='<span>Da el siguiente paso</span><span class="nostra-contact-title-accent">hacia tu vacante UNI</span>';

    setText('#contacto .nostra-contact-lead','Cuéntanos tu nivel y modalidad. Nuestro equipo te recomendará el programa que mejor se ajusta a tu preparación y fecha de examen.');

    var points=content.querySelectorAll('.nostra-contact-point');
    var pointCopy=['Recomendación según tu nivel','Programas presenciales y virtuales','Respuesta rápida por WhatsApp'];
    points.forEach(function(point,index){if(pointCopy[index])point.textContent=pointCopy[index];});

    setText('#contacto .nostra-contact-badge strong','Una preparación con dirección');
    setText('#contacto .nostra-contact-badge strong + span','Método, exigencia y acompañamiento académico.');
    setText('#contacto .nostra-quick-submit','💬 Recibir orientación por WhatsApp');
    setText('#contacto .nostra-quick-pre','📝 Completar preinscripción');
    setText('#contacto .nostra-contact-note','Tus datos se enviarán por WhatsApp para continuar la orientación. No compartimos tu información con terceros.');

    var phone=content.querySelector('#number');
    if(phone)phone.setAttribute('minlength','9');

    section.setAttribute('data-nostra-contact-v2','1');
    return true;
  }

  function start(){
    patch();
    [180,500,1000,1800,3000].forEach(function(delay){window.setTimeout(patch,delay);});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  window.addEventListener('load',patch,{once:true});
})();