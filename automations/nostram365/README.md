# NostraM365 - automatizacion independiente (fase de preparacion)

**ESTADO: NO DESPLEGADO / DESACTIVADO POR DEFECTO.**

Este directorio no es importado por el codigo actual de functions/index.js.
No modifica la web, el panel de matriculas, Culqi, asistencia ni NostraCUENTA.

## Flujo al activarse

Cuando una preinscripcion DE LA WEB (origen: web_preinscripcion) cambia
de no elegible a matriculaAprobada === true Y pagoValidado === true,
con estadoPago === pago_validado y sin correo institucional previo:

1. Vuelve a leer el documento y comprueba que siga aprobado y pagado.
   Revalida otra vez justo antes de crear el usuario y de enviar el correo;
   si la aprobacion o el contacto cambiaron, suspende la operacion.
   Las fichas de origen registro_manual_admin quedan excluidas del disparador.
2. Crea nostram365_private/{preId} de forma transaccional; solo se permite
   un intento automatico por registro.
3. Genera una propuesta de correo primerNombre.primerApellido; si los
   nombres son ambiguos, detiene la operacion para revision manual.
4. Consulta Microsoft Graph por UPN exacto y displayName completo; si ya
   existe una cuenta manual, DETIENE la creacion (requiere vinculacion humana).
5. Verifica exclusivamente Office 365 A1 para estudiantes
   STANDARDWOFFPACK_STUDENT, SKU 314c4481-f395-4525-be8b-2ec4bb1e9d91.
6. Crea el usuario con cambio obligatorio de clave al primer ingreso;
   cifra la clave temporal con AES-256-GCM en un documento privado.
7. Asigna la licencia A1 y envia la bienvenida desde
   informes@gruponostradamus.edu.pe al correo PERSONAL del formulario.
8. El correo contiene pasos de Teams y NostraCUENTA y un enlace de activacion
   separado, alojado en Cloud Functions (NO en la web institucional).
