#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARTS_DIR="$ROOT_DIR/.nostrachat/firestore-rules-parts"
OUTPUT_FILE="$ROOT_DIR/firestore.rules"
INSERT_FILE="$PARTS_DIR/insert-cuotas-alumnos.rules"
BASE_FILE="$(mktemp)"
trap 'rm -f "$BASE_FILE"' EXIT

if [[ ! -d "$PARTS_DIR" ]]; then
  echo "No existe $PARTS_DIR" >&2
  exit 1
fi

cat "$PARTS_DIR"/part-*.rules > "$BASE_FILE"

if [[ -f "$INSERT_FILE" ]]; then
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

echo "Reglas ensambladas en $OUTPUT_FILE"
echo "Líneas: $(wc -l < "$OUTPUT_FILE")"
