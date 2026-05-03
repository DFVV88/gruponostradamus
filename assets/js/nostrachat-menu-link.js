/* ==================================================
   Grupo Nostradamus - Link global NostraCHAT
   Inserta NostraCHAT en menús existentes sin alterar HTML base.
================================================== */
(function () {
  function alreadyHasChat(root) {
    return !!root.querySelector('a[href="nostrachat.html"]');
  }

  function createLi(className) {
    var li = document.createElement('li');
    if (className) li.className = className;
    var a = document.createElement('a');
    a.href = 'nostrachat.html';
    a.textContent = 'NostraCHAT';
    if (location.pathname.toLowerCase().includes('nostrachat.html')) {
      a.classList.add('active');
      li.classList.add('active');
    }
    li.appendChild(a);
    return li;
  }

  function insertAfterText(menu, textNeedle) {
    if (!menu || alreadyHasChat(menu)) return false;
    var links = Array.prototype.slice.call(menu.querySelectorAll(':scope > li > a'));
    var target = links.find(function (a) {
      return (a.textContent || '').trim().toLowerCase().includes(textNeedle);
    });
    var li = createLi();
    if (target && target.parentElement && target.parentElement.parentElement === menu) {
      target.parentElement.insertAdjacentElement('afterend', li);
      return true;
    }
    menu.appendChild(li);
    return true;
  }

  function addToClassicMenus() {
    document.querySelectorAll('.main-menu > ul, .th-mobile-menu > ul').forEach(function (menu) {
      insertAfterText(menu, 'cachimbos');
    });
  }

  function addToSharedHeader() {
    var nav = document.querySelector('.nostra-nav');
    if (nav && !alreadyHasChat(nav)) {
      var item = document.createElement('div');
      item.className = 'nostra-nav-item';
      var a = document.createElement('a');
      a.className = 'nostra-nav-link' + (location.pathname.toLowerCase().includes('nostrachat.html') ? ' active' : '');
      a.href = 'nostrachat.html';
      a.textContent = 'NOSTRACHAT';
      item.appendChild(a);

      var noticias = Array.prototype.slice.call(nav.querySelectorAll('.nostra-nav-link')).find(function (link) {
        return (link.textContent || '').toLowerCase().includes('noticias');
      });
      if (noticias && noticias.closest('.nostra-nav-item')) {
        noticias.closest('.nostra-nav-item').insertAdjacentElement('beforebegin', item);
      } else {
        nav.appendChild(item);
      }
    }

    var mobile = document.querySelector('.nostra-mobile-panel');
    if (mobile && !alreadyHasChat(mobile)) {
      var aMobile = document.createElement('a');
      aMobile.href = 'nostrachat.html';
      aMobile.textContent = 'NOSTRACHAT';
      if (location.pathname.toLowerCase().includes('nostrachat.html')) aMobile.className = 'active';

      var noticiasMobile = Array.prototype.slice.call(mobile.querySelectorAll('a')).find(function (link) {
        return (link.textContent || '').toLowerCase().includes('noticias');
      });
      if (noticiasMobile) noticiasMobile.insertAdjacentElement('beforebegin', aMobile);
      else mobile.appendChild(aMobile);
    }
  }

  function addToNostrachatOwnMenu() {
    if (!location.pathname.toLowerCase().includes('nostrachat.html')) return;
    document.querySelectorAll('header .menu').forEach(function (menu) {
      if (alreadyHasChat(menu)) return;
      var a = document.createElement('a');
      a.href = 'nostrachat.html';
      a.textContent = 'NostraCHAT';
      a.style.color = '#078c95';
      menu.insertBefore(a, menu.querySelector('a[href="blog.html"]') || null);
    });
  }

  function run() {
    addToClassicMenus();
    addToSharedHeader();
    addToNostrachatOwnMenu();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
