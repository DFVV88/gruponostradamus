# NostraLAB — Tres revisiones experimentales UNI para revisión (8 nov 2026)

Estado: **BORRADOR / QA ESTÁTICO**. **No aprobado para archivo en SharePoint ni para publicación pública**. Las versiones actuales del catálogo siguen intactas; los contadores Firebase y las miniaturas oficiales no han sido tocados.

## Patrón común (v1.11)
Cada borrador conserva simulación científica, controles, variables y gráficas del HTML ya publicado y agrega:
- Tres pasos explícitos sobre la experiencia existente: **Predice → Experimenta → Contrasta**.
- Ficha curricular plegable: curso, tema 11 Ondas mecánicas (NOSTRATEMAS/TEMARIO_UNI.pdf p.24), subtema, microtema, núcleo y prerrequisitos.
- Fundamento UNI y límites del modelo en un bloque <details> cerrado por defecto.
- Ejercicio **original tipo UNI** con respuesta razonada plegable.
- Contrato JSON NOSTRALAB_UNI_EXPERIMENT_V1 y marcadores de auditoría, sin modificar el JavaScript del motor.
- HTML autosuficiente: se conservaron todos los recursos vectoriales incrustados, no se agregaron imports ni peticiones a terceros.

## Tabla
| Simulador | Categoría curricular | Intervención central | Revisión |
|---|---|---|---|
| Ondas armónicas transversales y longitudinales | DIRECTO_UNI | v=3 m/s, longitud de onda 4→8 m; observar frecuencia | `nostralab/revisiones/2026-11-08/ondas-armonicas-uni-v1.html` |
| Pulsos transversales y longitudinales no armónicos | DERIVADO_VALIDO | v=1→2 m/s y misma distancia; comparar tiempos | `nostralab/revisiones/2026-11-08/pulsos-no-armonicos-uni-v1.html` |
| Reflexión y transmisión de pulsos | DIRECTO_UNI | extremo fijo→deslizable; observar orientación del reflejo | `nostralab/revisiones/2026-11-08/reflexion-transmision-uni-v1.html` |

## QA automatizada ejecutada
- **Ondas armónicas transversales y longitudinales**: JavaScript científico idéntico, activos embebidos idénticos, balance de etiquetas preservado, contrato UNI válido, seis marcadores únicos, secuencia de reto y fundamento plegable. Cambios: 233993 → 242302 caracteres.
- **Pulsos transversales y longitudinales no armónicos**: JavaScript científico idéntico, activos embebidos idénticos, balance de etiquetas preservado, contrato UNI válido, seis marcadores únicos, secuencia de reto y fundamento plegable. Cambios: 229867 → 238453 caracteres.
- **Reflexión y transmisión de pulsos**: JavaScript científico idéntico, activos embebidos idénticos, balance de etiquetas preservado, contrato UNI válido, seis marcadores únicos, secuencia de reto y fundamento plegable. Cambios: 209654 → 218604 caracteres.

## Verificaciones pendientes antes de aprobar o publicar
- Abrir **cada archivo HTML descargado localmente** en Chrome (PC y móvil): estado inicial detenido, controles, partículas, cuadros, Pause/Reanudar/Reiniciar, gráficos correctos y sin errores JS.
- Contrastar parámetros físicos indicados en retos con los rangos reales de controles y resultados; inspección académica por docente UNI.
- Revisar no superposición en 360 px / tablet y escritorio; comprobar que los paneles plegables no desplacen ni oculten el simulador al iniciar.
- Generar SHA-256 del archivo final aprobado, conservar histórico en SharePoint mediante aprobación explícita; publicar SOLO con autorización inequívoca de esa versión exacta.
- Definir estrategia final de slugs/versiones para mantener el total de visitas Firebase y compatibilidad con enlaces antiguos. No se cambió el catálogo.
