/* ==================================================
   NostraCHAT - Puente DAMUS para imágenes en Storage
   Convierte temporalmente una URL de Firebase Storage a Data URL
   únicamente al solicitar análisis a DAMUS.
   No guarda Base64 en Firestore ni crea Cloud Functions adicionales.
================================================== */
(function () {
  'use strict';

  if (window.NOSTRACHAT_DAMUS_STORAGE_BRIDGE_LOADED) return;
  window.NOSTRACHAT_DAMUS_STORAGE_BRIDGE_LOADED = true;

  var nativeFetch = window.fetch.bind(window);
  var endpoint = String(window.NOSTRA_DAMUS_VISION_ENDPOINT || '');
  var MAX_IMAGE_BYTES = 180 * 1024;

  function requestUrl(input) {
    if (typeof input === 'string') return input;
    if (input && typeof input.url === 'string') return input.url;
    return '';
  }

  function isTargetEndpoint(url) {
    if (!endpoint || !url) return false;
    return String(url).split('#')[0] === endpoint.split('#')[0];
  }

  function parsePayload(init) {
    if (!init || typeof init.body !== 'string') return null;
    try {
      var payload = JSON.parse(init.body);
      return payload && typeof payload === 'object' ? payload : null;
    } catch (error) {
      return null;
    }
  }

  function isRemoteImagePayload(payload) {
    return !!(
      payload &&
      payload.mode === 'image' &&
      typeof payload.imageData === 'string' &&
      /^https?:\/\//i.test(payload.imageData)
    );
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || '');
        if (!/^data:image\//i.test(result)) {
          reject(new Error('DAMUS_IMAGEN_DATA_URL_INVALIDA'));
          return;
        }
        resolve(result);
      };
      reader.onerror = function () { reject(new Error('DAMUS_IMAGEN_LECTURA_FALLIDA')); };
      reader.readAsDataURL(blob);
    });
  }

  function downloadImage(url, mimeHint) {
    return nativeFetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'force-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    }).then(function (response) {
      if (!response.ok) throw new Error('DAMUS_IMAGEN_STORAGE_HTTP_' + response.status);

      var announcedSize = Number(response.headers.get('content-length') || 0);
      if (announcedSize > MAX_IMAGE_BYTES) throw new Error('DAMUS_IMAGEN_STORAGE_DEMASIADO_GRANDE');

      return response.blob();
    }).then(function (blob) {
      var mime = String(blob.type || mimeHint || 'image/jpeg').toLowerCase();
      if (!/^image\/(jpeg|png|webp)$/i.test(mime)) throw new Error('DAMUS_IMAGEN_STORAGE_TIPO_INVALIDO');
      if (!blob.size) throw new Error('DAMUS_IMAGEN_STORAGE_VACIA');
      if (blob.size > MAX_IMAGE_BYTES) throw new Error('DAMUS_IMAGEN_STORAGE_DEMASIADO_GRANDE');

      var normalizedBlob = blob.type ? blob : new Blob([blob], { type: mime });
      return blobToDataUrl(normalizedBlob).then(function (dataUrl) {
        return { dataUrl: dataUrl, mime: mime, sizeBytes: blob.size };
      });
    });
  }

  window.fetch = function (input, init) {
    var url = requestUrl(input);
    if (!isTargetEndpoint(url)) return nativeFetch(input, init);

    var payload = parsePayload(init);
    if (!isRemoteImagePayload(payload)) return nativeFetch(input, init);

    return downloadImage(payload.imageData, payload.imageMime).then(function (image) {
      var nextPayload = Object.assign({}, payload, {
        imageData: image.dataUrl,
        imageMime: image.mime,
        imageSizeBytes: image.sizeBytes,
        imageSource: 'firebase-storage-temporal'
      });
      var nextInit = Object.assign({}, init, { body: JSON.stringify(nextPayload) });
      return nativeFetch(input, nextInit);
    });
  };

  window.NOSTRACHAT_DAMUS_STORAGE_BRIDGE = {
    version: '2026-93',
    maxImageBytes: MAX_IMAGE_BYTES,
    endpointConfigured: !!endpoint
  };
})();
