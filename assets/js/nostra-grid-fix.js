/* ==================================================
   Grupo Nostradamus - Grilla de ciclos optimizada
   Mantiene 3 ciclos por fila en escritorio y 1 en celular.
   Evita observadores permanentes y recálculos continuos.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var file = path.split('/').pop() || 'index.html';
  var isHome = path === '/' || file === 'index.html' || file === '';
  if (!isHome) return;

  var resizeTimer = 0;
  var repairObserver = null;

  function getColumns() {
    return window.innerWidth >= 768 ? 'repeat(3,minmax(0,1fr))' : '1fr';
  }

  function injectCourseGridCSS() {
    if (document.getElementById('nostra-course-grid-force-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-course-grid-force-style';
    style.textContent = `
      #course-sec .container{max-width:1320px!important;}
      #course-sec .filter-active,
      #course-sec .filter-active.nostra-course-grid-fixed{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:22px!important;
        height:auto!important;
        position:relative!important;
        align-items:stretch!important;
        width:100%!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      #course-sec .filter-active::before,
      #course-sec .filter-active::after{content:none!important;display:none!important;}
      #course-sec .filter-active>.filter-item{
        position:relative!important;
        inset:auto!important;
        transform:none!important;
        width:100%!important;
        max-width:100%!important;
        flex:unset!important;
        padding:0!important;
        margin:0!important;
        display:block!important;
      }
      #course-sec .course-box2{
        width:100%!important;
        height:100%!important;
        display:flex!important;
        flex-direction:column!important;
      }
      #course-sec .course-img img{
        width:100%!important;
        height:190px!important;
        object-fit:cover!important;
      }
      #course-sec .course-content{flex:1!important;padding:18px 14px 20px!important;}
      #course-sec .course-title{font-size:24px!important;}
      #course-sec .course-content p{font-size:13.5px!important;}
      #course-sec .course-content .th-btn.style3,
      #course-sec .course-content .th-btn.style3:visited{
        color:#fff!important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 48%,#0a0708 100%)!important;
        border:1px solid rgba(255,255,255,.34)!important;
      }
      #course-sec .course-content .th-btn.style3:hover,
      #course-sec .course-content .th-btn.style3:focus,
      #course-sec .course-content .th-btn.style3:active{
        color:#fff!important;
        background:linear-gradient(135deg,#00aab7 0%,#05606a 45%,#0a0708 100%)!important;
        border:1px solid rgba(255,255,255,.42)!important;
        box-shadow:0 0 24px rgba(0,194,209,.55),inset 0 1px 0 rgba(255,255,255,.28)!important;
      }
      #course-sec .course-content .th-btn.style3::before,
      #course-sec .course-content .th-btn.style3::after{
        opacity:.22!important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.20) 45%,transparent 58%)!important;
      }
      @media(max-width:767.98px){
        #course-sec .filter-active,
        #course-sec .filter-active.nostra-course-grid-fixed{grid-template-columns:1fr!important;}
        #course-sec .course-img img{height:220px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function collectBrokenCourseItems(section, grid) {
    if (!section || !grid) return;
    section.querySelectorAll('.filter-item').forEach(function (item) {
      if (item.parentElement !== grid) grid.appendChild(item);
    });
  }

  function destroyIsotopeOnce(grid) {
    if (!grid || grid.getAttribute('data-nostra-isotope-destroyed') === '1') return;
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.isotope) {
      try {
        var instance = window.jQuery(grid);
        if (instance.data('isotope')) instance.isotope('destroy');
      } catch (error) {}
    }
    grid.setAttribute('data-nostra-isotope-destroyed', '1');
  }

  function normalizeItems(grid) {
    grid.querySelectorAll(':scope>.filter-item').forEach(function (item) {
      item.classList.remove('col-md-6','col-xl-4','col-lg-4','col-sm-6');
      item.removeAttribute('style');
    });
  }

  function fixCourseGrid(force) {
    var section = document.getElementById('course-sec');
    var grid = section && section.querySelector('.filter-active');
    if (!section || !grid) return false;

    injectCourseGridCSS();
    collectBrokenCourseItems(section, grid);
    destroyIsotopeOnce(grid);

    var itemCount = grid.querySelectorAll(':scope>.filter-item').length;
    var previousCount = Number(grid.getAttribute('data-nostra-grid-count') || '-1');

    grid.classList.remove('row');
    grid.classList.add('nostra-course-grid-fixed');
    grid.style.setProperty('display','grid','important');
    grid.style.setProperty('grid-template-columns',getColumns(),'important');
    grid.style.setProperty('gap','22px','important');
    grid.style.setProperty('height','auto','important');
    grid.style.setProperty('position','relative','important');
    grid.style.setProperty('width','100%','important');

    if (force || previousCount !== itemCount) normalizeItems(grid);
    grid.setAttribute('data-nostra-grid-count',String(itemCount));
    grid.setAttribute('data-nostra-grid-ready','1');
    return true;
  }

  function scheduleInitialFixes() {
    fixCourseGrid(true);
    window.setTimeout(function () { fixCourseGrid(true); }, 250);
    window.setTimeout(function () { fixCourseGrid(true); }, 900);
  }

  function observeInitialRepair() {
    var section = document.getElementById('course-sec');
    if (!section || !('MutationObserver' in window)) return;

    repairObserver = new MutationObserver(function () {
      window.clearTimeout(window.__nostraGridRepairTimer);
      window.__nostraGridRepairTimer = window.setTimeout(function () {
        fixCourseGrid(true);
      }, 120);
    });

    repairObserver.observe(section,{childList:true,subtree:true});
    window.setTimeout(function () {
      if (repairObserver) repairObserver.disconnect();
      repairObserver = null;
    },2500);
  }

  function start() {
    injectCourseGridCSS();
    scheduleInitialFixes();
    observeInitialRepair();

    window.addEventListener('resize',function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        fixCourseGrid(false);
      },180);
    },{passive:true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',start,{once:true});
  } else {
    start();
  }

  window.addEventListener('load',function () {
    fixCourseGrid(true);
  },{once:true});
})();