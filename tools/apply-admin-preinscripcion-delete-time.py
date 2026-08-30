#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'assets/js/admin-preinscripciones.js'
HTML = ROOT / 'admin-preinscripciones.html'


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'No se encontró {label}')
    return text.replace(old, new, 1)


def patch_js():
    text = JS.read_text(encoding='utf-8')

    text = replace_once(
        text,
        "import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';",
        "import { getFirestore, collection, query, orderBy, limit, where, getDocs, getDoc, doc, updateDoc, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';",
        'import de Firestore'
    )

    text = replace_once(
        text,
        "let accountActionBusy = false;",
        "let accountActionBusy = false;\nlet deleteBusy = false;",
        'estado deleteBusy'
    )

    text = replace_once(
        text,
        "  saveBtn: $('save-btn'), approveBtn: $('approve-btn'), rejectBtn: $('reject-btn'), modalMsg: $('modal-message')",
        "  saveBtn: $('save-btn'), approveBtn: $('approve-btn'), rejectBtn: $('reject-btn'), deleteBtn: $('delete-btn'), modalMsg: $('modal-message')",
        'referencia delete-btn'
    )

    helper_old = """function clean(value){ return String(value || '').trim(); }
function esc(value){"""
    helper_new = """function clean(value){ return String(value || '').trim(); }
function dniDigits(value){ return clean(value).replace(/\\D/g,'').slice(0,12); }
async function sha256(value){
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2,'0')).join('');
}
function timestampDate(value){
  if(!value) return null;
  if(typeof value.toDate === 'function') return value.toDate();
  if(Number.isFinite(Number(value.seconds))) return new Date(Number(value.seconds) * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDateTime(value){
  const date = timestampDate(value);
  if(!date) return '-';
  return new Intl.DateTimeFormat('es-PE',{
    timeZone:'America/Lima', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:true
  }).format(date);
}
function esc(value){"""
    text = replace_once(text, helper_old, helper_new, 'helpers de fecha y DNI')

    text = text.replace('colspan="7"', 'colspan="8"')

    render_old = """  if(!data.length){ els.rows.innerHTML = '<tr><td colspan=\"8\">No hay resultados.</td></tr>'; return; }
  els.rows.innerHTML = data.map(r => `
    <tr>
      <td><b>${esc(r.nombre)}</b><br><small>DNI: ${esc(r.dni)}</small></td>
      <td>${esc(r.ciclo)}<br><small>${esc(r.turno) || '-'}</small></td>"""
    render_new = """  if(!data.length){ els.rows.innerHTML = '<tr><td colspan=\"8\">No hay resultados.</td></tr>'; return; }
  els.rows.innerHTML = data.map(r => `
    <tr>
      <td><b>${esc(r.nombre)}</b><br><small>DNI: ${esc(r.dni)}</small></td>
      <td><b>${esc(formatDateTime(r.createdAt))}</b><br><small>${r.updatedAt ? 'Act.: ' + esc(formatDateTime(r.updatedAt)) : '-'}</small></td>
      <td>${esc(r.ciclo)}<br><small>${esc(r.turno) || '-'}</small></td>"""
    text = replace_once(text, render_old, render_new, 'columna de fecha')

    marker = "function detail(label, value){ return `<div class=\"detail\"><b>${esc(label)}</b><span>${esc(value) || '-'}</span></div>`; }\n\nfunction openModal"
    block = r'''function detail(label, value){ return `<div class="detail"><b>${esc(label)}</b><span>${esc(value) || '-'}</span></div>`; }

function canDeletePreinscripcion(record){
  if(!record) return false;
  const voucher = record.metodoPagoPreferido === 'voucher_whatsapp' || record.metodoPagoLabel === 'Voucher por WhatsApp';
  const paid = record.pagoValidado === true || record.estadoPago === 'pago_validado';
  const matriculated = record.matriculaAprobada === true || record.estado === 'matriculado';
  const hasFinance = record.ingresoFinancieroGenerado === true || Boolean(clean(record.ingresoFinancieroId)) || Boolean(clean(record.numeroOperacionPago));
  const hasCulqi = Boolean(clean(record.culqiChargeId)) || Boolean(clean(record.intentoPagoActivoId));
  return voucher && !paid && !matriculated && !hasFinance && !hasCulqi;
}

function survivorScore(record){
  let score = 0;
  if(record?.matriculaAprobada === true || record?.estado === 'matriculado') score += 1000;
  if(record?.pagoValidado === true || record?.estadoPago === 'pago_validado') score += 500;
  if(record?.origen === 'registro_manual_admin') score += 100;
  const date = timestampDate(record?.createdAt);
  if(date) score += Math.floor(date.getTime() / 1000000000);
  return score;
}

async function deleteCurrent(){
  if(deleteBusy || !currentId) return;
  const record = records.find(item => item.id === currentId);
  if(!canDeletePreinscripcion(record)){
    message(els.modalMsg,'err','Esta inscripción no puede eliminarse: tiene pago validado, matrícula aprobada, vínculo financiero/Culqi o no corresponde a un voucher pendiente.');
    return;
  }
  const expectedDni = dniDigits(record.dni);
  const typed = window.prompt(`Para eliminar esta inscripción escribe el DNI del alumno: ${expectedDni}`);
  if(typed === null) return;
  if(dniDigits(typed) !== expectedDni){
    message(els.modalMsg,'err','El DNI escrito no coincide. No se eliminó nada.');
    return;
  }
  if(!window.confirm(`Se eliminará definitivamente la inscripción pendiente de ${record.nombre || 'este alumno'}. ¿Deseas continuar?`)) return;

  deleteBusy = true;
  els.deleteBtn.disabled = true;
  message(els.modalMsg,'info','Verificando vínculos y eliminando la inscripción de forma segura...');
  try{
    const hash = await sha256(expectedDni);
    const registryRef = doc(db,'alumnos_registro_dni',hash);
    const registrySnap = await getDoc(registryRef);
    const duplicatesSnap = await getDocs(query(collection(db,'preinscripciones'), where('dni','==',expectedDni), limit(25)));
    const survivors = duplicatesSnap.docs
      .filter(item => item.id !== currentId)
      .map(item => ({id:item.id,...item.data()}))
      .sort((a,b) => survivorScore(b) - survivorScore(a));

    const batch = writeBatch(db);
    batch.delete(doc(db,'preinscripciones',currentId));

    if(registrySnap.exists() && clean(registrySnap.data().registroId) === currentId){
      if(survivors.length){
        const survivor = survivors[0];
        batch.update(registryRef,{
          registroId:survivor.id,
          tipo:survivor.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
          activo:true,
          updatedAt:serverTimestamp()
        });
      }else{
        batch.delete(registryRef);
      }
    }else if(!registrySnap.exists() && survivors.length){
      const survivor = survivors[0];
      batch.set(registryRef,{
        dniHash:hash,
        registroId:survivor.id,
        tipo:survivor.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
        activo:true,
        creadoPor:ADMIN_EMAIL,
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    }

    await batch.commit();
    closeModal();
    await loadRecords();
    window.alert('Inscripción eliminada correctamente. El índice de DNI quedó sincronizado.');
  }catch(err){
    console.error(err);
    message(els.modalMsg,'err','No se pudo eliminar la inscripción. No se realizó una eliminación parcial. Revisa permisos o vínculos del registro.');
  }finally{
    deleteBusy = false;
    if(els.deleteBtn) els.deleteBtn.disabled = false;
  }
}

function openModal'''
    text = replace_once(text, marker, block, 'bloque de eliminación segura')

    detail_old = """    detail('Alumno', r.nombre), detail('DNI', r.dni), detail('Celular', r.celular), detail('Correo personal', r.correo),
    detail('Ciclo', r.ciclo), detail('Turno', r.turno), detail('Método de pago', r.metodoPagoLabel), detail('Estado de pago actual', r.estadoPago),
    detail('Comentario', r.comentario)"""
    detail_new = """    detail('Alumno', r.nombre), detail('DNI', r.dni), detail('Celular', r.celular), detail('Correo personal', r.correo),
    detail('Registrado', formatDateTime(r.createdAt)), detail('Última actualización', formatDateTime(r.updatedAt)),
    detail('Ciclo', r.ciclo), detail('Turno', r.turno), detail('Método de pago', r.metodoPagoLabel), detail('Estado de pago actual', r.estadoPago),
    detail('Comentario', r.comentario)"""
    text = replace_once(text, detail_old, detail_new, 'fechas en modal')

    text = replace_once(
        text,
        "  els.rejectBtn.textContent = mode === 'pago' ? 'Observar pago' : 'Rechazar';",
        "  els.rejectBtn.textContent = mode === 'pago' ? 'Observar pago' : 'Rechazar';\n  if(els.deleteBtn) els.deleteBtn.style.display = mode === 'ficha' && canDeletePreinscripcion(r) ? '' : 'none';",
        'visibilidad de eliminar'
    )

    text = replace_once(
        text,
        "function closeModal(){ els.modalBack.classList.remove('show'); currentId = null; currentMode = 'ficha'; els.saveBtn.textContent = 'Guardar cambios'; els.approveBtn.style.display = ''; els.rejectBtn.textContent = 'Rechazar'; }",
        "function closeModal(){ els.modalBack.classList.remove('show'); currentId = null; currentMode = 'ficha'; els.saveBtn.textContent = 'Guardar cambios'; els.approveBtn.style.display = ''; els.rejectBtn.textContent = 'Rechazar'; if(els.deleteBtn) els.deleteBtn.style.display = 'none'; }",
        'reset del botón eliminar'
    )

    text = replace_once(
        text,
        "els.closeModal.addEventListener('click', closeModal); els.modalBack.addEventListener('click', e => { if(e.target === els.modalBack) closeModal(); }); els.saveBtn.addEventListener('click', saveChanges); els.approveBtn.addEventListener('click', approveMatricula); els.rejectBtn.addEventListener('click', rejectCurrent);",
        "els.closeModal.addEventListener('click', closeModal); els.modalBack.addEventListener('click', e => { if(e.target === els.modalBack) closeModal(); }); els.saveBtn.addEventListener('click', saveChanges); els.approveBtn.addEventListener('click', approveMatricula); els.rejectBtn.addEventListener('click', rejectCurrent); if(els.deleteBtn) els.deleteBtn.addEventListener('click', deleteCurrent);",
        'evento de eliminar'
    )

    JS.write_text(text, encoding='utf-8')


