# Webhook de Culqi para Grupo Nostradamus

Esta etapa agrega la función HTTP `culqiWebhook` para conciliar cargos de Culqi con las preinscripciones guardadas en Firestore.

## Qué resuelve

- Confirma pagos aunque el alumno cierre la página después del cargo.
- Procesa de forma idempotente entregas repetidas del mismo evento.
- Nunca reduce un pago ya aprobado a rechazado por un evento posterior.
- Comprueba preinscripción, intento, código, monto, moneda y entorno.
- Guarda un registro mínimo de auditoría en `culqi_webhook_eventos`.
- No almacena número completo de tarjeta, CVV, token ni payload completo.

## Verificación de seguridad

La documentación pública de Culqi explica cómo registrar webhooks y seleccionar eventos, pero no documenta actualmente una firma criptográfica para validar cada entrega.

Por ese motivo, el endpoint no confía en el contenido recibido. Extrae únicamente el identificador del cargo y vuelve a consultar:

`GET https://api.culqi.com/v2/charges/{id}`

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

No es necesario volver a ingresar la llave privada de Culqi. La función utiliza el secreto `CULQI_SECRET_KEY` que ya está configurado.

URL esperada:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiWebhook
```

## Configuración en CulqiPanel de pruebas

1. Entrar al panel de pruebas.
2. Abrir `Eventos` y luego `Webhooks`.
3. Crear un webhook para eventos de `Cargos`.
4. Pegar la URL de `culqiWebhook`.
5. Seleccionar, cuando estén disponibles, los eventos de cargo exitoso y cargo fallido, por ejemplo:
   - `charge.creation.succeeded`
   - `charge.failed`
6. Guardar.

Los nombres visibles pueden variar ligeramente en CulqiPanel. Debe elegirse la categoría Cargos y no Órdenes mientras solo se procesen tarjetas y Yape mediante cargos únicos.

## Respuestas del endpoint

- `200`: evento recibido, procesado, repetido o ignorado de manera segura.
- `400`: payload sin tipo de evento o identificador de cargo.
- `401`: entorno incompatible o cargo que la API de Culqi no confirmó.
- `405`: método diferente de POST.
- `413`: cuerpo demasiado grande.
- `422`: el cargo no contiene la metadata creada por NOSTRA.
- `503`: la API de Culqi no estuvo disponible; permite que la entrega sea reintentada.

## Colección de auditoría

Cada entrega genera como máximo un documento pequeño en:

```text
culqi_webhook_eventos/{sha256}
```

La clave determinística evita procesar dos veces la misma entrega. La colección queda cerrada al navegador por las reglas generales de Firestore; Cloud Functions usa Admin SDK.

## Prueba recomendada

1. Registrar el webhook en el panel de pruebas.
2. Crear una nueva preinscripción con pago en línea.
3. Completar un pago de prueba normal o 3DS.
4. Confirmar en el panel administrativo:
   - `Pago validado`;
   - `listo_para_matricula`;
   - `confirmadoPorWebhook: true` después de recibir el evento.
5. Revisar que exista un documento en `culqi_webhook_eventos` con `verifiedByCulqiApi: true`.
