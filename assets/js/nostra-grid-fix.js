/* ==================================================
   Grupo Nostradamus - Corrección fuerte grilla de ciclos
   Objetivo: 3 ciclos por fila en escritorio, 2 en tablet y 1 en móvil.
   Neutraliza Isotope, estilos inline y clases Bootstrap que estaban forzando una columna.
================================================== */
(function () {
  function injectCourseGridCSS() {
    if (document.getElementById('nostra-course-grid-force-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-course-grid-force-style';
    style.textContent = `
      #course-sec .filter-active,
      #course-sec .filter-active.nostra-course-grid-fixed{
        display:grid !important;
        grid-template-columns:repeat(3,minmax(0,1fr)) !important;
        gap:24px !important;
        height:auto !important;
        position:relative !important;
        align-items:stretch !important;
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
        height:210px !important;
        object-fit:cover !important;
      }
      #course-sec .course-content{
        flex:1 !important;
      }
      @media(max-width:1199.98px){
        #course-sec .filter-active,
        #course-sec .filter-active.nostra-course-grid-fixed{
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        }
      }
      @media(max-width:767.98px){
        #course-sec .filter-active,
        #course-sec .filter-active.nostra-course-grid-fixed{
          grid-template-columns:1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fixCourseGrid() {
    var grid = document.querySelector('#course-sec .filter-active');
    if (!grid) return;

    injectCourseGridCSS();

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
    grid.style.setProperty('grid-template-columns', window.innerWidth >= 1200 ? 'repeat(3,minmax(0,1fr))' : (window.innerWidth >= 768 ? 'repeat(2,minmax(0,1fr))' : '1fr'), 'important');
    grid.style.setProperty('gap', '24px', 'important');
    grid.style.setProperty('height', 'auto', 'important');
    grid.style.setProperty('position', 'relative', 'important');

    var items = grid.querySelectorAll('.filter-item');
    items.forEach(function (item) {
      item.classList.remove('col-md-6', 'col-xl-4');
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
    [100, 300, 700, 1200, 2000, 3500].forEach(function (delay) {
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
    var grid = document.querySelector('#course-sec .filter-active');
    if (grid) {
      observer.observe(grid, { attributes:true, childList:true, subtree:true, attributeFilter:['style','class'] });
    }
  });
})();
