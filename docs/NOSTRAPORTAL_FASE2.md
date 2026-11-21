# NostraPORTAL — fase 2: vinculación y consulta individual

Fecha: 21/11/2026. Proyecto Firebase: nostrachat-grupo-nostradamus.

## Qué se implementó

- Cloud Function nueva nostraportalApi (region us-central1, runtime Node 20, 0 instancias mínimas, máx. 3), aislada de Culqi, asistenciaRegistrar y asistenciaAdmin.
- Endpoint POST autenticado: action=admin_link sólo para cuenta administrativa verificada. Vincula users/{uid} con preinscripciones/{preinscripcionId} mediante transacción con dos índices exclusivos e inmutables:
  - nostraportal_vinculos/{uid} -> preinscripcionId
  - nostraportal_vinculos_inversos/{preinscripcionId} -> uid
- Exige rol alumno, cuenta activa no bloqueada, matrícula aprobada y confirmación manual del DNI de matrícula y correo institucional de la cuenta. Rechaza duplicidades. No acepta vinculaciones decididas sólo por el cliente alumno.
- Endpoint POST action=student_state comprueba Firebase ID token revocable, rol, activación, bloqueo y vínculo bidireccional. Consulta el DNI desde la matrícula en el servidor (nunca de una petición del alumno).
- Devuelve únicamente matrícula individual, asistencia registrada (fecha, entrada, salida, tardanza), cuotas programadas (concepto e importes) y metadatos de reportes individuales publicados si existen. No expone DNI, emails de padres, ingresos financieros ni colecciones generales.
- NostraADMIN: admin-nostraportal.html y enlace en menú lateral, para vincular una cuenta después de verificar identidad.
- Portal personal: muestra datos auténticos de la alumna vinculada, historial de marcaciones y cuotas; sin vínculo o Cloud Function no desplegada muestra estado pendiente sin inventar información.
- No cambia ningún dato de preinscripciones, finanzas, Culqi, alumnos_abonos, alumno_cuotas, asistencia_registros o NostraLAB.

## Seguridad

Las reglas actuales de firestore.rules cierran toda colección no declarada:
match /{document=**} {allow read,write:if false}. Dejar ese cierre tal cual. Las dos colecciones de vínculo y reportes_alumnos no son accesibles por SDK del navegador; sólo por Cloud Functions Admin SDK autorizadas.

Un vínculo administrativo debe hacerse en presencia de una ficha oficial confirmada. Si un UID y matrícula se asocian erróneamente, la solución será un procedimiento de desvinculación auditado (no borrar manualmente).

La consulta de asistencia reutiliza la colección de registros escritos por NostraASISTENCIA, sin alterar el flujo QR. No deriva ausencias de falta de marcación, ni calcula una tasa de asistencia sin calendario.

Los pagos son exclusivamente cuotas en alumno_cuotas; NO incluye un estado de cuenta contable exhaustivo ni movimientos de finanzas_movimientos. Para ese módulo integral se necesitará consolidación adicional.

## Publicación

GitHub Pages se despliega al integrar la rama principal. Eso **NO despliega funciones de Firebase**.

Antes de probar datos reales de alumnos, desde terminal Cloud Shell con credenciales autorizadas ejecutar:

  firebase use nostrachat-grupo-nostradamus
  cd functions
  npm ci
  npm run check
  cd ..
  firebase deploy --only functions:nostraportalApi --project nostrachat-grupo-nostradamus

Al desplegar confirmar permisos del proyecto y revisar que esta función responde sólo a POST con sesión válida. Un GET o POST anónimo debe rechazarse. No compartir tokens o contraseñas.

El frontend muestra aviso de "Conexión pendiente" hasta que la función esté desplegada. **NO presentar la integración individual como verificada en producción sin una prueba real autenticada**.

## Pruebas

node --test functions/test/nostraportal-policy.test.js
node --test scripts/test-nostraportal-phase1.mjs
node --test scripts/test-nostraportal-phase2.mjs

Casos reales posteriores a despliegue (siempre con cuenta de prueba autorizada, nunca modificar pagos):
1. Cuenta sin vincular => no muestra matrícula, notas, cuotas ni marcaciones.
2. Cuenta activa vinculada => sólo muestra sus registros.
3. Cuenta bloqueada => 403, sesión local oculta.
4. DNI o correo de confirmación incorrecto => 409 y ninguna escritura.
5. Dos cuentas que intentan vincular la misma ficha => bloqueada la segunda.
6. Otra cuenta solicita consulta => no ve datos de la primera.
7. Comprobar fechas en America/Lima contra registros reales de NostraASISTENCIA.

## Siguiente etapa

- NostraREPORTES: carga administrativa con verificación NostraQA y asignación por UID + registro de identidad, almacenamiento privado PDF, descarga firmada/autorizada, auditoría y archivo de reportes anteriores.
- Conciliación de abonos y comprobantes visibles exclusivamente al alumno.
- Horarios, materiales y comunicados autorizados por ciclo.
