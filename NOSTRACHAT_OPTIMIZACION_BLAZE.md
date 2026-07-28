# NostraCHAT — optimización de consumo en Firebase Blaze

## Objetivo

Reducir lecturas, escrituras, almacenamiento y transferencia sin perder:

- chat en tiempo real;
- usuarios conectados;
- imágenes académicas;
- respuestas de DAMUS;
- moderación administrativa;
- seguridad de NostraCUENTA.

## Mejoras implementadas

### 1. Un solo listener de mensajes

El núcleo de NostraCHAT mantiene únicamente un listener de mensajes por usuario y sala.

Los módulos de imágenes y DAMUS reciben los mismos datos mediante el evento interno:

```text
nostrachat:messages
```

Ya no abren consultas independientes sobre la colección de mensajes.

El historial visible se redujo de hasta 80–100 documentos por módulo a los 40 mensajes más recientes en total.

### 2. Pausa automática

Cuando la pestaña queda oculta:

- se detiene el listener de mensajes;
- se detiene el listener de presencia;
- no se escriben latidos de presencia.

Al volver a la pestaña se reanuda la conexión.

### 3. Presencia eficiente

La presencia pasó de una escritura cada 15 segundos a una cada 90 segundos.

Configuración:

```text
Heartbeat: 90 segundos
Usuario activo: 210 segundos
Expiración: 5 minutos
Máximo consultado: 30 usuarios
```

### 4. Imágenes fuera de Firestore

Las imágenes nuevas se guardan en Cloud Storage.

Firestore conserva solamente:

- URL;
- ruta del archivo;
- tamaño;
- dimensiones;
- tipo MIME.

La compresión máxima configurada es aproximadamente 120 KB y 800 px por lado.

Las imágenes antiguas en Base64 siguen mostrándose mientras existan, para no romper el historial anterior.

### 5. Panel administrativo bajo demanda

El panel dejó de mantener listeners permanentes en todas las salas.

Ahora:

- usa consultas puntuales;
- consulta hasta 20 registros recientes por sala;
- incluye un botón `Actualizar`;
- no hace una lectura adicional por cada imagen;
- la lista de usuarios se consulta solo al abrir su pestaña.

### 6. Política de conservación

Los documentos nuevos reciben `expiresAt`:

```text
Mensajes normales: 30 días
Imágenes: 10 días
Respuestas DAMUS: 30 días
Reportes: 90 días
Presencia: 5 minutos
```

El archivo `firestore.indexes.json` activa TTL para los grupos de colección:

- `messages`;
- `reports`;
- `presence`.

Los mensajes con `pinned: true` pueden conservarse, siempre que el administrador retire su campo `expiresAt`.

### 7. Ciclo de vida de Cloud Storage

`nostrachat-storage-lifecycle.json` elimina archivos de la carpeta `nostrachat/` después de 11 días.

## Archivos principales

```text
assets/js/nostrachat-v1.js
assets/js/nostrachat-blaze-optimized.js
assets/js/nostrachat-firebase-config.js
assets/js/nostrachat-admin.js
assets/js/nostrachat-admin-users.js
assets/js/nostrachat-admin-images.js
firestore.rules
firestore.indexes.json
storage.rules
nostrachat-storage-lifecycle.json
functions/scripts/nostrachat-retention-backfill.js
```

## Validación local

Desde Cloud Shell:

```bash
cd ~/gruponostradamus
git fetch origin main
git reset --hard origin/main

node --check assets/js/nostrachat-v1.js
node --check assets/js/nostrachat-blaze-optimized.js
node --check assets/js/nostrachat-firebase-config.js
node --check assets/js/nostrachat-admin.js
node --check assets/js/nostrachat-admin-users.js
node --check assets/js/nostrachat-admin-images.js

cd functions
npm install
npm run check
cd ..
```

## Despliegue de reglas y TTL

Después de completar la validación:

```bash
firebase use nostrachat-grupo-nostradamus
firebase deploy --only firestore:rules,firestore:indexes,storage --project nostrachat-grupo-nostradamus
```

## Aplicar ciclo de vida a Storage

```bash
gcloud storage buckets update \
  gs://nostrachat-grupo-nostradamus.firebasestorage.app \
  --lifecycle-file=nostrachat-storage-lifecycle.json \
  --project=nostrachat-grupo-nostradamus
```

## Limpieza del historial existente

Primero ejecutar solamente el diagnóstico:

```bash
cd ~/gruponostradamus/functions
node scripts/nostrachat-retention-backfill.js
```

El modo diagnóstico no modifica Firestore. Muestra cuántos documentos:

- se examinarían;
- recibirían `expiresAt`;
- serían eliminados por antigüedad;
- quedarían protegidos por `pinned: true`.

Solo después de revisar esos totales se aplica la limpieza:

```bash
node scripts/nostrachat-retention-backfill.js --apply
```

## Comprobación funcional

Después del despliegue verificar:

1. iniciar sesión con una NostraCUENTA activa;
2. abrir una sala y enviar un mensaje;
3. cambiar de sala;
4. ocultar y volver a mostrar la pestaña;
5. adjuntar una imagen;
6. pedir una respuesta a DAMUS;
7. abrir el panel administrativo;
8. comprobar que `Actualizar` recarga los registros;
9. revisar que Culqi y la preinscripción continúen funcionando sin cambios.

## Seguridad

No se modificaron ni expusieron:

- llaves privadas de Culqi;
- contraseñas;
- secretos de Firebase;
- claves de DAMUS.

El despliegue de estas mejoras no requiere volver a desplegar las Cloud Functions de Culqi.
