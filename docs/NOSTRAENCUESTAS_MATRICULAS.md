# NostraENCUESTAS · Matrículas

Módulo de satisfacción para padres de familia integrado a NostraADMIN.

## Flujo

1. Ingresar a **admin-preinscripciones.html** con la cuenta administrativa existente.
2. Abrir **NostraENCUESTAS** desde el menú izquierdo.
3. Buscar un alumno con matrícula aprobada y pulsar **Enviar encuesta**.
4. Confirmar manualmente el WhatsApp del padre, madre o apoderado (no se reutiliza a ciegas el teléfono del alumno) y escribir el trabajador que realizó la atención.
5. Pulsar **Preparar enlace** y luego **Abrir WhatsApp**. El mensaje queda precargado; el operador debe presionar **Enviar** en WhatsApp.
6. El apoderado responde en **encuesta-matricula.html?t=TOKEN**. No necesita iniciar sesión.
7. La respuesta queda en Firestore y aparece en el panel al actualizar. Las calificaciones de 1 o 2 estrellas destacan como alertas; la clasificación por trabajador se realiza según el responsable registrado al preparar el enlace.

**Importante:** WhatsApp Web/app no confirma al sitio si el mensaje se envió o se entregó. El estado *Chat abierto* indica únicamente que se utilizó el botón de WhatsApp. No existe API de WhatsApp ni costo por mensajes por API en esta solución.

## Preguntas

- Atención general: 1 a 5 estrellas (requerida).
- Atención del trabajador: 1 a 5 estrellas (requerida).
- Claridad de información: Sí / Parcialmente / No (requerida).
- Sugerencias: campo libre, máximo 1000 caracteres (opcional).
- WhatsApp de contacto: opcional, con casilla independiente de autorización. Solo se almacena el número cuando existe consentimiento y el número de Perú cumple el patrón 9XXXXXXXX.

## Datos y seguridad

- **encuestas_matricula_tokens/{token}**: token aleatorio generado con Web Crypto (24 bytes ≈ 192 bits); colección con lectura de un documento individual mediante token, sin listado público. **Solo almacena fechas de creación y vencimiento; nunca DNI, alumno ni teléfono.** Caduca a los 30 días.
- **encuestas_matricula_envios/{preinscripcionId}**: acceso exclusivo de administrador, conserva token, alumno, ciclo, trabajador, destinatario, estado de preparación/chat abierto.
- **encuestas_matricula_respuestas/{token}**: respuesta única por token; solo se permite una creación válida dentro del plazo. Lectura, modificación y listado exclusivos del administrador. El número de WhatsApp no se guarda sin autorización.
- Las reglas se mantienen en **.nostrachat/firestore-rules-parts/insert-encuestas-matricula.rules** y en el archivo ensamblado **firestore.rules**.
- Se reutiliza el inicio de sesión administrativo existente; no se incorporan credenciales adicionales ni se cambian los permisos de las colecciones anteriores.

## Paso obligatorio para activar la función

**Publicar las reglas de Firestore actualizadas en el proyecto Firebase nostrachat-grupo-nostradamus.** Un commit en GitHub no despliega reglas en Firebase. Con Firebase CLI, desde una copia actualizada de este repositorio:

    npx firebase-tools login
    npx firebase-tools deploy --only firestore:rules --project nostrachat-grupo-nostradamus

Es indispensable confirmar el proyecto antes de desplegar. La publicación de la web estática también debe apuntar a la versión del repositorio que contenga los nuevos archivos. Sin las reglas, el formulario NO debe usarse en producción.

## Verificación manual previa al uso

- En el panel, acceder con el administrador, abrir NostraENCUESTAS, confirmar listado de matrículas aprobadas y estadísticas.
- Probar que el panel administrativo no aparezca al iniciar sesión como usuario no autorizado.
- Abrir formulario sin token: debe rechazar el enlace.
- Generar enlace para una matrícula de prueba; comprobar que WhatsApp precarga el número y el mensaje correcto, sin enviar automáticamente.
- Responder con 5/5, claridad Sí y sin WhatsApp: debe funcionar.
- Intentar responder dos veces: la segunda debe fallar por reglas Firestore.
- En otro enlace de prueba, responder 1/5 y autorizar contacto: verificar alerta y botón para contactar.
- Probar número inválido y autorización sin número: debe validar antes de guardar.
- Confirmar que no se almacenan DNI ni datos de alumnos en tokens públicamente consultables.
- Probar vista móvil (360 px), escritorio y cierre de sesión.

## Limitaciones actuales

- El panel consulta las 500 preinscripciones más recientes y hasta 1000 invitaciones/respuestas por carga; para un histórico mayor se requiere paginación.
- No se confirma entrega real de WhatsApp.
- El estado de respuesta no se actualiza por push; se muestra al pulsar **Actualizar resultados** o al abrir el módulo tras iniciar sesión.
- Para preservar la integridad y evitar duplicados, el enlace se reutiliza mientras esté vigente. Si vence sin respuesta, puede prepararse otro.

## Pruebas internas aisladas

El botón **Crear prueba interna** genera un enlace de una hora y una invitación marcada `isTest` en las colecciones de encuestas. No crea ni modifica preinscripciones, matrículas, pagos, cuentas ni movimientos financieros, y no prepara mensajes de WhatsApp. Las respuestas se muestran en **Pruebas internas** y se excluyen de los indicadores, comentarios y valoraciones de las familias. Se conservan como evidencia de diagnóstico.

Los tokens públicos aceptan exclusivamente `createdAt` y `expiresAt`, también para escrituras administrativas. El formulario aclara que la respuesta es privada y está vinculada con la matrícula. Al cerrar sesión se limpia el estado del módulo y se invalidan las cargas pendientes.
