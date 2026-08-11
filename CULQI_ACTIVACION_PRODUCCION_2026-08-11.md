# Culqi — activación de producción

Fecha de activación: 2026-08-11

## Estado verificado

- Comercio Culqi de NOSTRA S.A.C.: aprobado.
- Checkout con tarjeta en pruebas: operativo.
- Flujo 3DS: operativo.
- Conciliación automática e idempotente en Firestore: implementada.
- Llave privada de producción: actualizada en Firebase Secret Manager (`CULQI_SECRET_KEY`).
- Funciones `culqiCreateCharge` y `culqiWebhook`: redeplegadas con la nueva versión del secreto.
- Webhook de producción `charge.creation.succeeded`: configurado en CulqiPanel.
- Webhook de producción `charge.creation.failed`: configurado en CulqiPanel.
- Llave pública de producción: configurada en `assets/js/culqi-public-config.js` dentro de esta rama.
- Ninguna llave privada `sk_live_...` está almacenada en GitHub.

## Corte a producción

### 1. Llave pública

La llave pública activa de producción tiene formato `pk_live_...` y se mantiene únicamente en el archivo público del checkout:

```text
assets/js/culqi-public-config.js
```

También se agregó una herramienta de mantenimiento seguro:

```text
tools/set_culqi_live_public_key.py
```

El script acepta exclusivamente `pk_live_...`, rechaza cualquier `sk_...` y limita la modificación al archivo de configuración pública.

### 2. Llave privada

La llave privada de producción se administra exclusivamente mediante Firebase Secret Manager:

```bash
firebase functions:secrets:set CULQI_SECRET_KEY --project nostrachat-grupo-nostradamus
```

Nunca debe guardarse en GitHub, HTML, JavaScript ni Firestore.

### 3. Webhooks de producción

URL registrada:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

Eventos activos:

```text
charge.creation.succeeded
charge.creation.failed
```

### 4. Prueba real controlada pendiente

Antes de promover el cobro de forma masiva:

1. realizar una preinscripción real controlada;
2. ejecutar un pago real de importe previamente autorizado;
3. confirmar cargo aprobado en CulqiPanel;
4. confirmar webhook `200 OK`;
5. confirmar `pago_validado` en el panel administrativo;
6. confirmar importe y código de solicitud;
7. confirmar ausencia de doble cargo.

## Regla crítica

La llave pública y la llave privada deben pertenecer siempre al mismo entorno. No mezclar `pk_test_...` con `sk_live_...` ni `pk_live_...` con `sk_test_...`.

## Situación actual

El backend y los webhooks ya están en producción. Esta rama contiene la llave pública de producción y está preparada para fusionarse a `main`. Una vez publicada, el siguiente paso obligatorio es una compra real controlada antes de dar por concluida la activación.
