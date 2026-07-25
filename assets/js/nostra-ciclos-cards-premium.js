/* ==================================================
   Grupo Nostradamus - Tarjetas premium para ciclos.html
   Capa visual independiente: no modifica Firebase ni enlaces.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (!/(?:^|\/)ciclos(?:\.html)?\/?$/.test(path)) return;
  if (document.getElementById('nostra-ciclos-cards-premium-style')) return;

  var style = document.createElement('style');
  style.id = 'nostra-ciclos-cards-premium-style';
  style.textContent = `
    #nostra-ciclos-catalog{
      --nc-navy:#061426;
      --nc-navy-2:#0a2a3c;
      --nc-cyan:#00c2d1;
      --nc-teal:#078c95;
      --nc-gold:#f4a51c;
    }

    #nostra-ciclos-catalog .nc-group{margin-bottom:56px!important;}
    #nostra-ciclos-catalog .nc-group__head{margin-bottom:22px!important;}
    #nostra-ciclos-catalog .nc-group__head>strong{
      padding:9px 14px!important;
      border:1px solid rgba(0,194,209,.18)!important;
      background:linear-gradient(135deg,#ffffff,#eaf9fb)!important;
      box-shadow:0 10px 25px rgba(6,20,38,.07)!important;
      color:#075b65!important;
    }

    #nostra-ciclos-catalog .nc-grid{
      gap:24px!important;
      align-items:stretch!important;
    }

    #nostra-ciclos-catalog .nc-card{
      --card-accent:#00c2d1;
      --card-accent-2:#078c95;
      position:relative!important;
      isolation:isolate!important;
      overflow:hidden!important;
      border:1px solid rgba(0,194,209,.24)!important;
      border-radius:28px!important;
      background:
        radial-gradient(circle at 92% 5%,color-mix(in srgb,var(--card-accent) 13%,transparent),transparent 28%),
        linear-gradient(180deg,#ffffff 0%,#f8fcfd 100%)!important;
      box-shadow:
        0 22px 55px rgba(6,20,38,.11),
        0 0 0 1px rgba(255,255,255,.9) inset,
        0 0 34px color-mix(in srgb,var(--card-accent) 10%,transparent)!important;
      transform:translateZ(0)!important;
      transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease!important;
    }

    #nostra-ciclos-catalog .nc-card::before{
      content:"";
      position:absolute;
      z-index:5;
      inset:0 auto 0 0;
      width:5px;
      background:linear-gradient(180deg,var(--card-accent),var(--card-accent-2),var(--nc-gold));
      box-shadow:0 0 20px color-mix(in srgb,var(--card-accent) 45%,transparent);
      pointer-events:none;
    }

    #nostra-ciclos-catalog .nc-card::after{
      content:"";
      position:absolute;
      z-index:0;
      width:210px;
      height:210px;
      right:-125px;
      top:95px;
      border-radius:50%;
      background:radial-gradient(circle,color-mix(in srgb,var(--card-accent) 16%,transparent),transparent 68%);
      pointer-events:none;
      transition:transform .4s ease,opacity .4s ease;
    }

    #nostra-ciclos-catalog .nc-card:hover{
      transform:translateY(-10px) scale(1.012)!important;
      border-color:color-mix(in srgb,var(--card-accent) 52%,transparent)!important;
      box-shadow:
        0 34px 72px rgba(6,20,38,.17),
        0 0 0 1px rgba(255,255,255,.92) inset,
        0 0 42px color-mix(in srgb,var(--card-accent) 18%,transparent)!important;
    }

    #nostra-ciclos-catalog .nc-card:hover::after{transform:scale(1.25);opacity:1;}

    #nostra-ciclos-catalog .nc-card[data-nc-card="nostra-360-uni"]{--card-accent:#00c2d1;--card-accent-2:#078c95;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="nostra-power-uni"]{--card-accent:#00aebc;--card-accent-2:#056e78;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="nostra-elite-uni"]{--card-accent:#f4b22f;--card-accent-2:#9f6b00;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="nostra-prime-uni"]{--card-accent:#3e78d8;--card-accent-2:#173f82;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="nostra-talentum-uni"]{--card-accent:#9f84ff;--card-accent-2:#5b3eb9;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="ciclo-ien"]{--card-accent:#22b982;--card-accent-2:#087553;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="proyecto-escolar"]{--card-accent:#ff8b3d;--card-accent-2:#b44c08;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="paralelo-cepre-uni"]{--card-accent:#18a8d8;--card-accent-2:#075d81;}
    #nostra-ciclos-catalog .nc-card[data-nc-card="ciclo-verano-uni"]{--card-accent:#f4a51c;--card-accent-2:#a75d00;}

    #nostra-ciclos-catalog .nc-card__top{
      position:relative!important;
      z-index:2!important;
      min-height:76px!important;
      padding:18px 19px 15px 23px!important;
      background:
        radial-gradient(circle at 88% 12%,color-mix(in srgb,var(--card-accent) 25%,transparent),transparent 34%),
        linear-gradient(135deg,#061426 0%,#09263a 62%,#063b43 100%)!important;
      border-bottom:1px solid rgba(255,255,255,.08)!important;
    }

    #nostra-ciclos-catalog .nc-card__top::after{
      content:"";
      position:absolute;
      inset:auto 0 0;
      height:2px;
      background:linear-gradient(90deg,var(--card-accent),transparent 72%);
      opacity:.9;
    }

    #nostra-ciclos-catalog .nc-order{
      width:40px!important;
      height:40px!important;
      border:1px solid rgba(255,255,255,.24)!important;
      border-radius:13px!important;
      background:linear-gradient(135deg,var(--card-accent),var(--card-accent-2))!important;
      box-shadow:0 10px 24px color-mix(in srgb,var(--card-accent) 28%,transparent),inset 0 1px 0 rgba(255,255,255,.3)!important;
      color:#fff!important;
      font-size:12px!important;
      letter-spacing:.5px!important;
    }

    #nostra-ciclos-catalog .nc-status{
      position:relative!important;
      padding:8px 12px 8px 26px!important;
      border:1px solid rgba(255,255,255,.14)!important;
      background:rgba(255,255,255,.09)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
      color:#fff!important;
      backdrop-filter:blur(10px)!important;
    }

    #nostra-ciclos-catalog .nc-status::before{
      content:"";
      position:absolute;
      left:11px;
      top:50%;
      width:7px;
      height:7px;
      border-radius:50%;
      background:#42e56f;
      box-shadow:0 0 11px rgba(66,229,111,.9);
      transform:translateY(-50%);
    }

    #nostra-ciclos-catalog .nc-card--paused .nc-status::before{background:#ffb53d;box-shadow:0 0 11px rgba(255,181,61,.9);}

    #nostra-ciclos-catalog .nc-card__body{
      position:relative!important;
      z-index:1!important;
      padding:23px 22px 22px 27px!important;
    }

    #nostra-ciclos-catalog .nc-kicker{
      display:inline-flex!important;
      align-items:center!important;
      width:max-content!important;
      max-width:100%!important;
      min-height:0!important;
      margin:0 0 12px!important;
      padding:7px 10px!important;
      border:1px solid color-mix(in srgb,var(--card-accent) 22%,transparent)!important;
      border-radius:999px!important;
      background:color-mix(in srgb,var(--card-accent) 9%,#fff)!important;
      color:var(--card-accent-2)!important;
      font-size:10.5px!important;
      line-height:1.2!important;
      letter-spacing:.35px!important;
    }

    #nostra-ciclos-catalog .nc-kicker::before{
      content:"";
      flex:0 0 auto;
      width:7px;
      height:7px;
      margin-right:7px;
      border-radius:50%;
      background:var(--card-accent);
      box-shadow:0 0 9px color-mix(in srgb,var(--card-accent) 55%,transparent);
    }

    #nostra-ciclos-catalog .nc-card h3{
      margin:0 0 10px!important;
      color:#061426!important;
      font-size:clamp(27px,2.35vw,34px)!important;
      font-weight:950!important;
      letter-spacing:-.55px!important;
      line-height:1!important;
    }

    #nostra-ciclos-catalog .nc-description{
      min-height:70px!important;
      margin-bottom:17px!important;
      color:#46586a!important;
      font-size:14.5px!important;
      line-height:1.62!important;
    }

    #nostra-ciclos-catalog .nc-ideal{
      position:relative!important;
      margin-bottom:17px!important;
      padding:15px 15px 15px 18px!important;
      border:1px solid rgba(7,140,149,.13)!important;
      border-radius:18px!important;
      background:
        linear-gradient(135deg,rgba(255,255,255,.92),rgba(240,249,251,.94))!important;
      box-shadow:0 12px 26px rgba(6,20,38,.055),inset 4px 0 0 var(--card-accent)!important;
    }

    #nostra-ciclos-catalog .nc-ideal span{
      margin-bottom:6px!important;
      color:var(--card-accent-2)!important;
      letter-spacing:.55px!important;
    }

    #nostra-ciclos-catalog .nc-ideal strong{
      color:#1d3044!important;
      font-size:12.7px!important;
      line-height:1.5!important;
    }

    #nostra-ciclos-catalog .nc-meta{gap:11px!important;margin-bottom:17px!important;}

    #nostra-ciclos-catalog .nc-meta>div{
      position:relative!important;
      min-height:82px!important;
      padding:14px 12px 12px 48px!important;
      border:1px solid rgba(7,140,149,.13)!important;
      border-radius:18px!important;
      background:linear-gradient(145deg,#ffffff,#f4fafb)!important;
      box-shadow:0 10px 22px rgba(6,20,38,.05)!important;
    }

    #nostra-ciclos-catalog .nc-meta>div::before{
      position:absolute;
      left:13px;
      top:14px;
      display:grid;
      place-items:center;
      width:27px;
      height:27px;
      border-radius:9px;
      background:linear-gradient(135deg,var(--card-accent),var(--card-accent-2));
      box-shadow:0 8px 17px color-mix(in srgb,var(--card-accent) 22%,transparent);
      color:#fff;
      font-size:10px;
      font-weight:950;
    }

    #nostra-ciclos-catalog .nc-meta>div:first-child::before{content:"IN";}
    #nostra-ciclos-catalog .nc-meta>div:last-child::before{content:"DU";}

    #nostra-ciclos-catalog .nc-meta small{
      margin-bottom:4px!important;
      color:#748495!important;
      letter-spacing:.55px!important;
    }

    #nostra-ciclos-catalog .nc-meta strong{
      color:#061426!important;
      font-size:13px!important;
      font-weight:900!important;
      line-height:1.35!important;
    }

    #nostra-ciclos-catalog .nc-plans-head{
      margin-top:auto!important;
      padding-top:3px!important;
    }

    #nostra-ciclos-catalog .nc-plans-head span{
      color:#061426!important;
      letter-spacing:.45px!important;
    }

    #nostra-ciclos-catalog .nc-plans-head small{
      padding:5px 8px!important;
      border-radius:999px!important;
      background:#eef7f8!important;
      color:#536b79!important;
    }

    #nostra-ciclos-catalog .nc-chips{gap:8px!important;margin-top:10px!important;}

    #nostra-ciclos-catalog .nc-chip{
      position:relative!important;
      padding:8px 12px 8px 24px!important;
      border:1px solid color-mix(in srgb,var(--card-accent) 20%,transparent)!important;
      background:color-mix(in srgb,var(--card-accent) 9%,#fff)!important;
      color:var(--card-accent-2)!important;
      box-shadow:0 7px 16px color-mix(in srgb,var(--card-accent) 8%,transparent)!important;
      font-size:10.5px!important;
    }

    #nostra-ciclos-catalog .nc-chip::before{
      content:"";
      position:absolute;
      left:10px;
      top:50%;
      width:6px;
      height:6px;
      border-radius:50%;
      background:var(--card-accent);
      box-shadow:0 0 8px color-mix(in srgb,var(--card-accent) 52%,transparent);
      transform:translateY(-50%);
    }

    #nostra-ciclos-catalog .nc-chip--muted{padding-left:12px!important;background:#f2f4f5!important;color:#67717d!important;border-color:#e3e8ea!important;}
    #nostra-ciclos-catalog .nc-chip--muted::before{display:none;}

    #nostra-ciclos-catalog .nc-actions{
      position:relative!important;
      z-index:2!important;
      gap:11px!important;
      padding:17px 18px 19px 23px!important;
      border-top:1px solid rgba(255,255,255,.08)!important;
      background:
        radial-gradient(circle at 85% 20%,color-mix(in srgb,var(--card-accent) 19%,transparent),transparent 35%),
        linear-gradient(135deg,#061426,#09283a 64%,#063b43)!important;
    }

    #nostra-ciclos-catalog .nc-btn{
      position:relative!important;
      overflow:hidden!important;
      min-height:48px!important;
      border-radius:16px!important;
      font-size:12px!important;
      letter-spacing:.15px!important;
      transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important;
    }

    #nostra-ciclos-catalog .nc-btn--details{
      border:1px solid rgba(255,255,255,.18)!important;
      background:rgba(255,255,255,.08)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
      color:#fff!important;
      backdrop-filter:blur(8px)!important;
    }

    #nostra-ciclos-catalog .nc-btn--details:hover{
      border-color:color-mix(in srgb,var(--card-accent) 70%,#fff)!important;
      background:rgba(255,255,255,.13)!important;
      box-shadow:0 12px 24px color-mix(in srgb,var(--card-accent) 16%,transparent)!important;
    }

    #nostra-ciclos-catalog .nc-btn--pre{
      border:1px solid rgba(255,255,255,.26)!important;
      background:linear-gradient(135deg,#f4a51c 0%,var(--card-accent) 47%,var(--card-accent-2) 75%,#061426 100%)!important;
      box-shadow:0 13px 28px color-mix(in srgb,var(--card-accent) 26%,transparent),inset 0 1px 0 rgba(255,255,255,.28)!important;
      color:#fff!important;
    }

    #nostra-ciclos-catalog .nc-btn--pre::after{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(110deg,transparent 15%,rgba(255,255,255,.34) 45%,transparent 70%);
      transform:translateX(-135%);
      transition:transform .55s ease;
    }

    #nostra-ciclos-catalog .nc-btn--pre:hover::after{transform:translateX(135%);}
    #nostra-ciclos-catalog .nc-btn:hover{transform:translateY(-3px)!important;}

    #nostra-ciclos-catalog .nc-card--focus{
      border-color:var(--card-accent)!important;
      box-shadow:0 0 0 5px color-mix(in srgb,var(--card-accent) 17%,transparent),0 34px 72px rgba(6,20,38,.18)!important;
    }

    @media(max-width:1199px){
      #nostra-ciclos-catalog .nc-card h3{font-size:30px!important;}
    }

    @media(max-width:700px){
      #nostra-ciclos-catalog .nc-grid{gap:19px!important;}
      #nostra-ciclos-catalog .nc-card{border-radius:23px!important;}
      #nostra-ciclos-catalog .nc-card__top{min-height:68px!important;padding:15px 15px 13px 20px!important;}
      #nostra-ciclos-catalog .nc-card__body{padding:20px 17px 19px 22px!important;}
      #nostra-ciclos-catalog .nc-card h3{font-size:28px!important;}
      #nostra-ciclos-catalog .nc-description{min-height:0!important;}
      #nostra-ciclos-catalog .nc-meta>div{min-height:72px!important;}
      #nostra-ciclos-catalog .nc-actions{padding:15px 15px 17px 20px!important;}
    }

    @media(prefers-reduced-motion:reduce){
      #nostra-ciclos-catalog .nc-card,
      #nostra-ciclos-catalog .nc-btn,
      #nostra-ciclos-catalog .nc-card::after{transition:none!important;}
      #nostra-ciclos-catalog .nc-btn--pre::after{display:none!important;}
    }
  `;
  document.head.appendChild(style);
})();
