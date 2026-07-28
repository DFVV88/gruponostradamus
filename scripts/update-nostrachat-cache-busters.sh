#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path

version = "2026-92-blaze-optimized"
replacements = {
    Path("nostrachat.html"): {
        r'assets/js/nostrachat-firebase-config.js?v=2026-64-nostrachat-info': f'assets/js/nostrachat-firebase-config.js?v={version}',
        r'assets/js/nostrachat-v1.js?v=2026-64-nostrachat-info': f'assets/js/nostrachat-v1.js?v={version}',
    },
    Path("nostrachat-admin.html"): {
        r'assets/js/nostrachat-firebase-config.js?v=2026-43': f'assets/js/nostrachat-firebase-config.js?v={version}',
        r'assets/js/nostrachat-admin.js?v=2026-43': f'assets/js/nostrachat-admin.js?v={version}',
    },
}

for path, mapping in replacements.items():
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in mapping.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"Actualizado: {path}")
    else:
        print(f"Sin cambios: {path}")
PY
