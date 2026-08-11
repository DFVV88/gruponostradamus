/* ==================================================
   Grupo Nostradamus - Ubicación visual de alumnos manuales
   Mantiene el alta manual dentro de Preinscripciones y fuera de NostraCUENTAS.
================================================== */
(function(){
  'use strict';

  var observer = null;
  var queued = false;

  function injectStyles(){
    if(document.getElementById('manual-student-layout-styles')) return;
    var style = document.createElement('style');
    style.id = 'manual-student-layout-styles';
    style.textContent = '\
      .manual-student-entrybar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 14px;padding:13px 14px;border:1px solid rgba(7,140,149,.17);border-radius:17px;background:linear-gradient(135deg,#f7fdfe,#eef8fa)}\
      .manual-student-entrybar-copy strong{display:block;color:#061426;font-size:13px;font-weight:950}.manual-student-entrybar-copy small{display:block;margin-top:3px;color:#647482;font-size:10px;line-height:1.4}\
      .manual-student-entrybar #manual-student-open{margin:0;min-width:230px;white-space:nowrap}\
      @media(max-width:720px){.manual-student-entrybar{display:block}.manual-student-entrybar #manual-student-open{width:100%;margin-top:10px;min-width:0}}';
    document.head.appendChild(style);
  }

  function preinscriptionPanel(){
    var view = document.getElementById('admin-view-preinscripciones');
    if(view){
      return Array.from(view.children).find(function(node){
        return node.classList && node.classList.contains('panel');
      }) || view.querySelector('.panel');
    }

    return Array.from(document.querySelectorAll('#admin-panel > .panel')).find(function(panel){
      return panel.id !== 'nostra-accounts-panel' && panel.querySelector('#search-input,#rows');
    }) || null;
  }

  function ensureEntryBar(panel){
    if(!panel) return null;
    var bar = panel.querySelector(':scope > .manual-student-entrybar');
    if(bar) return bar;

    bar = document.createElement('div');
    bar.className = 'manual-student-entrybar';
    bar.innerHTML = '<div class="manual-student-entrybar-copy"><strong>Registro administrativo de alumnos</strong><small>Incorpora alumnos directamente para matrícula, cronograma y control financiero, sin crear una NostraCUENTA.</small></div>';

    var toolbar = panel.querySelector(':scope > .toolbar') || panel.querySelector('.toolbar');
    if(toolbar) toolbar.insertAdjacentElement('beforebegin',bar);
    else panel.insertAdjacentElement('afterbegin',bar);
    return bar;
  }

  function positionButton(){
    injectStyles();
    var button = document.getElementById('manual-student-open');
    var panel = preinscriptionPanel();
    if(!button || !panel) return false;

    var bar = ensureEntryBar(panel);
    if(!bar) return false;

    button.textContent = '+ Registrar alumno manualmente';
    button.setAttribute('aria-label','Registrar alumno manualmente');
    if(button.parentElement !== bar) bar.appendChild(button);

    var accounts = document.getElementById('nostra-accounts-panel');
    if(accounts && accounts.contains(button)) return false;
    return true;
  }

  function queue(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      queued = false;
      positionButton();
    });
  }

  function start(){
    var attempts = 0;
    var timer = setInterval(function(){
      attempts += 1;
      if(positionButton() || attempts > 80) clearInterval(timer);
    },150);

    observer = new MutationObserver(queue);
    observer.observe(document.getElementById('admin-panel') || document.body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
