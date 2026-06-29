/* ==================================================
   Grupo Nostradamus - Slide 2 YouTube fix
   Detecta el slide del video y muestra miniatura completa.
================================================== */
(function(){
  var VIDEO_ID='Gi-ZXzQSIDI';

  function heroHeight(){
    if(window.innerWidth<=430) return 390;
    if(window.innerWidth<=767) return 430;
    if(window.innerWidth<=991) return 520;
    return 620;
  }

  function markVideoSlide(){
    document.querySelectorAll('#hero .th-hero-slide').forEach(function(slide){
      if(slide.querySelector('.contenido-min-slider-tovideo,.contenido-max-slider.contenido-min-slider-tovideo,.frame-video')){
        slide.classList.add('nostra-video-slide-fix');
      }
    });
  }

  function injectCss(){
    var old=document.getElementById('nostra-video-slide-2-zoom-fix-style');
    if(old) old.remove();
    var s=document.createElement('style');
    s.id='nostra-video-slide-2-zoom-fix-style';
    s.textContent=`
      #hero.nostra-video-active,#hero.nostra-video-active .hero-6,#hero.nostra-video-active #heroSlide6,#hero.nostra-video-active .slick-list,#hero.nostra-video-active .slick-track,#hero.nostra-video-active .slick-slide,#hero.nostra-video-active .slick-slide>div,#hero.nostra-video-active .nostra-video-slide-fix,#hero.nostra-video-active .nostra-video-slide-fix .th-hero-bg,#hero.nostra-video-active .nostra-video-slide-fix .img-min-slider,#hero.nostra-video-active .nostra-video-slide-fix .container{min-height:620px!important;height:620px!important;max-height:620px!important;overflow:hidden!important;}
      #hero .nostra-video-slide-fix .th-hero-bg,#hero .nostra-video-slide-fix .img-min-slider{background-size:cover!important;background-position:center 22%!important;background-repeat:no-repeat!important;}
      #hero .nostra-video-slide-fix .container{width:100%!important;max-width:none!important;margin:0!important;padding:0 24px!important;display:flex!important;align-items:flex-start!important;justify-content:center!important;position:relative!important;}
      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo,#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:translateY(76px)!important;width:min(680px,62vw)!important;max-width:680px!important;margin:0 auto!important;padding:0!important;min-height:auto!important;height:auto!important;z-index:30!important;display:block!important;}
      #hero .nostra-video-slide-fix .contenido-min-slider-tovideo>iframe,#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo>iframe,#hero .nostra-video-slide-fix .contenido-min-slider-tovideo>a:not(.nostra-video-thumb-restore),#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo>a:not(.nostra-video-thumb-restore){display:none!important;}
      #hero .nostra-video-thumb-restore{position:relative!important;display:block!important;width:100%!important;aspect-ratio:16/9!important;border-radius:22px!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.35)!important;box-shadow:0 22px 60px rgba(0,0,0,.44)!important;background:#000!important;}
      #hero .nostra-video-thumb-restore img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;}
      #hero .nostra-video-thumb-restore .play{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:88px!important;height:62px!important;border-radius:18px!important;background:#f00!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:34px!important;font-weight:bold!important;z-index:5!important;}
      @media(max-width:991px){#hero.nostra-video-active,#hero.nostra-video-active .hero-6,#hero.nostra-video-active #heroSlide6,#hero.nostra-video-active .slick-list,#hero.nostra-video-active .slick-track,#hero.nostra-video-active .slick-slide,#hero.nostra-video-active .slick-slide>div,#hero.nostra-video-active .nostra-video-slide-fix,#hero.nostra-video-active .nostra-video-slide-fix .th-hero-bg,#hero.nostra-video-active .nostra-video-slide-fix .img-min-slider,#hero.nostra-video-active .nostra-video-slide-fix .container{min-height:520px!important;height:520px!important;max-height:520px!important}#hero .nostra-video-slide-fix .contenido-min-slider-tovideo,#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{width:min(600px,82vw)!important;max-width:600px!important;transform:translateY(58px)!important;}}
      @media(max-width:767px){#hero.nostra-video-active,#hero.nostra-video-active .hero-6,#hero.nostra-video-active #heroSlide6,#hero.nostra-video-active .slick-list,#hero.nostra-video-active .slick-track,#hero.nostra-video-active .slick-slide,#hero.nostra-video-active .slick-slide>div,#hero.nostra-video-active .nostra-video-slide-fix,#hero.nostra-video-active .nostra-video-slide-fix .th-hero-bg,#hero.nostra-video-active .nostra-video-slide-fix .img-min-slider,#hero.nostra-video-active .nostra-video-slide-fix .container{min-height:430px!important;height:430px!important;max-height:430px!important}#hero .nostra-video-slide-fix .th-hero-bg,#hero .nostra-video-slide-fix .img-min-slider{background-size:185% auto!important;background-position:center 18%!important}#hero .nostra-video-slide-fix .container{padding:0 14px!important}#hero .nostra-video-slide-fix .contenido-min-slider-tovideo,#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo{width:calc(100vw - 28px)!important;max-width:430px!important;transform:translateY(-10px)!important}#hero .nostra-video-thumb-restore{border-radius:16px!important}#hero .nostra-video-thumb-restore .play{width:72px!important;height:52px!important;font-size:28px!important}}
      @media(max-width:430px){#hero.nostra-video-active,#hero.nostra-video-active .hero-6,#hero.nostra-video-active #heroSlide6,#hero.nostra-video-active .slick-list,#hero.nostra-video-active .slick-track,#hero.nostra-video-active .slick-slide,#hero.nostra-video-active .slick-slide>div,#hero.nostra-video-active .nostra-video-slide-fix,#hero.nostra-video-active .nostra-video-slide-fix .th-hero-bg,#hero.nostra-video-active .nostra-video-slide-fix .img-min-slider,#hero.nostra-video-active .nostra-video-slide-fix .container{min-height:390px!important;height:390px!important;max-height:390px!important}}
    `;
    document.head.appendChild(s);
  }

  function makeThumb(){
    var a=document.createElement('a');
    a.className='nostra-video-thumb-restore frame-video';
    a.href='https://youtu.be/'+VIDEO_ID;
    a.target='_blank';
    a.rel='noopener noreferrer';
    var img=document.createElement('img');
    img.src='https://img.youtube.com/vi/'+VIDEO_ID+'/maxresdefault.jpg';
    img.alt='Video institucional Grupo Nostradamus';
    img.onerror=function(){img.src='https://img.youtube.com/vi/'+VIDEO_ID+'/hqdefault.jpg';};
    var play=document.createElement('div');
    play.className='play';
    play.innerHTML='▶';
    a.appendChild(img);
    a.appendChild(play);
    return a;
  }

  function restore(){
    markVideoSlide();
    document.querySelectorAll('#hero .nostra-video-slide-fix .contenido-min-slider-tovideo,#hero .nostra-video-slide-fix .contenido-max-slider.contenido-min-slider-tovideo').forEach(function(box){
      box.querySelectorAll('iframe').forEach(function(x){x.remove();});
      box.querySelectorAll('.nostra-video-thumb-restore').forEach(function(t,i){if(i>0)t.remove();});
      if(!box.querySelector('.nostra-video-thumb-restore')) box.appendChild(makeThumb());
    });
  }

  function state(){
    var hero=document.getElementById('hero');
    var slider=document.getElementById('heroSlide6');
    if(!hero||!slider)return;
    markVideoSlide();
    var current=slider.querySelector('.slick-current');
    var isVideo=current&&current.classList.contains('nostra-video-slide-fix');
    hero.classList.toggle('nostra-video-active',!!isVideo);
    var list=slider.querySelector('.slick-list');
    var track=slider.querySelector('.slick-track');
    if(isVideo){var px=heroHeight()+'px';if(list)list.style.height=px;if(track)track.style.height=px;}
    else{if(list)list.style.height='';if(track)track.style.height='';}
  }

  function refresh(){
    markVideoSlide();
    restore();
    state();
    if(!window.jQuery)return;
    var sl=window.jQuery('#heroSlide6');
    if(sl.length&&sl.hasClass('slick-initialized')){try{sl.slick('setPosition');}catch(e){}}
  }

  function bind(){
    if(!window.jQuery)return;
    var sl=window.jQuery('#heroSlide6');
    if(!sl.length||sl.data('nostraVideoFinalBound'))return;
    sl.data('nostraVideoFinalBound',true);
    sl.on('init afterChange setPosition',function(){setTimeout(refresh,40);});
  }

  function init(){markVideoSlide();injectCss();bind();refresh();setTimeout(refresh,300);setTimeout(refresh,900);setTimeout(refresh,1600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.addEventListener('load',init);
  window.addEventListener('resize',refresh);
})();