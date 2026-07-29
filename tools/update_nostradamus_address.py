#!/usr/bin/env python3
"""Actualiza la dirección institucional del Grupo Nostradamus en toda la web."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NEW_ADDRESS = "Av. Gerardo Unger 239"
SELF = Path("tools/update_nostradamus_address.py")
WORKFLOW = Path(".github/workflows/update-nostradamus-address.yml")
ORTHOGRAPHY = Path("assets/js/nostra-ortografia-global.js")
TEXT_SUFFIXES = {
    ".html", ".htm", ".js", ".json", ".xml", ".md", ".txt", ".css",
    ".yml", ".yaml", ".gs", ".py"
}

OLD_ADDRESS_RE = re.compile(
    r"(?i)(?:(?:av(?:enida)?\.?)[\s\u00a0]*)?gerardo[\s\u00a0]+unger"
    r"[\s\u00a0]*(?:n(?:ro|ro\.|°|º|\.?)[\s\u00a0]*)?193\b"
)
CURRENT_ADDRESS_RE = re.compile(
    r"(?i)(?:(?:av(?:enida)?\.?)[\s\u00a0]*)?gerardo[\s\u00a0]+unger"
    r"[\s\u00a0]*(?:n(?:ro|ro\.|°|º|\.?)[\s\u00a0]*)?239\b"
)
ENCODED_OLD_RE = re.compile(
    r"(?i)(?:(?:av(?:%2e|\.)?|avenida)(?:%20|\+))?gerardo(?:%20|\+)unger(?:%20|\+)193\b"
)
ENCODED_CURRENT_RE = re.compile(
    r"(?i)(?:(?:av(?:%2e|\.)?|avenida)(?:%20|\+))?gerardo(?:%20|\+)unger(?:%20|\+)239\b"
)


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return [Path(p.decode("utf-8")) for p in result.stdout.split(b"\0") if p]


def update_orthography_fallbacks() -> bool:
    path = ROOT / ORTHOGRAPHY
    text = path.read_text(encoding="utf-8")
    original = text

    old_multiline = "['Gerardo Unger\\n                                    193', 'Gerardo Unger 239'],"
    new_multiline = "['Gerardo Unger\\n                                    193', 'Av. Gerardo Unger 239'],"
    text = text.replace(old_multiline, new_multiline)

    marker = "['Av.Gerardo Unger', 'Av. Gerardo Unger'],"
    exact_fallbacks = (
        "['Av. Gerardo Unger 193', 'Av. Gerardo Unger 239'],\n"
        "    ['Gerardo Unger 193', 'Av. Gerardo Unger 239'],"
    )
    if "['Av. Gerardo Unger 193', 'Av. Gerardo Unger 239']" not in text:
        text = text.replace(marker, marker + "\n    " + exact_fallbacks)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def normalize_text(text: str) -> str:
    text = OLD_ADDRESS_RE.sub(NEW_ADDRESS, text)
    text = CURRENT_ADDRESS_RE.sub(NEW_ADDRESS, text)
    text = ENCODED_OLD_RE.sub("Av.%20Gerardo%20Unger%20239", text)
    text = ENCODED_CURRENT_RE.sub("Av.%20Gerardo%20Unger%20239", text)
    return text


def bump_cache_versions() -> list[str]:
    changed: list[str] = []
    targets = {
        Path("assets/js/nostra-sitewide-loader.js"): "2026-92-address-239",
        Path("assets/js/nostra-footer-universal.js"): "2026-92-address-239",
    }
    for relative, version in targets.items():
        path = ROOT / relative
        text = path.read_text(encoding="utf-8")
        updated, count = re.subn(
            r"var VERSION = '[^']+';",
            f"var VERSION = '{version}';",
            text,
            count=1,
        )
        if count and updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(relative.as_posix())
    return changed


def main() -> None:
    changed: list[str] = []

    if update_orthography_fallbacks():
        changed.append(ORTHOGRAPHY.as_posix())

    for relative in tracked_files():
        if relative in {SELF, WORKFLOW, ORTHOGRAPHY}:
            continue
        if relative.suffix.lower() not in TEXT_SUFFIXES:
            continue

        path = ROOT / relative
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue

        updated = normalize_text(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(relative.as_posix())

    changed.extend(bump_cache_versions())
    changed = sorted(set(changed))

    remaining: list[str] = []
    for relative in tracked_files():
        if relative in {SELF, WORKFLOW, ORTHOGRAPHY}:
            continue
        if relative.suffix.lower() not in TEXT_SUFFIXES:
            continue
        path = ROOT / relative
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if OLD_ADDRESS_RE.search(text) or ENCODED_OLD_RE.search(text):
            remaining.append(relative.as_posix())

    if remaining:
        raise SystemExit("Quedaron direcciones antiguas en: " + ", ".join(remaining))

    print(f"Dirección institucional normalizada a: {NEW_ADDRESS}")
    print(f"Archivos modificados: {len(changed)}")
    for item in changed:
        print(f"- {item}")


if __name__ == "__main__":
    main()
