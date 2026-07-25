/* ==================================================
   Grupo Nostradamus - Controlador global de actividad
   Reduce CPU pausando animaciones, videos y carruseles
   cuando no son visibles o la pestaña está oculta.
================================================== */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  if (path.indexOf('iq100.html') !== -1) return;

  var observedScopes = new WeakSet();
  var observer = null;

  function addStyles() {
    if (document.getElementById('nostra-activity-controller-style')) return;

    var style = document.createElement('style');
    style.id = 'nostra-activity-controller-style';
    style.textContent = `
      html.nostra-page-inactive *,
      html.nostra-page-inactive *::before,
      html.nostra-page-inactive *::after,
      [data-nostra-motion-paused="true"],
      [data-nostra-motion-paused="true"] *,
      [data-nostra-motion-paused="true"]::before,
      [data-nostra-motion-paused="true"]::after,
      [data-nostra-motion-paused="true"] *::before,
      [data-nostra-motion-paused="true"] *::after{
        animation-play-state:paused!important;
      }

      @media(prefers-reduced-motion:reduce){
        html:focus-within{scroll-behavior:auto!important;}
        *,*::before,*::after{
          animation-duration:.001ms!important;
          animation-iteration-count:1!important;
          transition-duration:.001ms!important;
          scroll-behavior:auto!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function slickElements(root) {
    var list = [];
    if (!root) return list;
    if (root.matches && root.matches('.slick-initialized')) list.push(root);
    if (root.querySelectorAll) {
      root.querySelectorAll('.slick-initialized').forEach(function (element) {
        list.push(element);
      });
    }
    return list;
  }

  function pauseSlick(root) {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.slick) return;
    slickElements(root).forEach(function (element) {
      try {
        window.jQuery(element).slick('slickPause');
      } catch (error) {}
    });
  }

  function resumeSlick(root) {
    if (document.hidden || !window.jQuery || !window.jQuery.fn || !window.jQuery.fn.slick) return;
    slickElements(root).forEach(function (element) {
      try {
        var instance = window.jQuery(element).slick('getSlick');
        if (instance && instance.options && instance.options.autoplay) {
          window.jQuery(element).slick('slickPlay');
        }
      } catch (error) {}
    });
  }

  function pauseVideos(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('video').forEach(function (video) {
      if (!video.paused) {
        video.setAttribute('data-nostra-was-playing', '1');
        try { video.pause(); } catch (error) {}
      }
    });
  }

  function resumeVideos(root) {
    if (document.hidden || !root || !root.querySelectorAll) return;
    root.querySelectorAll('video[data-nostra-was-playing="1"]').forEach(function (video) {
      video.removeAttribute('data-nostra-was-playing');
      var promise;
      try { promise = video.play(); } catch (error) { return; }
      if (promise && typeof promise.catch === 'function') promise.catch(function () {});
    });
  }

  function setScopeState(scope, active) {
    if (!scope) return;
    scope.setAttribute('data-nostra-motion-paused', active ? 'false' : 'true');
    if (active) {
      resumeSlick(scope);
      resumeVideos(scope);
    } else {
      pauseSlick(scope);
      pauseVideos(scope);
    }
  }

  function buildObserver() {
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        setScopeState(entry.target, entry.isIntersecting && !document.hidden);
      });
    }, {
      root:null,
      rootMargin:'180px 0px',
      threshold:0.01
    });
  }

  function observeScopes() {
    if (!observer) observer = buildObserver();
    if (!observer) return;

    document.querySelectorAll('main > section, body > section, .hero-wrapper, footer.footer-wrapper, .footer-wrapper').forEach(function (scope) {
      if (observedScopes.has(scope)) return;
      observedScopes.add(scope);
      scope.setAttribute('data-nostra-motion-scope', '1');
      observer.observe(scope);
    });
  }

  function setDocumentActivity() {
    var inactive = document.hidden;
    document.documentElement.classList.toggle('nostra-page-inactive', inactive);

    if (inactive) {
      pauseSlick(document);
      pauseVideos(document);
      document.querySelectorAll('[data-nostra-motion-scope="1"]').forEach(function (scope) {
        scope.setAttribute('data-nostra-motion-paused', 'true');
      });
      return;
    }

    document.querySelectorAll('[data-nostra-motion-scope="1"]').forEach(function (scope) {
      var rect = scope.getBoundingClientRect();
      var active = rect.bottom >= -180 && rect.top <= window.innerHeight + 180;
      setScopeState(scope, active);
    });
  }

  function start() {
    addStyles();
    observeScopes();
    setDocumentActivity();

    document.addEventListener('visibilitychange', setDocumentActivity, { passive:true });
    window.addEventListener('pagehide', function () {
      document.documentElement.classList.add('nostra-page-inactive');
      pauseSlick(document);
      pauseVideos(document);
    }, { passive:true });
    window.addEventListener('pageshow', function () {
      observeScopes();
      setDocumentActivity();
    }, { passive:true });

    window.setTimeout(observeScopes, 900);
    window.setTimeout(function () {
      observeScopes();
      setDocumentActivity();
    }, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();