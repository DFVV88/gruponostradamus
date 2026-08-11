# Culqi — activación de producción

Fecha de preparación: 2026-08-11

## Estado verificado

- Comercio Culqi de NOSTRA S.A.C.: aprobado.
- Checkout con tarjeta en pruebas: operativo.
- Flujo 3DS: operativo.
- Webhook `charge.creation.succeeded`: validado con `200 OK`.
- Conciliación automática e idempotente en Firestore: implementada.
- Llave privada: protegida mediante Firebase Secret Manager (`CULQI_SECRET_KEY`).
- Frontend actual en `main`: todavía utiliza `pk_test_...`.
- No existe ninguna `pk_live_...` almacenada en el repositorio, lo cual es correcto hasta realizar el corte controlado.

## Corte a producción

El corte debe hacerse como una sola operación coordinada. No mezclar entornos.

### 1. Llave pública

La llave pública de producción debe tener formato:

```text
pk_live_...
```

En esta rama se agregó:

```text
tools/set_culqi_live_public_key.py
```

Uso seguro:

```bash
CULQI_PUBLIC_KEY='pk_live_...' python tools/set_culqi_live_public_key.py
```

El script:

- acepta exclusivamente `pk_live_...`;
- rechaza cualquier `sk_...`;
- modifica únicamente `assets/js/culqi-public-config.js`;
- no imprime la llave completa en consola.

### 2. Llave privada

La llave privada de producción debe tener formato:

```text
sk_live_...
```

Nunca debe guardarse en GitHub, HTML, JavaScript ni Firestore.

Debe actualizarse directamente en Firebase Secret Manager:

```bash
firebase functions:secrets:set CULQI_SECRET_KEY --project nostrachat-grupo-nostradamus
```

Luego desplegar:

```bash
firebase deploy --only functions:culqiCreateCharge,functions:culqiWebhook --project nostrachat-grupo-nostradamus
```

### 3. Webhook de producción

Registrar en CulqiPanel de producción:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

Eventos:

```text
charge.creation.succeeded
charge.creation.failed
```

### 4. Prueba real controlada

Antes de abrir el cobro al público:

1. realizar una preinscripción real controlada;
2. ejecutar un pago real de importe previamente autorizado;
3. confirmar cargo aprobado en CulqiPanel;
4. confirmar webhook `200 OK`;
5. confirmar `pago_validado` en el panel administrativo;
6. confirmar importe y código de solicitud;
7. confirmar ausencia de doble cargo.

## Regla crítica

La llave pública y la llave privada deben pertenecer al mismo entorno. No se debe mezclar `pk_test_...` con `sk_live_...` ni `pk_live_...` con `sk_test_...`.

## Situación de esta rama

Esta rama prepara el cambio de GitHub sin modificar todavía el checkout público. El paso final requiere introducir la `pk_live_...` real y actualizar `CULQI_SECRET_KEY` directamente en Firebase.
