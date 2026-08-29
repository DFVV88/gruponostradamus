# NostraPLAY Base v1.0

Subpágina experimental de Grupo Nostradamus para `https://gruponostradamus.edu.pe/nostraplay/`.

## Estado

- No está enlazada desde `index.html`.
- La landing usa los 8 cursos oficiales.
- El banco inicia vacío.
- La estructura está preparada para que NostraPLAY Builder agregue unidades por rama y Pull Request.
- Durante esta etapa se mantiene `noindex,nofollow`.

## Cursos oficiales

1. Aritmética
2. Álgebra
3. Geometría
4. Trigonometría
5. Física
6. Química
7. Razonamiento Matemático
8. Razonamiento Verbal

## Unidad estándar

Ruta:

`content/<curso>/<tema>/<subtema>/`

Archivos mínimos:

- `index.html`: copia del template web.
- `nostraplay.ts`: fuente canónica de la unidad.
- `nostraplay.js`: runtime generado automáticamente.

### Banco inicial recomendado

- 10 preguntas básicas
- 10 preguntas intermedias
- 10 preguntas avanzadas

Total inicial: 30 preguntas por tema/subtema.

## Repositorio primero

NostraPLAY Builder debe:

1. leer el repositorio;
2. buscar si la unidad ya existe;
3. reutilizar componentes existentes;
4. crear o ampliar sin duplicar;
5. validar;
6. generar `nostraplay.js`;
7. actualizar `content/registry.js`;
8. trabajar en una rama independiente;
9. crear Pull Request.

## Matemática

`core/nostra-math.js` renderiza LaTeX con KaTeX. No se admite LaTeX crudo visible en una unidad aprobada.

## Gráficos

`core/nostra-graph.js` contiene el contrato inicial de NostraGRAPH. Los gráficos deben definirse mediante datos y mantener un estilo académico vectorial profesional.

## Validación local

```bash
node nostraplay/tools/validate-unit.mjs nostraplay/content/fisica/vectores/suma-de-vectores/nostraplay.ts
node nostraplay/tools/build-unit.mjs nostraplay/content/fisica/vectores/suma-de-vectores/nostraplay.ts
```

## Regla de seguridad

No modificar `main` directamente desde NostraPLAY Builder. Crear rama, validar y abrir PR.
