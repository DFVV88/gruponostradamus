#!/usr/bin/env python3
"""Inserta o actualiza el cargador del footer universal en páginas HTML.

- Recorre archivos HTML públicos del repositorio.
- Excluye expresamente iq100.html.
- Mantiene una sola etiqueta del footer por página.
- Actualiza automáticamente la versión de caché.
- No modifica archivos HTML usados como recursos dentro de assets/.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_NAME = "nostra-footer-universal.js"
SCRIPT_TAG = (
    '  <script defer src="assets/js/nostra-footer-universal.js?v=2026-91" '
    'data-nostra-universal-footer="1"></script>'
)
SKIP_DIRS = {".git", ".github", "assets", "node_modules", "vendor", "tools"}


def is_public_html(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    if path.name.lower() == "iq100.html":
        return False
    return not any(part in SKIP_DIRS for part in relative.parts[:-1])


def remove_footer_lines(text: str) -> str:
    """Retira etiquetas anteriores del cargador universal, incluso duplicadas."""
    lines = [line for line in text.splitlines() if SCRIPT_NAME not in line]
    ending = "\n" if text.endswith("\n") else ""
    return "\n".join(lines) + ending


def remove_tag_from_iq100(path: Path) -> bool:
    """Garantiza que la página excluida no cargue el footer universal."""
    text = path.read_text(encoding="utf-8")
    if SCRIPT_NAME not in text:
        return False

    path.write_text(remove_footer_lines(text), encoding="utf-8")
    return True


def inject(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    existing_lines = [line.strip() for line in original.splitlines() if SCRIPT_NAME in line]

    if len(existing_lines) == 1 and existing_lines[0] == SCRIPT_TAG.strip():
        return False

    text = remove_footer_lines(original)
    lower = text.lower()
    closing_index = lower.rfind("</body>")
    if closing_index < 0:
        print(f"SKIP sin </body>: {path.relative_to(ROOT)}")
        return False

    prefix = text[:closing_index]
    suffix = text[closing_index:]
    separator = "" if prefix.endswith("\n") else "\n"
    updated = prefix + separator + SCRIPT_TAG + "\n" + suffix
    path.write_text(updated, encoding="utf-8")
    return updated != original


def main() -> None:
    changed: list[str] = []

    iq100 = ROOT / "iq100.html"
    if iq100.exists() and remove_tag_from_iq100(iq100):
        changed.append("iq100.html (exclusión restaurada)")

    for path in sorted(ROOT.rglob("*.html")):
        if not is_public_html(path):
            continue
        if inject(path):
            changed.append(str(path.relative_to(ROOT)))

    if changed:
        print("Footer universal incorporado o actualizado en:")
        for item in changed:
            print(f"- {item}")
    else:
        print("No se requirieron cambios: todas las páginas ya están actualizadas.")


if __name__ == "__main__":
    main()
