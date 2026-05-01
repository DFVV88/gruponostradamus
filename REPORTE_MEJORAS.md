# Reporte de mejoras aplicadas

## Cambios aplicados

- Se agregó `README.md`.
- Se agregó `.gitignore`.
- Se agregó `_headers` con cabeceras básicas de seguridad.
- Se cambió `http://gruponostradamus.q10.com/` por `https://gruponostradamus.q10.com/`.
- Se reemplazaron enlaces internos `index-2.html` por `index.html`.
- Se creó `assets/img/favicons/manifest.json` válido.
- Se creó `assets/img/favicons/ms-icon-144x144.png` usando el favicon existente.
- Se corrigieron referencias al manifiesto y al icono de Microsoft.
- Se eliminaron referencias de fondo hacia archivos `.html` que eran 404.
- Se reforzó `rel="noopener noreferrer"` en enlaces con `target="_blank"`.
- Se aplicaron mejoras SEO básicas en páginas principales.

## Mejoras aplicadas el 2026-05-01

- Se creó `clases-en-vivo.html`, una página interna para orientar a alumnos antes de ingresar a Microsoft Teams.
- Se actualizó `assets/js/nostra-live-classes-fix.js` para que los botones de “Clases en vivo” dirijan a la nueva página interna en vez de abrir Teams directamente.
- Se actualizó `sitemap.xml` incorporando `clases-en-vivo.html` y renovando fechas `lastmod`.
- Se reforzó `_headers` con cabeceras de seguridad adicionales y reglas de caché para HTML, CSS, JS e imágenes.
- Se actualizó `README.md` con la nueva estructura, checklist de publicación y recomendaciones de mantenimiento.

## Mejora PRO de conversión aplicada

- Se añadió una barra superior comercial para destacar cupos e informes.
- Se añadió botón flotante de WhatsApp visible en escritorio y móvil.
- Se añadió una franja de confianza debajo del hero con años de experiencia, enfoque UNI, simulacros y plataforma Q10.
- Los cambios se insertan por JavaScript para no romper la estructura original del HTML.
- Los estilos se agregaron al CSS existente `assets/css/nostra-home.css`.

## Pendientes recomendados

1. Comprimir y convertir imágenes grandes a WebP.
2. Revisar enlaces que apuntan a páginas genéricas de plantilla como `course.html`, `course-details.html`, `about.html` y `contact.html`.
3. Mover metadatos SEO críticos directamente al `<head>` de cada página prioritaria.
4. Separar estilos inline repetidos hacia archivos CSS.
5. Consolidar scripts `nostra-*` para reducir carga y facilitar mantenimiento.
6. Validar visualmente la web publicada en móvil y escritorio.