9. El enlace usa un token aleatorio de 256 bits en el fragmento URL (#),
   no en la peticion GET; un POST permite mostrar la clave UNA SOLA VEZ,
   dentro de 48 horas. El registro cifrado y el hash se borran tras usarse.

El resultado 202 de Microsoft Graph solo significa que Exchange acepto el
mensaje, NO que llego a la bandeja. No enviar password en correo plano.

## Aislamiento y reglas de seguridad

- Firebase codebase independiente llamada nostram365.
- firebase.json propio bajo automations/nostram365, no toca config raiz.
- No se cambia ni se despliega ninguna de las ocho funciones existentes.
- Sin retroactividad: reaccion a una transicion nueva de aprobacion y
  NOSTRA_M365_NOT_BEFORE (fecha ISO del inicio operativo).
- Off por defecto. Requiere ambas variables TRUE:
  NOSTRA_M365_ENABLED y NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED.
- Todos los fallos de Graph y resultados ambiguos van a requiere_revision.
  Nunca reintenta automaticamente mutaciones externas.
- No borra matriculas; no toca los datos de pago ni registros del alumno.
- La creacion manual en Microsoft 365 se mantiene operativa.
- Los resultados se registran en nostram365_private; no aparece una nueva UI.

## Permisos pendientes y consentimiento consciente

Aplicacion de Entra: NostraWEB-Matriculas-M365, tenant unico.

Permisos de APLICACION Microsoft Graph:
- User.Create (creacion de usuarios).
- User.Read.All (consulta de duplicados).
- LicenseAssignment.Read.All (lista de licencias).
- LicenseAssignment.ReadWrite.All (asignacion A1).

Para correo: RBAC for Applications de Exchange Online: asignar el rol
Application Mail.Send con un scope RESTRINGIDO al buzon
informes@gruponostradamus.edu.pe. No conceder Mail.Send sin alcance
de toda la organizacion desde Entra; una concesion sin alcance
NO queda restringida automaticamente por RBAC de Exchange.

Comprobar envios desde Informes y rechazo desde otro buzon con una
prueba controlada antes de activar. Comprobar que Informes es un buzon
Exchange Online operativo. No dar consentimiento administrativo hasta
revisar la configuracion y el alcance real de cada permiso.

## Secrets y configuracion (NO guardar en repositorio)

Secret Manager:
- NOSTRA_M365_CLIENT_SECRET: credencial de aplicacion Entra.
- NOSTRA_M365_ACTIVATION_KEY: 32 bytes criptograficamente aleatorios,
  codificados en base64 (mantener estable hasta caducidad de enlaces).

Variables del ambiente, no secretas:
- NOSTRA_M365_TENANT_ID: GUID del directorio.
- NOSTRA_M365_CLIENT_ID: GUID de la aplicacion.
- NOSTRA_M365_ENABLED: false por defecto.
- NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED: false por defecto.
- NOSTRA_M365_NOT_BEFORE: fecha/hora ISO, p. ej. 2026-12-01T00:00:00-05:00.

La ultima fecha es el corte para procesar eventos; los eventos anteriores
no se procesan. Configurarla deliberadamente antes de un piloto.

## Pruebas sin desplegar

En automations/nostram365:

    npm install
    npm test

No ejecutan pagos, no crean cuentas de Microsoft 365 y no envian correo.

## Despliegue futuro selectivo - NO EJECUTAR SIN APROBACION

Usando Firebase CLI moderna con soporte de codebases:

    cd automations/nostram365
    firebase deploy --project nostrachat-grupo-nostradamus --config firebase.json --only functions:nostram365

Este comando es solo la ruta prevista para una etapa posterior.
Comprobar la salida del despliegue; nunca aceptar un aviso de borrar
funciones existentes. Probar antes con todos los interruptores en false.

No utilizar el firebase.json principal para desplegar esta codebase.

## Monitoreo y recuperacion

Estados de nostram365_private:
en_revision, requiere_revision, requiere_vinculacion_manual,
cancelada_antes_de_crear, preparada_para_crear, creada_sin_licencia,
creada_licenciada, creada_licenciada_pendiente_contacto,
enviando_bienvenida, bienvenida_aceptada.

Si una cuenta se crea pero falla la licencia, comprobarla y corregir
la A1 manualmente. Si hubo timeout enviando correo, revisar la bandeja
Enviados de Informes ANTES de pensar en reenviar. Eliminar el trabajo
privado para repetir no es seguro y NO esta contemplado como recuperacion.
Los accesos temporales vencidos o consumidos requieren reset en Microsoft 365.

No se actualiza correoInstitucionalAsignado en preinscripciones, para no
alterar ningun flujo existente. La cuenta se registra en el trabajo
privado de la automatizacion. Una futura reconciliacion con NostraCUENTA
requerira autorizacion y pruebas independientes.

## Puertas antes de un piloto real

1. Auditar reglas Firestore y confirmar que nostram365_private no es
   legible/escribible desde clientes, solo desde Admin SDK.
2. Confirmar convencion real de nombres y tratamiento de homonimos:
   el mismo nombre NO prueba identidad; variaciones ortograficas pueden
   impedir detectar duplicados. Para casos dudosos, creacion manual.
3. Confirmar roles y permisos de Graph y Exchange, evitando Mail.Send global.
4. Probar en entorno aislado o con un unico usuario de ensayo autorizado.
5. Comprobar A1/Teams real, costos de Blaze y alarmas de presupuesto.
6. Verificar envio y activacion en correo personal de ensayo.
7. Preparar procedimiento de revision para fallos parciales, sin reintentos ciegos.

## Referencias oficiales

Firebase: https://firebase.google.com/docs/functions/organize-functions

Graph create: https://learn.microsoft.com/graph/api/user-post-users

Graph license: https://learn.microsoft.com/graph/api/user-assignlicense

Graph skus: https://learn.microsoft.com/graph/api/subscribedsku-list

Graph mail: https://learn.microsoft.com/graph/api/user-sendmail

Exchange RBAC: https://learn.microsoft.com/exchange/permissions-exo/application-rbac
