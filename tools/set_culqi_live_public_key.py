#!/usr/bin/env python3
"""Actualiza de forma segura la llave pública Culqi usada por el checkout.

Uso:
  CULQI_PUBLIC_KEY='pk_live_...' python tools/set_culqi_live_public_key.py

La llave privada sk_live_ nunca debe entrar a este repositorio.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

CONFIG = Path(__file__).resolve().parents[1] / "assets/js/culqi-public-config.js"
PATTERN = re.compile(
    r"window\.NOSTRA_CULQI_PUBLIC_KEY\s*=\s*['\"]([^'\"]+)['\"]\s*;"
)


def masked(value: str) -> str:
    if len(value) <= 12:
        return value[:6] + "…"
    return f"{value[:8]}…{value[-4:]}"


def main() -> None:
    key = os.environ.get("CULQI_PUBLIC_KEY", "").strip()
    if not key:
        raise SystemExit("Falta CULQI_PUBLIC_KEY en el entorno.")
    if key.startswith("sk_"):
        raise SystemExit("ERROR: se recibió una llave privada. Nunca la guardes en GitHub.")
    if not re.fullmatch(r"pk_live_[A-Za-z0-9]+", key):
        raise SystemExit("ERROR: la llave debe tener formato pk_live_... de Culqi producción.")

    original = CONFIG.read_text(encoding="utf-8")
    matches = PATTERN.findall(original)
    if len(matches) != 1:
        raise SystemExit(
            f"ERROR: se esperaba exactamente una llave pública configurada; encontradas: {len(matches)}"
        )

    updated = PATTERN.sub(
        f"window.NOSTRA_CULQI_PUBLIC_KEY = '{key}';",
        original,
        count=1,
    )
    CONFIG.write_text(updated, encoding="utf-8")
    print(f"Llave pública Culqi preparada: {masked(key)}")
    print(f"Archivo actualizado: {CONFIG.relative_to(CONFIG.parents[1])}")


if __name__ == "__main__":
    main()
