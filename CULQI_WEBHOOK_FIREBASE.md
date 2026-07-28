# Webhook de Culqi para Grupo Nostradamus

Esta etapa agrega la función HTTP `culqiWebhook` para conciliar cargos de Culqi con las preinscripciones guardadas en Firestore.

## Estado actual

- Webhook de cargo aprobado probado desde CulqiPanel.
- Respuesta confirmada: `200 OK`.
- Formato real de Culqi Webhooks 2.0 soportado.
- Entregas repetidas procesadas de manera idempotente.
- Flujo de cargo rechazado implementado y cubierto por pruebas automáticas.

## Qué resuelve

- Confirma pagos aunque el alumno cierre la página después del cargo.
- Procesa de forma idempotente entregas repetidas del mismo evento.
- Nunca reduce un pago ya aprobado a rechazado por un evento posterior.
- Comprueba preinscripción, intento, código, monto, moneda y entorno.
- Guarda un registro mínimo de auditoría en `culqi_webhook_eventos`.
- No almacena número completo de tarjeta, CVV, token, IP, huella ni payload completo.

## Formatos aceptados

El endpoint acepta:

- cargo directo de Culqi;
- evento envuelto con `id`, `type`, `creation_date` y `data`;
- `data` como objeto JSON;
- `data` como texto JSON serializado;
- nombres camelCase y snake_case usados por distintas respuestas de Culqi.

## Verificación de seguridad

El endpoint no confía en el contenido recibido. Extrae únicamente el identificador del cargo y vuelve a consultar:

```text
GET https://api.culqi.com/v2/charges/{id}
```

La consulta se autentica con `CULQI_SECRET_KEY` desde Firebase Secret Manager. Solo después de recibir el cargo oficial desde la API de Culqi se validan:

- entorno `test` o `live`;
- metadata creada por NOSTRA;
- preinscripción e intento de pago;
- código de solicitud;
- monto exacto en céntimos;
- moneda PEN;
- captura del cargo;
- inexistencia de un cargo diferente ya asociado.

## Despliegue

Desde Cloud Shell:

```bash
cd ~/gruponostradamus
git fetch origin main
git reset --hard origin/main
cd functions
npm install
npm run check
cd ..
firebase use nostrachat-grupo-nostradamus
firebase deploy --only functions:culqiWebhook
```

No es necesario volver a ingresar la llave privada de Culqi mientras se mantenga el mismo entorno. La función utiliza el secreto `CULQI_SECRET_KEY` configurado en Firebase Secret Manager.

URL:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

## Configuración en CulqiPanel de pruebas

Registrar dos webhooks para el producto `CulqiOnline`, recurso `charge` y acción `creation`:

```text
charge.creation.succeeded
charge.creation.failed
```

Ambos usan la misma URL de Firebase.

## Respuestas del endpoint

- `200`: evento recibido, procesado, repetido o ignorado de manera segura.
- `400`: payload sin tipo de evento o identificador de cargo.
- `401`: entorno incompatible o cargo que la API de Culqi no confirmó.
- `405`: método diferente de POST.
- `413`: cuerpo demasiado grande.
- `422`: el cargo no contiene la metadata creada por NOSTRA.
- `503`: la API de Culqi no estuvo disponible; permite que Culqi reintente la entrega.

## Colección de auditoría

Cada entrega genera como máximo un documento pequeño en:

```text
culqi_webhook_eventos/{sha256}
```

La clave determinística evita procesar dos veces la misma entrega. La colección queda cerrada al navegador por las reglas generales de Firestore; Cloud Functions usa Admin SDK.

## Prueba de cargo aprobado completada

Se verificó:

```text
charge.creation.succeeded
200 OK
```

Resultado administrativo esperado:

```text
estadoPago: pago_validado
pagoValidado: true
matriculaAprobada: true
estado: listo_para_matricula
confirmadoPorWebhook: true
```

## Prueba de cargo rechazado

Crear una preinscripción nueva y usar una tarjeta de integración destinada a producir rechazo. El resultado esperado es:

```text
charge.creation.failed
200 OK
```

Estado administrativo esperado:

```text
estadoPago: pago_rechazado
pagoValidado: false
matriculaAprobada: false
confirmadoPorWebhook: true
```

Si el pago ya estaba aprobado, el webhook no lo degrada y registra:

```text
resultado: fallo_ignorado_pago_ya_aprobado
```

## Paso a producción

La secuencia completa de activación, prueba real y reversión está documentada en:

```text
CULQI_PAGO_RECHAZADO_Y_PRODUCCION.md
```
