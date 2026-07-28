#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path
import re

version = "2026-93-damus-storage"
patterns = {
    Path("nostrachat.html"): [
        (r'assets/js/nostrachat-firebase-config\.js\?v=[^"\'\s<]+', f'assets/js/nostrachat-firebase-config.js?v={version}'),
        (r'assets/js/nostrachat-v1\.js\?v=[^"\'\s<]+', f'assets/js/nostrachat-v1.js?v={version}'),
    ],
    Path("nostrachat-admin.html"): [
        (r'assets/js/nostrachat-firebase-config\.js\?v=[^"\'\s<]+', f'assets/js/nostrachat-firebase-config.js?v={version}'),
        (r'assets/js/nostrachat-admin\.js\?v=[^"\'\s<]+', f'assets/js/nostrachat-admin.js?v={version}'),
    ],
}

for path, replacements in patterns.items():
    text = path.read_text(encoding="utf-8")
    original = text
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"Actualizado: {path}")
    else:
        print(f"Sin cambios: {path}")
PY
