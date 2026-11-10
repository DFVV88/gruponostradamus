# NostraM365 - automatizacion independiente (fase de preparacion)

**ESTADO: AMBAS FUNCIONES DESPLEGADAS; DESACTIVADAS POR DEFECTO.**

Para activar un piloto, es obligatorio usar `NOSTRA_M365_SCOPE_MODE=pilot`,
`NOSTRA_M365_PILOT_PREID` (ID exacto de preinscripción) y
`NOSTRA_M365_PILOT_EMAIL` (correo personal exacto). En modo piloto deben
coincidir ID Y correo, antes y durante la operación. Sin un modo expreso,
la función no procesa alumnos, incluso si los interruptores maestros son true.
`NOSTRA_M365_SCOPE_MODE=production` permite el alcance general SOLO tras
la aprobación y los controles de producción. No debe utilizarse en un piloto.
El código por sí solo no valida la legitimidad de un cobro; exige ambos campos
pagoValidado=true y estadoPago=pago_validado, además de matrícula aprobada
(matriculaAprobada=true o estado=matriculado) en la ficha de preinscripción.

Este directorio no es importado por el codigo actual de functions/index.js.
No modifica la web, el panel de matriculas, Culqi, asistencia ni NostraCUENTA.

## Correo directo de acceso para nuevas matrículas

Por decisión de dirección, para **cuentas nuevas** el correo de bienvenida HTML
conserva el logotipo HD y muestra el usuario y una contraseña de 24 caracteres
generada de forma independiente. El alta de Microsoft Graph establece
`forceChangePasswordNextSignIn: false`: normalmente no solicita un cambio
de clave en el primer acceso, salvo que lo exijan las políticas del tenant.

**Advertencia:** esta contraseña permanece visible en el buzón personal y
puede quedar en los elementos enviados del remitente, por lo que cualquiera
con acceso a esas bandejas podría usarla. Cada alumno recibe una contraseña
única de alta entropía. El proceso no guarda las contraseñas en Firestore ni
en registros de ejecución. Si el envío falla, la cuenta queda en revisión
manual y requerirá restablecer su clave; no se repiten automáticamente las altas.

El endpoint `nostraM365Activar` sigue disponible para los correos antiguos
que contenían enlaces de activación, sin obligar a migrarlos ni invalidarlos.
El despliegue debe ser **solo** del codebase `nostram365`.

## Logo oficial HD en correo HTML

El correo HTML conserva todo el texto de bienvenida y utiliza el **LOGO.png**
oficial de SharePoint, biblioteca NOSTRAOS > 00_ACTIVOS_OFICIALES >
01_LOGO_Y_ESCUDO. Se usa una copia de 600x288 px (3.1x respecto
al ancho de pantalla de 194 px) en `assets/logo-oficial-email.b64`.
No se altera el logo maestro y no se publica nada en la web.
Microsoft Graph adjunta la imagen **CID inline**: funciona sin abrir permisos
publicos de SharePoint y conserva el texto alternativo de la imagen.
Tests validan dimensiones, formato e insercion de la imagen.

Vista previa al buzon personal de ensayo, sin altas ni pagos:

```bash
node scripts/preview-email.js
```

La contraseña que aparece en la vista previa es ficticia y NO funciona para acceder.

No se alteran el contenido de bienvenida, el asunto, las rutas de pago
ni las condiciones de licencia.

## Piloto con cuenta real, pero sin pago ficticio

El script `scripts/pilot-test.js --execute` ejecuta una sola alta de ensayo,
leyendo la preinscripción autorizada, siempre que los dos interruptores
generales permanezcan en `false` y el corte sea 2099. Comprueba nombre,
correo, ausencia de pago aprobado, duplicados en Microsoft y cupos A1;
reserva transaccionalmente por ID con la creación exclusiva de documento
`nostram365_private`, sin modificar pagos ni la ficha administrativa.
En caso de resultado ambiguo NO se reintenta: requiere revisión manual.

El enlace de contraseña temporal del ensayo se habilita con
`NOSTRA_M365_PILOT_ACTIVATION_ENABLED=true` y solo puede consumir el token
de un documento con `origen=piloto_independiente_sin_cobro`, ID y correo
personal exactos del piloto. Esto NO habilita `nostraM365Alta`.
La bienvenida del piloto identifica expresamente su carácter de ensayo.

## Puesta en produccion y parada de emergencia

Tras completar el piloto real de Graph, licencia A1, correo de Informes y
Teams, el propietario puede ACTIVAR la automatizacion para nuevas
transiciones de matriculas pagadas/aprobadas con:

```bash
cd ~/gruponostradamus-nostram365
git pull --ff-only origin feature/nostram365-independent-automation
cd automations/nostram365
bash scripts/go-live.sh --activate
```

**ATENCION:** este comando activa el proceso real. Requiere que .env
se encuentre aun en modo pilot con ambos interruptores apagados y corte 2099.
Ejecuta pruebas, comprueba identidades y disparador, guarda copia de .env,
fija hora UTC de inicio, despliega solo codebase nostram365 y verifica
la configuracion remota. No procesa retrospectivamente aprobaciones antiguas:
el disparador onDocumentUpdated exige una NUEVA transicion a elegible.
Si un despliegue es parcial, intenta pasar a maintenance, para no dejar
sin activacion a alumnos cuyos mensajes ya fueron enviados.

Ante incidencia tras activar la operacion:

```bash
cd ~/gruponostradamus-nostram365/automations/nostram365
bash scripts/maintenance.sh --stop
```

