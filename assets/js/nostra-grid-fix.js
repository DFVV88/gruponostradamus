/* ==================================================
   Grupo Nostradamus - Corrección definitiva grilla de ciclos
   Objetivo: 3 ciclos por fila en escritorio y laptop, 1 en celular.
   Corrige además el HTML roto: algunos ciclos quedaron fuera del contenedor .filter-active.
   Incluye corrección de hover para botones de ciclos.
================================================== */
(function () {
  function getColumns() {
    return window.innerWidth >= 768 ? 'repeat(3,minmax(0,1fr))' : '1fr';
  }

  function injectCourseGridCSS() {
    var oldStyle = document.getElementById('nostra-course-grid-force-style');
    if (oldStyle) oldStyle.remove();

    var style = document.createElement('style');
    style.id = 'nostra-course-grid-force-style';
    style.textContent = `
      #course-sec .container{
        max-width:1320px !important;
      }
      #course-sec .filter-active,
      #course-sec .filter-active.nostra-course-grid-fixed{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:22px !important;
        height:auto !important;
        position:relative !important;
        align-items:stretch !important;
        width:100% !important;
        margin-left:auto !important;
        margin-right:auto !important;
      }
      #course-sec .filter-active:before,
      #course-sec .filter-active:after{
        content:none !important;
        display:none !important;
      }
      #course-sec .filter-active > .filter-item{
        position:relative !important;
        left:auto !important;
        top:auto !important;
        right:auto !important;
        bottom:auto !important;
        transform:none !important;
        width:100% !important;
        max-width:100% !important;
        flex:unset !important;
        padding:0 !important;
        margin:0 !important;
        display:block !important;
      }
      #course-sec .course-box2{
        width:100% !important;
        height:100% !important;
        display:flex !important;
        flex-direction:column !important;
      }
      #course-sec .course-img img{
        width:100% !important;
        height:190px !important;
        object-fit:cover !important;
      }
      #course-sec .course-content{
        flex:1 !important;
        padding:18px 14px 20px !important;
      }
      #course-sec .course-title{
        font-size:24px !important;
      }
      #course-sec .course-content p{
        font-size:13.5px !important;
      }

      /* Corrección: el hover no debe volver blanco el botón ni ocultar el texto */
      #course-sec .course-content .th-btn.style3,
      #course-sec .course-content .th-btn.style3:visited{
        color:#ffffff !important;
        background:linear-gradient(135deg,#078c95 0%,#03333c 48%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.34) !important;
      }
      #course-sec .course-content .th-btn.style3:hover,
      #course-sec .course-content .th-btn.style3:focus,
      #course-sec .course-content .th-btn.style3:active{
        color:#ffffff !important;
        background:linear-gradient(135deg,#00aab7 0%,#05606a 45%,#0a0708 100%) !important;
        border:1px solid rgba(255,255,255,.42) !important;
        box-shadow:0 0 24px rgba(0,194,209,.55), inset 0 1px 0 rgba(255,255,255,.28) !important;
      }
      #course-sec .course-content .th-btn.style3::before,
      #course-sec .course-content .th-btn.style3::after{
        opacity:.22 !important;
        background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.20) 45%,transparent 58%) !important;
      }
      #course-sec .course-content .th-btn.style3:hover::before,
      #course-sec .course-content .th-btn.style3:hover::after{
        opacity:.18 !important;
      }

      @media(max-width:767.98px){
        #course-sec .filter-active,
        #course-sec .filter-active.nostra-course-grid-fixed{
          grid-template-columns:1fr !important;
        }
        #course-sec .course-img img{
          height:220px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function collectBrokenCourseItems(grid) {
    var section = document.querySelector('#course-sec');
    if (!section || !grid) return;

    var allItems = Array.prototype.slice.call(section.querySelectorAll('.filter-item'));
    if (allItems.length <= 1) return;

    allItems.forEach(function (item) {
      if (item.parentElement !== grid) {
        grid.appendChild(item);
      }
    });
  }

  function fixCourseGrid() {
    var grid = document.querySelector('#course-sec .filter-active');
    if (!grid) return;

    injectCourseGridCSS();
    collectBrokenCourseItems(grid);

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.isotope) {
      try {
        var $grid = window.jQuery(grid);
        if ($grid.data('isotope')) {
          $grid.isotope('destroy');
        }
      } catch (e) {}
    }

    grid.classList.remove('row');
    grid.classList.add('nostra-course-grid-fixed');
    grid.removeAttribute('style');
    grid.style.setProperty('display', 'grid', 'important');
    grid.style.setProperty('grid-template-columns', getColumns(), 'important');
    grid.style.setProperty('gap', '22px', 'important');
    grid.style.setProperty('height', 'auto', 'important');
    grid.style.setProperty('position', 'relative', 'important');
    grid.style.setProperty('width', '100%', 'important');

    var items = grid.querySelectorAll(':scope > .filter-item');
    items.forEach(function (item) {
      item.classList.remove('col-md-6', 'col-xl-4', 'col-lg-4', 'col-sm-6');
      item.removeAttribute('style');
      item.style.setProperty('position', 'relative', 'important');
      item.style.setProperty('left', 'auto', 'important');
      item.style.setProperty('top', 'auto', 'important');
      item.style.setProperty('transform', 'none', 'important');
      item.style.setProperty('width', '100%', 'important');
      item.style.setProperty('max-width', '100%', 'important');
      item.style.setProperty('padding', '0', 'important');
      item.style.setProperty('margin', '0', 'important');
    });
  }

  function scheduleFixes() {
    fixCourseGrid();
    [50, 150, 300, 700, 1200, 2000, 3500, 5000].forEach(function (delay) {
      setTimeout(fixCourseGrid, delay);
    });
  }

  document.addEventListener('DOMContentLoaded', scheduleFixes);
  window.addEventListener('load', scheduleFixes);
  window.addEventListener('resize', fixCourseGrid);

  var observer = new MutationObserver(function () {
    clearTimeout(window.__nostraGridFixTimer);
    window.__nostraGridFixTimer = setTimeout(fixCourseGrid, 80);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var section = document.querySelector('#course-sec');
    if (section) {
      observer.observe(section, { attributes:true, childList:true, subtree:true, attributeFilter:['style','class'] });
    }
  });
})();
