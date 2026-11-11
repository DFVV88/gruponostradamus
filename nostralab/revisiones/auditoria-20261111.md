# Correcciones de la auditoría NostraLAB

Se conservan los cinco identificadores públicos, sus contadores y los HTML anteriores.

- Circunferencia v34: las razones próximas a un ángulo singular siguen siendo finitas; los múltiplos exactos de un cuarto de vuelta conservan sus valores especiales.
- Reflexión v2.6: escala vertical estable por configuración, con espacio para la amplitud total; apoyo deslizable visible; casilla y deslizador de rapidez sincronizados, incluso al derivar la rapidez de la tensión. Entrar y salir de una casilla sin editarla no cambia el modelo.
- Interferencia v010: 179° y 181° se clasifican como interferencia parcial, 180° con amplitudes iguales como cancelación total y dos fuentes apagadas como ausencia de ondas. El registro interno describe por separado los modelos 1D y 2D.
- Portal: se retiran tres referencias rotas a un pie comercial externo. Se conserva el pie del catálogo y el espacio completo del visor.
- Miniatura de interferencia: se reutiliza sin editar el recurso institucional 1280 × 720 ya existente; la imagen social 1200 × 630 permanece intacta.

Las versiones y huellas están en `auditoria-20261111.json`. El estado de validación no constituye por sí solo aprobación de publicación.

## Verificación

Desde la raíz del repositorio:

```text
node --test functions/test/nostralab-visits.test.js functions/test/nostralab-published-registry.test.js
python -m pip install playwright==1.65.0
python -m playwright install chromium
python scripts/test-nostralab-browser.py
```

La prueba del navegador intercepta el contador y bloquea las conexiones externas de los simuladores. No genera visitas en producción. Puede usarse un navegador ya instalado definiendo `NOSTRALAB_BROWSER` con la ruta del ejecutable. Las capturas y los resultados quedan en `test-results/nostralab`, o en la carpeta indicada por `NOSTRALAB_TEST_OUTPUT`.

Validación local: 14 pruebas de registro/contador y 160 comprobaciones de navegador aprobadas; capturas del máximo de reflexión y del desafío de 179° inspeccionadas. Se comprobaron anchos de 320, 360, 390, 768 y 1280 px. No se certifica Safari ni hardware móvil real.

## Recuperación

Para volver a una revisión anterior, restaurar en el catálogo su ruta, versión y huella desde `version_anterior`, sin cambiar el ID público. Los archivos históricos no se sobrescriben. La corrección del portal y la miniatura pueden revertirse de forma independiente.
