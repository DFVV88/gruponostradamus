#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'admin-preinscripciones.html'
JS = ROOT / 'assets/js/admin-preinscripciones.js'
PLAN = ROOT / 'assets/js/admin-plan-display.js'

html = HTML.read_text(encoding='utf-8')
js = JS.read_text(encoding='utf-8')
plan = PLAN.read_text(encoding='utf-8')

# 1) Reordenar y etiquetar la tabla principal sin tocar su lógica.
old_table = '<div class="table-wrap"><table><thead><tr><th>Alumno</th><th>Registro</th><th>Ciclo</th><th>Contacto</th><th>Pago</th><th>Estado</th><th>Asesor</th><th>Acciones</th></tr></thead><tbody id="rows"><tr><td colspan="8">Cargando...</td></tr></tbody></table></div>'
new_table = '<div class="table-wrap preinscripciones-table-wrap"><table class="preinscripciones-table"><thead><tr><th>Alumno</th><th>Ciclo / plan</th><th>Contacto</th><th>Registro</th><th>Pago</th><th>Estado</th><th>Asesor</th><th>Acciones</th></tr></thead><tbody id="rows"><tr><td colspan="8">Cargando...</td></tr></tbody></table></div>'
if old_table in html:
    html = html.replace(old_table, new_table, 1)
elif 'class="preinscripciones-table"' not in html:
    raise SystemExit('No se encontró la tabla principal esperada')

# 2) Añadir estilos específicos, compactos y responsivos para la tabla de preinscripciones.
layout_css = r'''
/* ===== Preinscripciones: distribución administrativa compacta 2026-08-30 ===== */
#admin-panel > .panel{padding:18px}
.preinscripciones-table-wrap{border-radius:18px;max-height:72vh;overflow:auto;overscroll-behavior:contain}
.preinscripciones-table{min-width:1120px;table-layout:fixed}
.preinscripciones-table th,.preinscripciones-table td{padding:12px 10px}
.preinscripciones-table thead th{position:sticky;top:0;z-index:4;background:#f2fafc;box-shadow:0 1px 0 #d7e7eb;font-size:11px;letter-spacing:.045em;vertical-align:middle}
.preinscripciones-table th:nth-child(1){width:18%}
.preinscripciones-table th:nth-child(2){width:15%}
.preinscripciones-table th:nth-child(3){width:16%}
.preinscripciones-table th:nth-child(4){width:13%}
.preinscripciones-table th:nth-child(5){width:15%}
.preinscripciones-table th:nth-child(6){width:8%}
.preinscripciones-table th:nth-child(7){width:6%}
.preinscripciones-table th:nth-child(8){width:9%}
.preinscripciones-table tbody tr{transition:background .16s ease,box-shadow .16s ease}
.preinscripciones-table tbody tr:hover{background:#f8fdff;box-shadow:inset 3px 0 0 var(--teal)}
.preinscripciones-table tbody td{vertical-align:middle;font-size:14px;line-height:1.22}
.preinscripciones-table tbody td b.row-name{display:block;color:var(--navy);font-size:14px;line-height:1.18;margin-bottom:4px}
.preinscripciones-table tbody small{display:block;color:#526170;font-size:11px;line-height:1.28;margin-top:3px;overflow-wrap:anywhere}
.preinscripciones-table .cell-cycle-title{display:block;color:var(--navy);font-weight:700;line-height:1.18}
.preinscripciones-table .cell-contact-main{display:block;color:var(--navy);font-weight:600;font-variant-numeric:tabular-nums}
.preinscripciones-table .cell-date{display:block;color:var(--navy);font-weight:800;font-size:12px;line-height:1.3}
.preinscripciones-table .cell-payment-method{display:block;color:var(--navy);font-weight:650;line-height:1.18;margin-bottom:5px}
.preinscripciones-table .badge{padding:5px 9px;font-size:11px;white-space:normal;line-height:1.15}
.preinscripciones-table .col-asesor{font-size:12px;color:#526170;text-align:center}
.preinscripciones-table .col-actions{padding-left:6px;padding-right:6px}
.preinscripciones-table .row-actions{display:flex;flex-direction:column;align-items:stretch;gap:5px}
.preinscripciones-table .row-actions .mini{width:100%;margin:0;padding:7px 8px;line-height:1.1;background:#fff}
.preinscripciones-table .row-actions .mini:hover{border-color:#078c95;background:#f1fbfc}
.preinscripciones-table .nostra-admin-plan{margin-top:5px!important;color:#075b65!important;font-weight:900!important;font-size:11px!important}
.preinscripciones-table .nostra-admin-price{margin-top:5px!important;color:#526170!important;font-weight:750!important;font-size:11px!important}
.preinscripciones-table .nostra-admin-initial-total{margin-top:3px!important;color:#075b65!important;font-weight:950!important;font-size:11px!important}
@media(min-width:1250px){
  .wrap{width:min(1420px,96%)}
  .preinscripciones-table{min-width:1180px}
  .preinscripciones-table .row-actions{flex-direction:row;flex-wrap:wrap}
  .preinscripciones-table .row-actions .mini{width:auto;flex:1 1 78px}
}
@media(max-width:900px){
  #admin-panel > .panel{padding:14px}
  .preinscripciones-table-wrap{max-height:none;border-radius:14px}
  .preinscripciones-table{min-width:1040px}
}
'''
if 'Preinscripciones: distribución administrativa compacta 2026-08-30' not in html:
    marker = '\n  </style>'
    if marker not in html:
        raise SystemExit('No se encontró cierre de style')
    html = html.replace(marker, '\n' + layout_css + marker, 1)