def patch_html():
    text = HTML.read_text(encoding='utf-8')
    text = replace_once(
        text,
        '<th>Alumno</th><th>Ciclo</th><th>Contacto</th><th>Pago</th><th>Estado</th><th>Asesor</th><th>Acciones</th>',
        '<th>Alumno</th><th>Registro</th><th>Ciclo</th><th>Contacto</th><th>Pago</th><th>Estado</th><th>Asesor</th><th>Acciones</th>',
        'cabecera Registro'
    )
    text = text.replace('<tbody id="rows"><tr><td colspan="7">Cargando...</td></tr></tbody>', '<tbody id="rows"><tr><td colspan="8">Cargando...</td></tr></tbody>')
    text = replace_once(
        text,
        '<button class="btn btn-red" id="reject-btn">Rechazar</button>',
        '<button class="btn btn-red" id="reject-btn">Rechazar</button><button class="btn btn-red" id="delete-btn" style="display:none">Eliminar inscripción</button>',
        'botón eliminar inscripción'
    )
    text = text.replace('assets/js/admin-preinscripciones.js?v=2026-02', 'assets/js/admin-preinscripciones.js?v=2026-08-30-delete-time-1')
    HTML.write_text(text, encoding='utf-8')


patch_js()
patch_html()
print('Eliminación segura y fecha/hora aplicadas al panel de preinscripciones.')
