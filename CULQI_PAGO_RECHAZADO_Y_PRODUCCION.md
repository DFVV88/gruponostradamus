# Culqi — pago rechazado y preparación para producción

Estado actual de la integración:

- Checkout con tarjeta en modo de prueba operativo.
- Flujo 3DS operativo.
- Webhook `charge.creation.succeeded` confirmado con respuesta `200 OK`.
- Conciliación automática e idempotente en Firestore.
- Llave privada protegida mediante Firebase Secret Manager.

## 1. Prueba pendiente: cargo rechazado

El webhook ya contiene la lógica para procesar `charge.creation.failed` sin reducir un pago que previamente haya sido aprobado.

### Procedimiento

1. Crear una preinscripción nueva.
2. Seleccionar pago en línea.
3. Utilizar en Culqi una tarjeta de integración destinada a producir un rechazo.
4. Confirmar que la página termine en `pago-rechazado.html`.
5. Revisar en el panel administrativo que la solicitud muestre:

```text
estadoPago: pago_rechazado
pagoValidado: false
matriculaAprobada: false
```

6. Revisar en CulqiPanel → Desarrollo → Webhooks → Historial que el evento nuevo muestre:

```text
charge.creation.failed
200 OK
```

7. Confirmar en Firestore que el evento se registró en `culqi_webhook_eventos` con:

```text
estado: procesado
resultado: pago_rechazado
verifiedByCulqiApi: true
```

### Protección importante

Si una preinscripción ya tiene un pago aprobado, un evento fallido posterior no debe cambiarla a rechazada. El webhook registra ese caso como:

```text
resultado: fallo_ignorado_pago_ya_aprobado
```

## 2. Condiciones antes de producción

No cambiar a producción hasta cumplir todo lo siguiente:

- Comercio Culqi de NOSTRA S.A.C. aprobado y activo.
- Llave pública `pk_live_...` disponible.
- Llave privada `sk_live_...` disponible.
- Webhooks del panel de producción habilitados.
- Pruebas de pago aprobado, 3DS, rechazo e idempotencia completadas en modo de prueba.
- Políticas legales y datos del comercio visibles en la web.
- Monitoreo del panel administrativo y acceso a Firebase verificados.

No se debe mezclar una llave pública de prueba con una llave privada de producción, ni una llave pública de producción con una llave privada de prueba.

## 3. Cambio de la llave pública

La llave pública se encuentra en:

```text
assets/js/culqi-public-config.js
```

Cambiar únicamente:

```js
window.NOSTRA_CULQI_PUBLIC_KEY = 'pk_test_...';
```

por:

```js
window.NOSTRA_CULQI_PUBLIC_KEY = 'pk_live_...';
```

La llave pública puede estar en el navegador. Nunca colocar `sk_live_...` en HTML, JavaScript, GitHub, Firestore ni archivos públicos.

## 4. Cambio de la llave privada

Desde Cloud Shell, dentro del proyecto `nostrachat-grupo-nostradamus`:

```bash
firebase functions:secrets:set CULQI_SECRET_KEY --project nostrachat-grupo-nostradamus
```

Cuando Firebase solicite el valor, ingresar `sk_live_...` directamente en la terminal. No copiar esa llave en chats ni capturas.

Después, desplegar las dos funciones que utilizan el secreto:

```bash
firebase deploy --only functions:culqiCreateCharge,functions:culqiWebhook --project nostrachat-grupo-nostradamus
```

## 5. Webhooks en el panel de producción

En CulqiPanel de producción registrar la misma URL:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

Crear estos dos eventos:

```text
charge.creation.succeeded
charge.creation.failed
```

La función verifica que el identificador del cargo y la llave privada pertenezcan al mismo entorno. Cuando el secreto sea `sk_live_...`, los cargos `chr_test_...` serán rechazados y solo se aceptarán cargos `chr_live_...`.

## 6. Publicación y prueba real controlada

1. Publicar la actualización de `culqi-public-config.js`.
2. Abrir `preinscripcion.html` con recarga forzada.
3. Crear una solicitud real controlada.
4. Realizar un pago real por un importe previamente autorizado por la administración.
5. Verificar simultáneamente:
   - cargo aprobado en CulqiPanel;
   - webhook `200 OK`;
   - `pago_validado` en el panel administrativo;
   - importe y código de solicitud correctos;
   - ausencia de doble cargo.
6. No abrir el cobro al público hasta completar esta prueba.

## 7. Plan de reversión

Ante cualquier problema durante la activación:

1. Restaurar `pk_test_...` en `assets/js/culqi-public-config.js`.
2. Volver a guardar `sk_test_...` en `CULQI_SECRET_KEY`.
3. Desplegar nuevamente `culqiCreateCharge` y `culqiWebhook`.
4. Confirmar que el checkout indique modo de prueba.

## 8. Pendiente técnico antes del uso prolongado

Los despliegues actuales muestran una advertencia de retiro de Node.js 20. Antes de la fecha indicada por Google Cloud en la terminal, debe actualizarse el runtime de Functions a una versión soportada y repetirse toda la batería de pruebas.
