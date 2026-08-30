#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'assets/js/admin-preinscripciones.js'
HTML = ROOT / 'admin-preinscripciones.html'

text = JS.read_text(encoding='utf-8')

old_import = "import { getFirestore, collection, query, orderBy, limit, where, getDocs, getDoc, doc, updateDoc, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';"
new_import = "import { getFirestore, collection, query, orderBy, limit, where, getDocs, getDoc, doc, updateDoc, writeBatch, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';"
if old_import not in text and new_import not in text:
    raise SystemExit('No se encontró el import esperado de Firestore')
text = text.replace(old_import, new_import)

old_can_delete = '''function canDeletePreinscripcion(record){
  if(!record) return false;
  const voucher = record.metodoPagoPreferido === 'voucher_whatsapp' || record.metodoPagoLabel === 'Voucher por WhatsApp';
  const paid = record.pagoValidado === true || record.estadoPago === 'pago_validado';
  const matriculated = record.matriculaAprobada === true || record.estado === 'matriculado';
  const hasFinance = record.ingresoFinancieroGenerado === true || Boolean(clean(record.ingresoFinancieroId)) || Boolean(clean(record.numeroOperacionPago));
  const hasCulqi = Boolean(clean(record.culqiChargeId)) || Boolean(clean(record.intentoPagoActivoId));
  return voucher && !paid && !matriculated && !hasFinance && !hasCulqi;
}'''

new_can_delete = '''function canDeletePreinscripcion(record){
  if(!record) return false;
  const voucher = record.metodoPagoPreferido === 'voucher_whatsapp' || record.metodoPagoLabel === 'Voucher por WhatsApp';
  const online = record.metodoPagoPreferido === 'pago_online' || record.metodoPagoLabel === 'Pago en línea';
  const paid = record.pagoValidado === true || record.estadoPago === 'pago_validado';
  const matriculated = record.matriculaAprobada === true || record.estado === 'matriculado';
  const hasFinance = record.ingresoFinancieroGenerado === true || Boolean(clean(record.ingresoFinancieroId)) || Boolean(clean(record.numeroOperacionPago));
  const hasConfirmedCulqi = Boolean(clean(record.culqiChargeId));
  const processingOnline = record.estadoPago === 'procesando_pago_online';
  const lastActivity = timestampDate(record.updatedAt || record.createdAt);
  const onlineAttemptExpired = online
    && record.estadoPago === 'pendiente_pago_online'
    && lastActivity
    && (Date.now() - lastActivity.getTime()) >= (30 * 60 * 1000);
  const eligibleMethod = voucher || onlineAttemptExpired;
  return Boolean(eligibleMethod) && !paid && !matriculated && !hasFinance && !hasConfirmedCulqi && !processingOnline;
}'''

if old_can_delete in text:
    text = text.replace(old_can_delete, new_can_delete)
elif new_can_delete not in text:
    raise SystemExit('No se encontró canDeletePreinscripcion esperado')

pattern = re.compile(r"async function deleteCurrent\(\)\{.*?\n\}\n\nfunction openModal", re.S)
new_delete = '''async function deleteCurrent(){
  if(deleteBusy || !currentId) return;
  const record = records.find(item => item.id === currentId);
  if(!canDeletePreinscripcion(record)){
    message(els.modalMsg,'err','Esta inscripción no puede eliminarse. Solo se permite para voucher sin pago o pago en línea pendiente sin actividad por al menos 30 minutos, siempre que no exista pago validado, matrícula, cargo Culqi confirmado ni movimiento financiero.');
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
  message(els.modalMsg,'info','Verificando el estado actual y eliminando la inscripción de forma segura...');
  try{
    const hash = await sha256(expectedDni);
    const registryRef = doc(db,'alumnos_registro_dni',hash);
    const preRef = doc(db,'preinscripciones',currentId);
    const duplicatesSnap = await getDocs(query(collection(db,'preinscripciones'), where('dni','==',expectedDni), limit(25)));
    const survivors = duplicatesSnap.docs
      .filter(item => item.id !== currentId)
      .map(item => ({id:item.id,...item.data()}))
      .sort((a,b) => survivorScore(b) - survivorScore(a));

    await runTransaction(db, async transaction => {
      const preSnap = await transaction.get(preRef);
      if(!preSnap.exists()){
        throw Object.assign(new Error('La inscripción ya no existe.'),{code:'preinscripcion-no-existe'});
      }
      const freshRecord = {id:preSnap.id,...preSnap.data()};
      if(dniDigits(freshRecord.dni) !== expectedDni || !canDeletePreinscripcion(freshRecord)){
        throw Object.assign(new Error('El estado de la inscripción cambió y ya no permite eliminación segura.'),{code:'delete-not-allowed'});
      }

      const registrySnap = await transaction.get(registryRef);
      transaction.delete(preRef);

      if(registrySnap.exists() && clean(registrySnap.data().registroId) === currentId){
        if(survivors.length){
          const survivor = survivors[0];
          transaction.update(registryRef,{
            registroId:survivor.id,
            tipo:survivor.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
            activo:true,
            updatedAt:serverTimestamp()
          });
        }else{
          transaction.delete(registryRef);
        }
      }else if(!registrySnap.exists() && survivors.length){
        const survivor = survivors[0];
        transaction.set(registryRef,{
          dniHash:hash,
          registroId:survivor.id,
          tipo:survivor.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
          activo:true,
          creadoPor:ADMIN_EMAIL,
          createdAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
      }
    });

    closeModal();
    await loadRecords();
    window.alert('Inscripción eliminada correctamente. El DNI quedó sincronizado y, si era pago en línea, el intento abandonado ya estaba fuera de la ventana activa de pago.');
  }catch(err){
    console.error(err);
    if(err && err.code === 'delete-not-allowed'){
      message(els.modalMsg,'err','El estado cambió mientras realizabas la eliminación. Puede existir un pago en proceso o un vínculo nuevo, por lo que no se eliminó nada. Actualiza la ficha y revisa nuevamente.');
    }else if(err && err.code === 'preinscripcion-no-existe'){
      message(els.modalMsg,'err','La inscripción ya no existe. Actualiza el panel.');
    }else{
      message(els.modalMsg,'err','No se pudo eliminar la inscripción. No se realizó una eliminación parcial. Revisa permisos o vínculos del registro.');
    }
  }finally{
    deleteBusy = false;
    if(els.deleteBtn) els.deleteBtn.disabled = false;
  }
}

function openModal'''

if not pattern.search(text):
    if 'onlineAttemptExpired' not in text or "code:'delete-not-allowed'" not in text:
        raise SystemExit('No se encontró deleteCurrent esperado')
else:
    text = pattern.sub(new_delete, text, count=1)

JS.write_text(text, encoding='utf-8')

html = HTML.read_text(encoding='utf-8')
html = html.replace('assets/js/admin-preinscripciones.js?v=2026-08-30-delete-time-1', 'assets/js/admin-preinscripciones.js?v=2026-08-30-delete-online-2')
if 'assets/js/admin-preinscripciones.js?v=2026-08-30-delete-online-2' not in html:
    raise SystemExit('No se pudo actualizar la versión del JS en admin-preinscripciones.html')
HTML.write_text(html, encoding='utf-8')

print('OK: pago online abandonado habilitado para eliminación segura tras 30 minutos')
