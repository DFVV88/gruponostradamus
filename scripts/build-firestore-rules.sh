#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARTS_DIR="$ROOT_DIR/.nostrachat/firestore-rules-parts"
OUTPUT_FILE="$ROOT_DIR/firestore.rules"
BASE_FILE="$(mktemp)"
INSERT_FILE="$(mktemp)"
trap 'rm -f "$BASE_FILE" "$INSERT_FILE"' EXIT

if [[ ! -d "$PARTS_DIR" ]]; then
  echo "No existe $PARTS_DIR" >&2
  exit 1
fi

cat "$PARTS_DIR"/part-*.rules > "$BASE_FILE"

shopt -s nullglob
INSERT_PARTS=("$PARTS_DIR"/insert-*.rules)
shopt -u nullglob

python3 - "$BASE_FILE" <<'PY'
from pathlib import Path
import sys

base_path = Path(sys.argv[1])
base = base_path.read_text(encoding='utf-8')


def remove_range(text: str, start: str, end: str, label: str) -> str:
    start_pos = text.find(start)
    end_pos = text.find(end, start_pos + len(start)) if start_pos >= 0 else -1
    if start_pos < 0 or end_pos < 0:
        raise SystemExit(f'No se pudo retirar el bloque heredado: {label}')
    return text[:start_pos] + text[end_pos:]


base = remove_range(
    base,
    "    function validFinanceClosureAccount(a) {",
    "    match /finanzas_movimientos/{movimientoId} {",
    "funciones antiguas de cierre financiero",
)

base = remove_range(
    base,
    "    /*\n     * CIERRES DIARIOS Y CONCILIACIÓN\n",
    "    /*\n     * PAGOS DE ALUMNOS INTEGRADOS CON FINANZAS\n",
    "regla antigua de finanzas_cierres",
)

base_path.write_text(base, encoding='utf-8')
PY

if (( ${#INSERT_PARTS[@]} > 0 )); then
  cat "${INSERT_PARTS[@]}" > "$INSERT_FILE"
  python3 - "$BASE_FILE" "$INSERT_FILE" "$OUTPUT_FILE" <<'PY'
from pathlib import Path
import sys

base_path, insert_path, output_path = map(Path, sys.argv[1:])
base = base_path.read_text(encoding='utf-8')
insert = insert_path.read_text(encoding='utf-8').rstrip() + '\n\n'
marker = "    /*\n     * TODO LO DEMÁS QUEDA BLOQUEADO\n"
position = base.find(marker)
if position < 0:
    raise SystemExit('No se encontró el marcador de bloqueo final en part-08.rules')
output = base[:position] + insert + base[position:]
output_path.write_text(output, encoding='utf-8')
PY
else
  cp "$BASE_FILE" "$OUTPUT_FILE"
fi

python3 - "$OUTPUT_FILE" <<'PY'
from pathlib import Path
import sys

output_path = Path(sys.argv[1])
lines = output_path.read_text(encoding='utf-8').splitlines()
result = []
depth = 0
inside_finance_movements = False
finance_match_depth = -1
insertions = 0
guard = "        && isFinanceOperationalDateOpen(request.resource.data.fechaOperacion)"

for line in lines:
    stripped = line.strip()
    if stripped == "match /finanzas_movimientos/{movimientoId} {":
        inside_finance_movements = True
        finance_match_depth = depth

    result.append(line)

    if inside_finance_movements and stripped == "allow create: if isAdmin()":
        result.append(guard)
        insertions += 1

    depth += line.count('{') - line.count('}')
    if inside_finance_movements and depth <= finance_match_depth:
        inside_finance_movements = False
        finance_match_depth = -1

if insertions < 3:
    raise SystemExit(
        f'Se esperaban al menos 3 reglas de creación financiera protegidas; se encontraron {insertions}'
    )

output_path.write_text('\n'.join(result) + '\n', encoding='utf-8')
print(f'Bloqueo de fecha aplicado a {insertions} reglas de creación financiera')
PY

echo "Reglas ensambladas en $OUTPUT_FILE"
echo "Complementos: ${#INSERT_PARTS[@]}"
echo "Líneas: $(wc -l < "$OUTPUT_FILE")"