# 3) Render de filas: agrupar ciclo+plan, pago+montos y acciones, manteniendo data-open/data-pay.
old_render = '''  els.rows.innerHTML = data.map(r => `\n    <tr>\n      <td><b>${esc(r.nombre)}</b><br><small>DNI: ${esc(r.dni)}</small></td>\n      <td><b>${esc(formatDateTime(r.createdAt))}</b><br><small>${r.updatedAt ? 'Act.: ' + esc(formatDateTime(r.updatedAt)) : '-'}</small></td>\n      <td>${esc(r.ciclo)}<br><small>${esc(r.turno) || '-'}</small></td>\n      <td>${esc(r.celular)}<br><small>${esc(r.correo)}</small></td>\n      <td>${esc(r.metodoPagoLabel)}<br>${paymentBadge(r.estadoPago)}</td>\n      <td>${estadoBadge(r.estado)}</td>\n      <td>${esc(r.asesorAsignado) || '-'}</td>\n      <td><button class="mini" data-open="${r.id}">Ver ficha</button>${paymentAction(r)}</td>\n    </tr>`).join('');'''
new_render = '''  els.rows.innerHTML = data.map(r => `\n    <tr class="pre-row">\n      <td class="col-alumno"><b class="row-name">${esc(r.nombre)}</b><small>DNI: ${esc(r.dni)}</small></td>\n      <td class="col-ciclo"><span class="cell-cycle-title">${esc(r.ciclo)}</span><small>${esc(r.turno) || '-'}</small></td>\n      <td class="col-contacto"><span class="cell-contact-main">${esc(r.celular)}</span><small>${esc(r.correo)}</small></td>\n      <td class="col-registro"><span class="cell-date">${esc(formatDateTime(r.createdAt))}</span><small>${r.updatedAt ? 'Act.: ' + esc(formatDateTime(r.updatedAt)) : '-'}</small></td>\n      <td class="col-pago"><span class="cell-payment-method">${esc(r.metodoPagoLabel)}</span>${paymentBadge(r.estadoPago)}</td>\n      <td class="col-estado">${estadoBadge(r.estado)}</td>\n      <td class="col-asesor">${esc(r.asesorAsignado) || '-'}</td>\n      <td class="col-actions"><div class="row-actions"><button class="mini" data-open="${r.id}">Ver ficha</button>${paymentAction(r)}</div></td>\n    </tr>`).join('');'''
if old_render in js:
    js = js.replace(old_render, new_render, 1)
elif 'class="pre-row"' not in js:
    raise SystemExit('No se encontró renderTable esperado')

# 4) El complemento de plan/precio deja de depender de índices y usa las columnas semánticas.
old_cells = '''    const cells = row.querySelectorAll('td');\n    if(cells.length < 4) return;\n\n    const plan = planName(record);\n    syncLine(\n      cells[1],'''
new_cells = '''    const cells = row.querySelectorAll('td');\n    if(cells.length < 5) return;\n    const cycleCell = row.querySelector('.col-ciclo') || cells[1];\n    const paymentCell = row.querySelector('.col-pago') || cells[4];\n\n    const plan = planName(record);\n    syncLine(\n      cycleCell,'''
if old_cells in plan:
    plan = plan.replace(old_cells, new_cells, 1)
elif "const cycleCell = row.querySelector('.col-ciclo')" not in plan:
    raise SystemExit('No se encontró bloque de celdas en admin-plan-display.js')

plan = plan.replace("      cells[3],\n      'nostra-admin-price',", "      paymentCell,\n      'nostra-admin-price',", 1)
plan = plan.replace("      cells[3],\n      'nostra-admin-initial-total',", "      paymentCell,\n      'nostra-admin-initial-total',", 1)

# 5) Cache-busting para que el rediseño sea visible inmediatamente.
html = html.replace('assets/js/admin-preinscripciones.js?v=2026-08-30-delete-online-2', 'assets/js/admin-preinscripciones.js?v=2026-08-30-layout-1')
html = html.replace('assets/js/admin-plan-display.js?v=2026-08-21-culqi-finance-1', 'assets/js/admin-plan-display.js?v=2026-08-30-layout-1')

HTML.write_text(html, encoding='utf-8')
JS.write_text(js, encoding='utf-8')
PLAN.write_text(plan, encoding='utf-8')
print('OK: panel de preinscripciones redistribuido y compactado')