El modo maintenance detiene **nuevas altas** por scopeAllows, pero mantiene
habilitada la lectura de contrasenas temporales YA enviadas. Las cuentas
ya creadas no se borran ni se vuelven a crear. Inspecciona los trabajos en
nostram365_private; nunca borres un trabajo para forzar reintentos.

Seguimiento de logs (Cloud Shell):

```bash
gcloud functions logs read nostraM365Alta --gen2 --region us-central1 \
  --project nostrachat-grupo-nostradamus --limit=30
```

NOTA: el piloto aislado comprobo Microsoft 365, A1, envio y Teams,
pero el disparador Firestore/Eventarc debera observarse con la primera
matricula legitima aprobada y pagada despues del inicio operativo.

## Flujo al activarse

Cuando una preinscripcion DE LA WEB (origen: web_preinscripcion) cambia
de no elegible a elegible: pagoValidado === true y estadoPago === pago_validado,
y además matriculaAprobada === true (Culqi/botón Aprobar) O
estado === matriculado (selectores del panel administrativo), sin correo
institucional previo:

1. Vuelve a leer el documento y comprueba que siga aprobado y pagado.
   Revalida otra vez justo antes de crear el usuario y de enviar el correo;
   si la aprobacion o el contacto cambiaron, suspende la operacion.
   Las fichas de origen registro_manual_admin quedan excluidas del disparador.
2. Crea nostram365_private/{preId} de forma transaccional; solo se permite
   un intento automatico por registro.
3. Genera como primera opcion primerNombre.primerApellido. Si la direccion
   esta ocupada por otra persona, prueba primerNombre.primerApellido + inicial
   del segundo apellido, p. ej. luis.perezg@gruponostradamus.edu.pe.
   Ante nombres o apellidos ambiguos, se requiere revision manual.
4. Consulta Microsoft Graph primero por nombre completo y luego por las
   direcciones propuestas; si ya existe la misma identidad, DETIENE
   la creacion (requiere vinculacion humana). Si ambas direcciones estan
   ocupadas, no crea la cuenta ni improvisa otro correo.
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

## Identidades de ejecucion aisladas (obligatorio ANTES de desplegar)

**Motivo:** la primera simulacion mostraba que Firebase concederia acceso a
ambos secretos M365 a la cuenta predeterminada Compute Engine del proyecto.
Esta cuenta puede usarse tambien por otras funciones. El codigo ahora exige
dos cuentas tecnicas propias. No desplegar hasta que existan y tengan roles
acotados.

- Alta: nostram365-alta@nostrachat-grupo-nostradamus.iam.gserviceaccount.com
  - Acceso de lectura/escritura a Firestore para procesar preinscripciones
    (roles/datastore.user en proyecto, sujeto a auditoria de minimo privilegio).
  - Acceso de lectura SOLO a NOSTRA_M365_CLIENT_SECRET y
    NOSTRA_M365_ACTIVATION_KEY.
  - Permisos para recibir eventos Firestore Eventarc si la infraestructura los
    requiere para la identidad del trigger.
- Activacion: nostram365-activar@nostrachat-grupo-nostradamus.iam.gserviceaccount.com
  - Acceso de lectura/escritura a Firestore solo en el alcance que IAM permite
    (roles/datastore.user en proyecto); el codigo accede solo a la coleccion
    nostram365_private.
  - Acceso de lectura SOLO a NOSTRA_M365_ACTIVATION_KEY.
  - NUNCA acceso al secreto NOSTRA_M365_CLIENT_SECRET.

Comandos iniciales de creacion (sin otorgar permisos ni desplegar):

    gcloud iam service-accounts create nostram365-alta --project=nostrachat-grupo-nostradamus --display-name="NostraM365 - Altas"
    gcloud iam service-accounts create nostram365-activar --project=nostrachat-grupo-nostradamus --display-name="NostraM365 - Activacion"

Solo despues de verificar identidad y politica IAM, conceder roles y acceso
individual por secreto. No conceder roles/editor, roles/owner o
roles/secretmanager.secretAccessor A NIVEL DE PROYECTO a estas identidades.
No modificar ni quitar roles de la cuenta predeterminada: puede ser utilizada
por otras funciones actuales.

Antes de un deploy real, ejecutar otra vez firebase deploy --dry-run
--only functions:nostram365 y verificar que los futuros accesos de Secret
Manager sean exclusivamente para estas dos identidades, en sus respectivos
secretos. Comprobar que no liste la cuenta compute predeterminada como
destinataria de los secretos nuevos.

**Advertencia:** IAM de Firestore con Admin SDK no permite limitar una
identidad a documentos individuales por reglas de seguridad del cliente.
Estos accesos requieren auditoria del codigo y monitoreo; un futuro
aislamiento fuerte implicaria proyecto/base de datos separada y una
integracion de lectura/escritura muy acotada.

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

## Dependencias y seguridad

El modulo aislado utiliza Node.js 22, firebase-admin 14.5.0 y
firebase-functions 7.4.0. Las dependencias fueron actualizadas tras una
auditoria que encontro 9 vulnerabilidades moderadas en la instalacion anterior.
Estas versiones requieren reinstalar los paquetes en Cloud Shell y ejecutar
de nuevo la auditoria. No usar npm audit fix --force ni modificar la codebase
original functions/. Mantener el despliegue BLOQUEADO hasta 0 vulnerabilidades
reportadas o hasta analizar y aceptar documentadamente excepciones.

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
