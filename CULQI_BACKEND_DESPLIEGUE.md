# Backend seguro de Culqi — Grupo Nostradamus

Este bloque procesa pagos sin exponer la llave privada de Culqi en el navegador.

## Arquitectura implementada

1. La preinscripción se crea en Firestore con pago pendiente.
2. `culqiPreparePayment` recibe el ID y el código de la solicitud.
3. El servidor vuelve a leer `programas_publicos` y recalcula el monto oficial.
4. Se crea un documento privado en `intentos_pago` con vencimiento de 20 minutos.
5. Culqi Custom Checkout genera un token en el navegador.
6. Culqi3DS obtiene la huella del dispositivo y ejecuta autenticación cuando corresponde.
7. `culqiCreateCharge` recibe únicamente el token, el ID del intento, la solicitud y los parámetros 3DS requeridos.
8. El servidor vuelve a validar el tarifario y crea el cargo con la llave privada.
9. `culqiWebhook` vuelve a consultar el cargo en la API de Culqi y concilia el resultado.
10. Solo un cargo aprobado actualiza:

```text
estadoPago: pago_validado
pagoValidado: true
precioValidadoServidor: true
matriculaAprobada: true
estado: listo_para_matricula
```

El token de Culqi y la llave privada no se guardan en Firestore.

## Funciones disponibles

- `culqiBackendHealth`: comprueba que el backend esté desplegado.
- `culqiPreparePayment`: valida y reserva el monto oficial.
- `culqiCreateCharge`: crea el cargo y completa el flujo 3DS.
- `culqiPaymentStatus`: consulta el resultado usando ID y código de solicitud.
- `culqiWebhook`: concilia cargos aprobados o rechazados enviados por Culqi.

Región configurada: `us-central1`.

## Requisitos

- Firebase CLI.
- Acceso administrativo al proyecto `nostrachat-grupo-nostradamus`.
- Proyecto Firebase con facturación habilitada para Cloud Functions y Secret Manager.
- Llaves de integración de Culqi:
  - pública: `pk_test_...` para el checkout;
  - privada: `sk_test_...` solo para Secret Manager.

## 1. Instalar y validar localmente

Desde la raíz del repositorio:

```bash
npm install -g firebase-tools
firebase login
firebase use nostrachat-grupo-nostradamus
cd functions
npm install
npm run check
cd ..
```

## 2. Guardar la llave privada

No escribir la llave privada en HTML, JavaScript público, GitHub, `.env` ni Firestore.

Ejecutar:

```bash
firebase functions:secrets:set CULQI_SECRET_KEY --project nostrachat-grupo-nostradamus
```

Cuando la terminal solicite el valor, pegar la llave privada directamente en Cloud Shell.

## 3. Desplegar las funciones

```bash
firebase deploy --only functions:culqiBackendHealth,functions:culqiPreparePayment,functions:culqiCreateCharge,functions:culqiPaymentStatus,functions:culqiWebhook --project nostrachat-grupo-nostradamus
```

URL esperadas:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiBackendHealth
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiPreparePayment
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiCreateCharge
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiPaymentStatus
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

## 4. Comprobar el backend

Abrir:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiBackendHealth
```

La respuesta esperada contiene:

```json
{
  "service": "nostra-culqi-backend",
  "environment": "configured-at-runtime"
}
```

## Seguridad incluida

- CORS limitado al dominio oficial, `www`, GitHub Pages y desarrollo local.
- El servidor no acepta montos enviados por el navegador.
- El programa y el plan se consultan nuevamente antes de cobrar.
- La promoción se evalúa con fecha de Perú.
- Los importes se trabajan en céntimos.
- Se bloquean intentos vencidos, concurrentes y solicitudes ya pagadas.
- Los intentos aprobados y webhooks repetidos son idempotentes.
- Un cambio en el panel invalida el intento anterior.
- La llave privada se obtiene únicamente desde Secret Manager.
- Los tokens de tarjeta no se almacenan.
- Se registra metadata para conciliar el cargo con la preinscripción.
- El webhook vuelve a consultar el cargo oficial en Culqi antes de actualizar Firestore.
- Un evento fallido nunca degrada un pago ya aprobado.

## Estado de 3DS

El flujo 3DS está conectado y probado en modo de integración:

- autenticación con Challenge;
- autenticación sin Challenge;
- reutilización controlada del mismo token y huella durante el segundo paso;
- aprobación de matrícula únicamente después del cargo confirmado.

## Estado del webhook

El evento de cargo aprobado fue probado desde CulqiPanel y respondió:

```text
charge.creation.succeeded
200 OK
```

El parser admite el formato real de Culqi Webhooks 2.0, incluyendo eventos envueltos y el campo `data` como objeto o texto JSON.

## Siguiente etapa

1. Completar una prueba real de `charge.creation.failed` en modo de integración.
2. Confirmar `200 OK` y estado `pago_rechazado`.
3. Esperar la activación del comercio de producción.
4. Ejecutar el procedimiento de `CULQI_PAGO_RECHAZADO_Y_PRODUCCION.md`.
5. Actualizar el runtime de Node antes de la fecha límite advertida por Google Cloud.
