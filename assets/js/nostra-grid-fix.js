/* ==================================================
   Grupo Nostradamus - Corrección grilla de ciclos
   Fuerza 3 ciclos por fila en escritorio, 2 en tablet y 1 en móvil.
   También neutraliza el layout automático de Isotope en #course-sec.
================================================== */
(function () {
  function fixCourseGrid() {
    var grid = document.querySelector('#course-sec .filter-active');
    if (!grid) return;

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.isotope) {
      try {
        var $grid = window.jQuery(grid);
        if ($grid.data('isotope')) {
          $grid.isotope('destroy');
        }
      } catch (e) {}
    }

    grid.classList.add('nostra-course-grid-fixed');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = window.innerWidth >= 1200
      ? 'repeat(3, minmax(0, 1fr))'
      : (window.innerWidth >= 768 ? 'repeat(2, minmax(0, 1fr))' : '1fr');
    grid.style.gap = '24px';
    grid.style.height = 'auto';
    grid.style.position = 'relative';

    var items = grid.querySelectorAll('.filter-item');
    items.forEach(function (item) {
      item.style.position = 'relative';
      item.style.left = 'auto';
      item.style.top = 'auto';
      item.style.transform = 'none';
      item.style.width = '100%';
      item.style.maxWidth = '100%';
      item.style.margin = '0';
      item.style.padding = '0';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fixCourseGrid();
    setTimeout(fixCourseGrid, 400);
    setTimeout(fixCourseGrid, 1200);
  });

  window.addEventListener('load', function () {
    fixCourseGrid();
    setTimeout(fixCourseGrid, 800);
  });

  window.addEventListener('resize', fixCourseGrid);
})();
