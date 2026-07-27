# Backend seguro de Culqi — Grupo Nostradamus

Este bloque procesa pagos sin exponer la llave privada de Culqi en el navegador.

## Arquitectura implementada

1. La preinscripción se crea en Firestore con pago pendiente.
2. `culqiPreparePayment` recibe el ID y el código de la solicitud.
3. El servidor vuelve a leer `programas_publicos` y recalcula el monto oficial.
4. Se crea un documento privado en `intentos_pago` con vencimiento de 20 minutos.
5. Culqi Custom Checkout genera un token en el navegador.
6. `culqiCreateCharge` recibe únicamente el token, el ID del intento y la solicitud.
7. El servidor vuelve a validar el tarifario y crea el cargo con la llave privada.
8. Solo un cargo aprobado actualiza:

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
- `culqiCreateCharge`: crea el cargo con Culqi.
- `culqiPaymentStatus`: consulta un resultado usando ID y código de solicitud.

Región configurada: `us-central1`.

## Requisitos

- Node.js 20.
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

No escribas la llave privada en HTML, JavaScript público, GitHub, `.env` ni Firestore.

Ejecuta:

```bash
firebase functions:secrets:set CULQI_SECRET_KEY
```

Cuando la terminal lo solicite, pega la llave privada de integración:

```text
sk_test_...
```

## 3. Desplegar las funciones

```bash
firebase deploy --only functions:culqiBackendHealth,functions:culqiPreparePayment,functions:culqiCreateCharge,functions:culqiPaymentStatus
```

Al terminar, Firebase mostrará las URL públicas. En la configuración actual deberían seguir este formato:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiBackendHealth
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiPreparePayment
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiCreateCharge
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiPaymentStatus
```

## 4. Comprobar el backend

Abre en el navegador:

```text
https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/culqiBackendHealth
```

La respuesta esperada contiene:

```json
{
  "ok": true,
  "service": "nostra-culqi-backend"
}
```

## Seguridad incluida

- CORS limitado al dominio oficial, `www`, GitHub Pages y desarrollo local.
- El servidor no acepta montos enviados por el navegador.
- El programa y el plan se consultan nuevamente antes de cobrar.
- La promoción se evalúa con fecha de Perú.
- Los importes se trabajan en céntimos.
- Se bloquean intentos vencidos y solicitudes ya pagadas.
- Los intentos aprobados son idempotentes al consultarse nuevamente.
- Un cambio en el panel invalida el intento anterior.
- La llave `sk_test` se obtiene únicamente desde Secret Manager.
- Los tokens de tarjeta o Yape no se almacenan.
- Se registra metadata para conciliar el cargo con la preinscripción.

## Estado de la integración 3DS

El backend detecta una respuesta `REVIEW` y la registra como `requiere_3ds`, pero el desafío 3DS todavía no está conectado en el navegador. Esa conexión se realiza en la etapa del checkout.

## Siguiente etapa

Después de desplegar y comprobar `culqiBackendHealth`, se configura la llave pública `pk_test`, se conecta Culqi Custom Checkout a `preinscripcion.html` y se prueban tarjetas y Yape de integración.
