#!/usr/bin/env python3
"""Conecta y corrige la etapa 2 de Culqi en panel y preinscripción."""
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


def replace_once(path: Path, old: str, new: str) -> bool:
    text = path.read_text(encoding="utf-8")
    if new in text:
        return False
    if old not in text:
        raise RuntimeError(f"No se encontró el bloque para corregir en {path.name}")
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
        '  <script src="assets/js/preinscripcion-culqi-preparacion.js?v=2026-02" defer></script>\n'
        '  <script src="assets/js/preinscripcion-firebase.js?v=2026-05" defer></script>'
    )
    current_pre = pre.read_text(encoding="utf-8")
    if 'preinscripcion-culqi-preparacion.js?v=2026-01' in current_pre:
        current_pre = current_pre.replace(
            'preinscripcion-culqi-preparacion.js?v=2026-01',
            'preinscripcion-culqi-preparacion.js?v=2026-02',
            1,
        )
    if 'preinscripcion-firebase.js?v=2026-04' in current_pre:
        current_pre = current_pre.replace(
            'preinscripcion-firebase.js?v=2026-04',
            'preinscripcion-firebase.js?v=2026-05',
            1,
        )
    if current_pre != pre.read_text(encoding="utf-8"):
        pre.write_text(current_pre, encoding="utf-8")
        changed.append(pre.name)
    elif update(pre, pre_old, pre_new):
        changed.append(pre.name)

    script = ROOT / "assets/js/preinscripcion-culqi-preparacion.js"
    ensure_ui_old = """  function ensureUi(form){
    addStyles();
    var plan = form.elements.plan;"""
    ensure_ui_new = """  function ensureUi(form){
    addStyles();
    var legacySummary = document.getElementById('selected-plan-summary');
    if(legacySummary) legacySummary.remove();
    var plan = form.elements.plan;"""
    if replace_once(script, ensure_ui_old, ensure_ui_new):
        changed.append(str(script.relative_to(ROOT)))

    observer_old = """    attach();
    var observer = new MutationObserver(function(){ window.setTimeout(attach,0); });
    observer.observe(form,{childList:true,subtree:true});
    window.setTimeout(function(){ observer.disconnect(); },15000);"""
    observer_new = """    attach();
    var attempts = 0;
    var timer = window.setInterval(function(){
      attempts += 1;
      attach();
      if(form.elements.plan || attempts >= 20) window.clearInterval(timer);
    },100);"""
    if replace_once(script, observer_old, observer_new):
        changed.append(str(script.relative_to(ROOT)))

    legacy = ROOT / "assets/js/preinscripcion-firebase.js"
    programs_old = """    {id:'nostra-talentum-uni',name:'Nostra Talentum UNI'},
    {id:'ciclo-ien',name:'Ciclo IEN'},
    {id:'paralelo-cepre-uni',name:'Paralelo CEPRE UNI'},
    {id:'ciclo-verano-uni',name:'Ciclo Verano UNI'},
    {id:'nostra-modulos',name:'NostraMÓDULOS'},
    {id:'proyecto-escolar',name:'Proyecto Escolar'}"""
    programs_new = """    {id:'nostra-talentum-uni',name:'Nostra Talentum UNI'},
    {id:'ciclo-ien',name:'IEN UNI'},
    {id:'proyecto-escolar',name:'Proyecto Escolar'},
    {id:'paralelo-cepre-uni',name:'Paralelo CEPRE UNI'},
    {id:'ciclo-verano-uni',name:'Ciclo Verano UNI'}"""
    if replace_once(legacy, programs_old, programs_new):
        changed.append(str(legacy.relative_to(ROOT)))

    print("Archivos actualizados:")
    for item in dict.fromkeys(changed):
        print(f"- {item}")
    if not changed:
        print("No se requirieron cambios.")


if __name__ == "__main__":
    main()
