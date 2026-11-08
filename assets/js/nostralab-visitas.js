/* NostraLAB — contador de visitas acumulativas por sesión.
   El dato procede exclusivamente de Firebase. Nunca fabricar totales locales.
   El simulador científico dentro del iframe permanece 100% autónomo. */
(function () {
  'use strict';
  var ENDPOINT = 'https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraLabVisits';
  var badge = document.getElementById('nostralab-visitas');
  var totalNode = document.getElementById('nostralab-visitas-total');
  if (!badge || !totalNode) return;

  function getSessionId(labId) {
    try {
      if (!window.crypto || typeof window.crypto.randomUUID !== 'function') return null;
      var key = 'nostralab:visita:v1:' + labId;
      var token = window.sessionStorage.getItem(key);
      if (!/^[0-9a-f-]{36}$/i.test(token || '')) {
        token = window.crypto.randomUUID();
        window.sessionStorage.setItem(key, token);
      }
      return token;
    } catch (_) {
      return null; // almacenamiento no disponible: no arriesgar dobles visitas.
    }
  }

  function onReady(event) {
    var labId = event && event.detail && event.detail.id;
    if (typeof labId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(labId)) return;
    var token = getSessionId(labId);
    if (!token) return;

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labId: labId, sessionId: token }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Contador temporalmente no disponible');
        return response.json();
      })
      .then(function (data) {
        if (!data || data.ok !== true || data.labId !== labId ||
            !Number.isSafeInteger(data.total) || data.total < 0) {
          throw new Error('Respuesta inválida de Firebase');
        }
        totalNode.textContent = data.total.toLocaleString('es-PE');
        badge.setAttribute('aria-label', data.total + ' visitas acumuladas de este laboratorio');
        badge.hidden = false;
      })
      .catch(function () {
        // No mostrar cifras ficticias ni afectar controles del simulador.
        badge.hidden = true;
      })
      .finally(function () { if (timeout) clearTimeout(timeout); });
  }
  document.addEventListener('nostralab:ready', onReady);
})();
