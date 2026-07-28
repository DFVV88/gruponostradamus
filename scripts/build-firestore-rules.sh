#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARTS_DIR="$ROOT_DIR/.nostrachat/firestore-rules-parts"
OUTPUT_FILE="$ROOT_DIR/firestore.rules"

if [[ ! -d "$PARTS_DIR" ]]; then
  echo "No existe $PARTS_DIR" >&2
  exit 1
fi

cat "$PARTS_DIR"/part-*.rules > "$OUTPUT_FILE"

echo "Reglas ensambladas en $OUTPUT_FILE"
echo "Líneas: $(wc -l < "$OUTPUT_FILE")"
