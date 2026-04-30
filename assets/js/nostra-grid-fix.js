/* ==================================================
   Grupo Nostradamus - Corrección definitiva grilla de ciclos
   Objetivo: 3 ciclos por fila en escritorio y laptop, 1 en celular.
   Neutraliza Isotope, estilos inline y clases Bootstrap que estaban forzando una columna.
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
    grid.style.setProperty('grid-template-columns', getColumns(), 'important');
    grid.style.setProperty('gap', '22px', 'important');
    grid.style.setProperty('height', 'auto', 'important');
    grid.style.setProperty('position', 'relative', 'important');

    var items = grid.querySelectorAll('.filter-item');
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
    var grid = document.querySelector('#course-sec .filter-active');
    if (grid) {
      observer.observe(grid, { attributes:true, childList:true, subtree:true, attributeFilter:['style','class'] });
    }
  });
})();
