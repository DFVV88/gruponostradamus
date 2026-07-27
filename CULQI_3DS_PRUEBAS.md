# Culqi 3DS — pruebas de integración

La web de preinscripción integra Culqi Custom Checkout y Culqi3DS en modo de prueba.

## Flujo implementado

1. El navegador tokeniza la tarjeta mediante Culqi Custom Checkout.
2. Culqi3DS genera `device_finger_print_id`.
3. El backend intenta crear el cargo con el precio oficial y la huella del dispositivo.
4. Cuando Culqi responde `action_code: REVIEW`, el navegador abre la autenticación 3DS.
5. La web recibe `parameters3DS` y repite el cargo con el mismo token y la misma huella.
6. Firestore solo marca `pago_validado` cuando Culqi devuelve un cargo aprobado.

El token no se almacena. Para vincular de forma segura ambas pasadas 3DS, el backend guarda únicamente un hash SHA-256 temporal del token y la huella del dispositivo.

## Despliegue

Después de actualizar el repositorio en Cloud Shell:

```bash
cd ~/gruponostradamus
git fetch origin main
git reset --hard origin/main
firebase use nostrachat-grupo-nostradamus
firebase deploy --only functions:culqiCreateCharge
```

El frontend se publica mediante GitHub Pages. Después de la publicación, actualizar `preinscripcion.html` con `Ctrl + F5`.

## Prueba 3DS con Challenge

Usar una preinscripción nueva y seleccionar pago en línea.

- Correo: `review@culqi.com`
- Tarjeta: `4456 5300 0000 1096`
- Vencimiento: `07/30`
- CVV: `111`

Resultado esperado: Culqi solicita autenticación 3DS, muestra el Challenge y, después de completarlo, confirma el cargo de prueba.

## Prueba 3DS sin Challenge

- Correo: `review@culqi.com`
- Tarjeta: `4456 5300 0000 1005`
- Vencimiento: `07/30`
- CVV: `111`

Resultado esperado: autenticación 3DS exitosa sin interacción adicional y cargo aprobado.

## Controles incorporados

- El precio se recalcula en el servidor.
- Se exige la misma preinscripción, intento y código de solicitud.
- El segundo cargo 3DS debe usar el mismo token y la misma huella.
- Se bloquean procesos concurrentes.
- No se almacena el token de tarjeta.
- La matrícula no se aprueba durante `requiere_3ds`.
- Una autenticación vencida o inválida obliga a crear un intento nuevo.
