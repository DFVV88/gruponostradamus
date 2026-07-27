from pathlib import Path

path = Path("preinscripcion.html")
text = path.read_text(encoding="utf-8")
old = '<script src="assets/js/preinscripcion-culqi-preparacion.js?v=2026-04" defer></script>'
new = (
    '<script src="assets/js/preinscripcion-culqi-preparacion.js?v=2026-05" defer></script>\n'
    '  <script src="assets/js/preinscripcion-pago-ux.js?v=2026-01" defer></script>'
)

if old not in text:
    if 'assets/js/preinscripcion-pago-ux.js?v=2026-01' in text:
        print("La mejora de experiencia de pago ya estaba aplicada.")
        raise SystemExit(0)
    raise SystemExit("No se encontró la referencia esperada del checkout para actualizarla.")

path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("Experiencia de pago actualizada en preinscripcion.html")
