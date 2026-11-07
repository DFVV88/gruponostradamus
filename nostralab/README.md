# NostraLAB — Biblioteca científica web

Ruta institucional prevista: https://gruponostradamus.edu.pe/nostralab/

## Estructura
- `index.html`: catálogo responsive con filtros por disciplina.
- `laboratorio.html?id=...`: visor inmersivo que abre el simulador directamente, con Matrícula (formulario oficial `../preinscripcion.html`), Compartir (WhatsApp, Facebook, X, Telegram, LinkedIn, menú del dispositivo y Copiar enlace) y Ver otros laboratorios.
- `experiencia.html?id=...`: compatibilidad; redirige al visor inmersivo para los enlaces anteriores.
- `catalogo.json`: manifiesto público **solo de laboratorios aprobados para publicación**.
- `experiencias/<slug>/index.html`: cada simulación definitiva, autónoma y revisada.

## Protocolo de publicación (manual y explícito, nunca en segundo plano)

El HTML se entrega primero al solicitante para revisar, antes de archivar ni publicar. Al aprobar expresamente su **difusión pública** se ejecuta:
1. Validar la versión exacta: HTML real, offline, logo original, unidades SI, controles, navegación, acceso móvil, QA científico, integridad SHA-256.
2. Confirmar que no existen datos personales de alumnos, secretos, enlaces privados de SharePoint, credenciales ni instrucciones de laboratorio peligrosas.
3. Guardar el artefacto aprobado en SharePoint NOSTRAOS, en `General/02_ACADEMICO/ACA-004_MATERIALES_ACADEMICOS/NOSTRALAB_SIMULADORES_APROBADOS`, sin sobrescribirlo; registrar metadatos, estado y hash.
4. Confirmar autorización inequívoca: «APROBADO PARA PUBLICAR EN NOSTRALAB» para esta versión exacta. Aprobación interna no significa publicación.
5. Crear `experiencias/<slug>/index.html` en GitHub `DFVV88/gruponostradamus`; para una nueva revisión, usar slug versionado, preservando el histórico.
6. Añadir un registro al array `experiencias` de `catalogo.json`, verificando los campos: `id`, `titulo`, `curso`, `descripcion`, `ruta`, `publicado`, `publicado_el`. Sin duplicados.
7. Publicar el cambio por el flujo real del repositorio (rama/PR para revisión o commit autorizado a main), comprobar el despliegue y abrir la URL pública. No considerar publicada una experiencia solo por crear un commit.
8. Verificar en Chrome móvil/escritorio el catálogo, ficha, visor interactivo, enlaces y descarga/autonomía del HTML. Reportar URL y SHA final, o indicar fallo / despliegue pendiente.

## Seguridad del visor
- Solo rutas de experiencias con formato `experiencias/<id>/index.html` y `publicado: true` en catálogo.
- El iframe se sirve en modo sandbox con `allow-scripts allow-downloads` pero **sin** `allow-same-origin` para aislar el contenido de cada laboratorio.
- No publicar HTML no auditado ni depender de contenido externo. No agregar tokens a código cliente.
- El catálogo se inserta como texto con `textContent`; jamás se interpola contenido como HTML.

## Ejemplo de registro (no publicar sin archivo aprobado)
```json
{
  "id": "ondas-pulso-viajero-v001",
  "titulo": "Reflexión de pulsos en una cuerda",
  "curso": "Física",
  "descripcion": "Explora la reflexión en extremos fijo y libre y observa la inversión de fase.",
  "ruta": "experiencias/ondas-pulso-viajero-v001/index.html",
  "publicado": true,
  "publicado_el": "2026-11-07"
}
```

No se incluyen experiencias en el catálogo inicial. No confundir esta rama de desarrollo con un despliegue en producción.

## Navegación de proyectos (regla permanente)
Todas las tarjetas publicadas deben apuntar directamente a `./laboratorio.html?id=<id>`, sin ficha intermedia ni botón «Abrir en pantalla independiente». El visor debe ocupar el espacio disponible y mostrar las acciones Matrícula, Compartir y Ver otros laboratorios (aparte del logo/título institucional). Matrícula debe abrir `../preinscripcion.html` (formulario institucional verificado) en otra pestaña con `rel="noopener noreferrer"`, manteniendo intacto el experimento. Las tres acciones deben ser accesibles y legibles en móvil, incluso a 320 px. Las redes sociales comparten la URL del propio visor; el HTML científico aprobado se carga en un iframe aislado, no se altera. Los enlaces antiguos de `experiencia.html?id=<id>` deben redirigir al visor nuevo, manteniendo el identificador. Comprobar en PC y móvil y realizar un despliegue web real. Evitar reutilizar rutas antiguas cacheadas para las tarjetas.

## Captación institucional permanente
En cada visor de NostraLAB, incluir arriba el botón visible «Matrícula» con destino único al formulario oficial `https://gruponostradamus.edu.pe/preinscripcion.html`. No crear formularios paralelos ni redirigir a WhatsApp en sustitución del formulario. La barra de acciones será Matrícula · Compartir · Ver otros laboratorios, sin botón de pantalla independiente. Comprobar destino en escritorio/móvil tras cada actualización.
