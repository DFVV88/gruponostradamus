#!/usr/bin/env python3
"""Crea la portada OG exclusiva MAT-001 desde arte vectorial y logo oficial ya aprobado.
No modifica el simulador HTML científico ni sus metadatos de integridad.
"""
from __future__ import annotations

import base64
import io
from pathlib import Path
import re

import cairosvg
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "nostralab/experiencias/circunferencia-trigonometrica-v31"
OUTPUT = ROOT / "assets/img/social/circunferencia-trigonometrica-v31_og.jpg"
SVG_SOURCE = LAB / "miniatura.svg"
HTML_SOURCE = LAB / "index.html"


def main() -> None:
    svg = SVG_SOURCE.read_bytes()
    html = HTML_SOURCE.read_text(encoding="utf-8")
    found = re.search(r'<img\\s+class="brand-logo"[^>]+src="data:image/png;base64,([^"]+)"', html)
    if not found:
        raise RuntimeError("No se encontro el logo oficial embebido en el HTML aprobado MAT-001")
    official_logo = Image.open(io.BytesIO(base64.b64decode(found.group(1)))).convert("RGBA")
    artwork = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg, output_width=1200, output_height=675))).convert("RGB")
    canvas = artwork.crop((0, 22, 1200, 652))
    if canvas.size != (1200, 630):
        raise RuntimeError("Dimensiones incorrectas de portada")
    # Tarjeta blanca NostraDAMUS, sin deformación de la imagen institucional.
    tile = (28, 19, 226, 143)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(tile, radius=18, fill=(255, 255, 255), outline=(218, 236, 239), width=2)
    fitted = ImageOps.contain(official_logo, (181, 109), Image.Resampling.LANCZOS)
    x = tile[0] + ((tile[2] - tile[0]) - fitted.width) // 2
    y = tile[1] + ((tile[3] - tile[1]) - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    for quality in (90, 86, 82, 78):
        canvas.save(OUTPUT, format="JPEG", quality=quality, subsampling=0, optimize=True, progressive=True)
        if OUTPUT.stat().st_size <= 300000:
            break
    with Image.open(OUTPUT) as result:
        if result.size != (1200, 630) or result.mode != "RGB":
            raise RuntimeError("La portada no cumple RGB 1200x630")
    if OUTPUT.stat().st_size > 300000:
        raise RuntimeError("La portada JPG excede 300 KB")
    print(f"PORTADA MAT-001: {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes, 1200x630 RGB)")


if __name__ == "__main__":
    main()
