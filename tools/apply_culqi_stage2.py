#!/usr/bin/env python3
"""Conecta la etapa 2 de Culqi al panel y a la preinscripción."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def update(path: Path, old: str, new: str) -> bool:
    text = path.read_text(encoding="utf-8")
    if new in text:
        return False
    if old not in text:
        raise RuntimeError(f"No se encontró el punto de inserción en {path.name}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    return True


def main() -> None:
    changed = []

    admin = ROOT / "admin-preinscripciones.html"
    admin_old = '  <script type="module" src="assets/js/admin-tarifario.js?v=2026-03"></script>'
    admin_new = (
        '  <script type="module" src="assets/js/admin-tarifario.js?v=2026-03"></script>\n'
        '  <script type="module" src="assets/js/admin-tarifario-culqi.js?v=2026-01"></script>'
    )
    if update(admin, admin_old, admin_new):
        changed.append(admin.name)

    pre = ROOT / "preinscripcion.html"
    pre_old = '  <script src="assets/js/preinscripcion-firebase.js?v=2026-03" defer></script>'
    pre_new = (
        '  <script src="assets/js/preinscripcion-culqi-preparacion.js?v=2026-01" defer></script>\n'
        '  <script src="assets/js/preinscripcion-firebase.js?v=2026-04" defer></script>'
    )
    if update(pre, pre_old, pre_new):
        changed.append(pre.name)

    print("Páginas actualizadas:")
    for item in changed:
        print(f"- {item}")
    if not changed:
        print("No se requirieron cambios.")


if __name__ == "__main__":
    main()
