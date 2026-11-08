# Contador de visitas acumuladas NostraLAB — implementación v1

## Alcance y medición
El contador aparece en el visor público nostralab/laboratorio.html?id=<id>, NO dentro del iframe del HTML científico aprobado. Los simuladores originales conservan bytes y funcionan offline.
Una visita representa una sesión del navegador (UUID v4 aleatorio en sessionStorage), no una persona única. Recargar la misma sesión no suma. No se pueden recuperar visitas anteriores a su activación.
Cada laboratorio tiene su entero acumulado en Firestore: nostralab_visitas/{id}.

## Despliegue de Firebase (separado de GitHub Pages)
Proyecto: nostrachat-grupo-nostradamus. Región: us-central1. Cloud Function HTTP v2: nostraLabVisits.
Endpoint previsto: https://us-central1-nostrachat-grupo-nostradamus.cloudfunctions.net/nostraLabVisits
En una terminal autenticada con permisos Firebase, ejecutar en la raíz del repositorio:
    cd functions
    npm install
    npm run check
    cd ..
    firebase deploy --only functions:nostraLabVisits --project nostrachat-grupo-nostradamus
GitHub Pages NO despliega las funciones. Sin deploy, el contador permanece oculto y el simulador no falla. No afirmar activación hasta obtener una respuesta real desde la web.

## Seguridad y TTL
Las reglas actuales de Firestore bloquean por defecto las escrituras y lecturas cliente fuera de las colecciones autorizadas. Admin SDK puede escribir con privilegios. Nunca permitir escrituras de navegador directas a nostralab_visitas o nostralab_sesiones.
Configurar política TTL en Firebase/Google Cloud para la colección nostralab_sesiones, campo expireAt (24h). Los totales de nostralab_visitas NO vencen y no se reinician.
Se almacena SHA-256 de un UUID temporal, no nombre, correo, DNI, IP, UA ni huella digital en documentos del contador. Origin/whitelist reducen abuso básico; no impiden bots avanzados. Para protección fuerte incorporar App Check/Turnstile, monitoreo de costes y controles adicionales.

## Alta obligatoria de cualquier simulador futuro
1. Validar HTML exacto con SHA, autorización de archivo y permiso de publicación NostraLAB.
2. Publicar index.html aprobado sin modificar bytes, y registrar slug en nostralab/catalogo.json.
3. Añadir el mismo slug a functions/lib/nostralab-approved.json en el mismo cambio.
4. Ejecutar CI; test nostralab-published-registry exige correspondencia exacta catálogo/whitelist.
5. Desplegar Cloud Function actualizada si whitelist cambia; verificar con sesión nueva, recarga y otra sesión.
6. El visor compartido mostrará el contador automáticamente, sin insertar scripts en el HTML científico.

El contador nunca muestra cifras simuladas. Sin backend, se oculta sin bloquear los controles del laboratorio.
