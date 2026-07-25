/* ==================================================
   Grupo Nostradamus - Nombres oficiales en menú de ciclos
   Actualiza únicamente las etiquetas visibles.
   Conserva intactas todas las rutas y enlaces existentes.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var LABELS = {
    'ciclo-anual-uni.html': 'Nostra 360 UNI',
    'ciclo-semianual-uni.html': 'Nostra Power UNI',
    'ciclo-semestral-uni.html': 'Nostra Élite UNI',
    'ciclo-repaso-uni.html': 'Nostra Prime UNI',
    'ciclo-elite-uni.html': 'Nostra Talentum UNI',
    'ciclo-ien.html': 'IEN UNI',
    'ciclo-proyecto-escolar.html': 'Proyecto Escolar',
    'ciclo-paralelo-cepre-uni.html': 'Paralelo CEPRE UNI',
    'ciclo-verano-uni.html': 'Ciclo Verano UNI'
  };

  function fileFromHref(anchor) {
    var raw = anchor.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#') return '';

    try {
      var url = new URL(raw, window.location.href);
      return (url.pathname.split('/').pop() || '').toLowerCase();
    } catch (error) {
      return (raw.split('?')[0].split('#')[0].split('/').pop() || '').toLowerCase();
    }
  }

  function replaceVisibleText(anchor, label) {
    if (!anchor || anchor.getAttribute('data-nostra-cycle-label') === label) return;

    var textNodes = Array.prototype.filter.call(anchor.childNodes, function (node) {
      return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim();
    });

    if (!anchor.children.length) {
      anchor.textContent = label;
    } else if (textNodes.length) {
      textNodes[0].nodeValue = label + ' ';
      textNodes.slice(1).forEach(function (node) { node.nodeValue = ''; });
    } else {
      anchor.insertBefore(document.createTextNode(label + ' '), anchor.firstChild);
    }

    anchor.setAttribute('data-nostra-cycle-label', label);
    anchor.setAttribute('aria-label', 'Ver información de ' + label);
  }

  function updateMenus(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var selector = [
      '.th-header a[href]',
      '.th-menu-wrapper a[href]',
      '.nostra-index-header-clone a[href]'
    ].join(',');

    scope.querySelectorAll(selector).forEach(function (anchor) {
      var file = fileFromHref(anchor);
      if (LABELS[file]) replaceVisibleText(anchor, LABELS[file]);
    });
  }

  function start() {
    updateMenus(document);

    if (!('MutationObserver' in window)) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) updateMenus(node);
        });
      });
    });

    observer.observe(document.body, { childList:true, subtree:true });
    window.setTimeout(function () { observer.disconnect(); }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }

  window.addEventListener('load', function () {
    updateMenus(document);
  }, { once:true });
})();
