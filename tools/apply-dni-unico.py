#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path, old, new, label):
    text = path.read_text(encoding='utf-8')
    if new in text:
        return False
    if old not in text:
        raise SystemExit(f'No se encontro {label} en {path}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')
    return True


def patch_preinscripcion_firebase():
    path = ROOT / 'assets/js/preinscripcion-firebase.js'
    text = path.read_text(encoding='utf-8')

    helper_old = """  function clean(value){ return String(value == null ? '' : value).trim(); }
  function esc(value){"""
    helper_new = """  function clean(value){ return String(value == null ? '' : value).trim(); }
  function dniDigits(value){ return clean(value).replace(/\\D/g,'').slice(0,12); }
  function sha256(value){
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)).then(function(buffer){
      return Array.from(new Uint8Array(buffer)).map(function(byte){ return byte.toString(16).padStart(2,'0'); }).join('');
    });
  }
  function esc(value){"""
    if 'function dniDigits(value)' not in text:
        if helper_old not in text:
            raise SystemExit('No se encontro punto de helpers en preinscripcion-firebase.js')
        text = text.replace(helper_old, helper_new, 1)

    text = text.replace("      dni:value('dni'),", "      dni:dniDigits(value('dni')),", 1)

    save_old = """    initFirebase().then(function(ctx){
      data.createdAt = ctx.fs.serverTimestamp();
      data.updatedAt = ctx.fs.serverTimestamp();
      return ctx.fs.addDoc(ctx.fs.collection(ctx.db,'preinscripciones'),data);
    }).then(function(ref){"""
    save_new = """    initFirebase().then(function(ctx){
      return sha256(data.dni).then(function(hash){
        var registryRef = ctx.fs.doc(ctx.db,'alumnos_registro_dni',hash);
        var preRef = ctx.fs.doc(ctx.fs.collection(ctx.db,'preinscripciones'));
        return ctx.fs.runTransaction(ctx.db,function(transaction){
          return transaction.get(registryRef).then(function(registrySnapshot){
            if(registrySnapshot.exists()){
              throw Object.assign(new Error('Este DNI ya se encuentra registrado en Grupo Nostradamus.'),{code:'dni-already-exists'});
            }
            data.createdAt = ctx.fs.serverTimestamp();
            data.updatedAt = ctx.fs.serverTimestamp();
            transaction.set(preRef,data);
            transaction.set(registryRef,{
              dniHash:hash,
              registroId:preRef.id,
              tipo:'preinscripcion_web',
              activo:true,
              createdAt:ctx.fs.serverTimestamp(),
              updatedAt:ctx.fs.serverTimestamp()
            });
            return preRef;
          });
        }).catch(function(error){
          if(error && error.code === 'permission-denied'){
            console.warn('El indice unico de DNI aun no esta publicado; se usa temporalmente el flujo compatible.',error);
            data.createdAt = ctx.fs.serverTimestamp();
            data.updatedAt = ctx.fs.serverTimestamp();
            return ctx.fs.addDoc(ctx.fs.collection(ctx.db,'preinscripciones'),data);
          }
          throw error;
        });
      });
    }).then(function(ref){"""
    if save_new not in text:
        if save_old not in text:
            raise SystemExit('No se encontro guardado addDoc original en preinscripcion-firebase.js')
        text = text.replace(save_old, save_new, 1)

    catch_old = """    }).catch(function(err){
      console.error('Error guardando preinscripción:',err);
      msg('error','No se pudo guardar la preinscripción en Firebase. Revisa las reglas de Firestore o intenta nuevamente.');"""
    catch_new = """    }).catch(function(err){
      console.error('Error guardando preinscripción:',err);
      if(err && err.code === 'dni-already-exists'){
        msg('error','⚠️ Este DNI ya se encuentra registrado en Grupo Nostradamus.<br><b>El sistema te reconoce como alumno antiguo o existente.</b><br><small>No se creó una nueva preinscripción. Si necesitas cambiar de ciclo o corregir datos, comunícate con Coordinación.</small>');
        return;
      }
      msg('error','No se pudo guardar la preinscripción en Firebase. Revisa las reglas de Firestore o intenta nuevamente.');"""
    if catch_new not in text:
        if catch_old not in text:
            raise SystemExit('No se encontro catch de preinscripcion-firebase.js')
        text = text.replace(catch_old, catch_new, 1)

    path.write_text(text, encoding='utf-8')


def patch_existing_guard():
    path = ROOT / 'assets/js/preinscripcion-alumno-existente.js'
    text = path.read_text(encoding='utf-8')
    old = """      var registry = registrySnapshot.data() || {};
      var recordId = clean(registry.registroId);
      if(!recordId) throw Object.assign(new Error('Registro administrativo incompleto'),{code:'invalid-registry'});

      message('info','Encontramos una ficha creada por administración. Completando tus datos sin modificar matrícula ni pagos...');
      var patch = safePatch(form,ctx.fs);
      patch.dni = identity.dni;
      patch.celular = identity.phone;
      return ctx.fs.updateDoc(ctx.fs.doc(ctx.db,PRE_COLLECTION,recordId),patch).then(function(){
        message('ok','✅ Tus datos fueron vinculados a la ficha que ya tenía Coordinación.<br><b>No se creó una segunda preinscripción.</b><br><small>Tu matrícula, precio acordado, cronograma y pagos existentes permanecen sin cambios.</small>');
        form.reset();
        var cycle = form.elements.ciclo;
        if(cycle) cycle.dispatchEvent(new Event('change',{bubbles:true}));
        if(typeof window.gtag === 'function'){
          window.gtag('event','alumno_existente_formulario_completado',{
            event_category:'student_update',
            event_label:'ficha_manual_vinculada'
          });
        }
      });"""
    new = """      message('error','⚠️ Este DNI ya se encuentra registrado en Grupo Nostradamus.<br><b>El sistema te reconoce como alumno antiguo o existente.</b><br><small>No se creó una nueva preinscripción. Si necesitas cambiar de ciclo o corregir tus datos, comunícate con Coordinación.</small>');
      if(typeof window.gtag === 'function'){
        window.gtag('event','preinscripcion_dni_existente_bloqueada',{
          event_category:'student_update',
          event_label:'dni_existente'
        });
      }
      return null;"""
    if new not in text:
        if old not in text:
            raise SystemExit('No se encontro bloque de vinculacion antigua')
        text = text.replace(old, new, 1)
    text = text.replace('Si el DNI pertenece a un alumno manual, completa la misma ficha sin tocar Finanzas.', 'Si el DNI ya existe, bloquea una segunda preinscripción y lo reconoce como alumno existente.')
    path.write_text(text, encoding='utf-8')


def patch_editor_registry():
    path = ROOT / 'assets/js/admin-alumnos-manuales-editor.js'
    text = path.read_text(encoding='utf-8')
    old = """      if(isManualRecord(currentRecord)){
        batch.delete(doc(db,DNI_REGISTRY_COLLECTION,oldHash));
        batch.set(newRegistryRef,{
          dniHash:newHash,
          registroId:currentRecordId,
          tipo:'registro_manual_admin',
          activo:true,
          creadoPor:clean(currentUser.email || ADMIN_EMAIL),
          createdAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
      }"""
    new = """      batch.delete(doc(db,DNI_REGISTRY_COLLECTION,oldHash));
      batch.set(newRegistryRef,{
        dniHash:newHash,
        registroId:currentRecordId,
        tipo:isManualRecord(currentRecord) ? 'registro_manual_admin' : 'preinscripcion_web',
        activo:true,
        creadoPor:clean(currentUser.email || ADMIN_EMAIL),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });"""
    if new not in text:
        if old not in text:
            raise SystemExit('No se encontro actualizacion de indice en editor de alumno')
        text = text.replace(old, new, 1)
    old_msg = """      ? (isManualRecord(currentRecord)
          ? 'Datos guardados y DNI corregido correctamente. El índice anti-duplicados también fue actualizado.'
          : 'Datos guardados y DNI corregido correctamente. La ficha conserva el mismo ID y el historial financiero no fue modificado.')"""
    new_msg = """      ? 'Datos guardados y DNI corregido correctamente. El índice anti-duplicados también fue actualizado.'"""
    if old_msg in text:
        text = text.replace(old_msg, new_msg, 1)
    path.write_text(text, encoding='utf-8')


def write_admin_sync():
    path = ROOT / 'assets/js/admin-dni-unico-sync.js'
    content = r"""/* Grupo Nostradamus - indice unico de DNI para preinscripciones existentes */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, getDocs, query, limit, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCO5jiS9vcEMmBMkGoD5XnNPm_OQILehkM',
  authDomain:'nostrachat-grupo-nostradamus.firebaseapp.com',
  projectId:'nostrachat-grupo-nostradamus',
  storageBucket:'nostrachat-grupo-nostradamus.firebasestorage.app',
  messagingSenderId:'869749182265',
  appId:'1:869749182265:web:5f5c9174680585f142e2e8'
};

const ADMIN_EMAIL = 'fernandodaniel8888@gmail.com';
const PRE_COLLECTION = 'preinscripciones';
const REGISTRY_COLLECTION = 'alumnos_registro_dni';
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const clean = value => String(value == null ? '' : value).trim();
const dniDigits = value => clean(value).replace(/\D/g,'').slice(0,12);

async function sha256(value){
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('');
}

function score(record){
  let value = 0;
  if(record?.matriculaAprobada === true || record?.estado === 'matriculado') value += 100;
  if(record?.pagoValidado === true || record?.estadoPago === 'pago_validado') value += 50;
  if(record?.origen === 'registro_manual_admin') value += 10;
  return value;
}

async function syncRegistry(user){
  try{
    const snapshot = await getDocs(query(collection(db,PRE_COLLECTION),limit(1000)));
    const canonical = new Map();
    for(const item of snapshot.docs){
      const record = {id:item.id,...item.data()};
      const dni = dniDigits(record.dni);
      if(dni.length < 8) continue;
      const hash = await sha256(dni);
      const previous = canonical.get(hash);
      if(!previous || score(record) > score(previous)) canonical.set(hash,record);
    }

    let created = 0;
    for(const [hash,record] of canonical){
      const registryRef = doc(db,REGISTRY_COLLECTION,hash);
      const existing = await getDoc(registryRef);
      if(existing.exists()) continue;
      await setDoc(registryRef,{
        dniHash:hash,
        registroId:record.id,
        tipo:record.origen === 'registro_manual_admin' ? 'registro_manual_admin' : 'preinscripcion_web',
        activo:true,
        creadoPor:clean(user.email || ADMIN_EMAIL),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      created += 1;
    }
    if(created) console.info(`[DNI único] ${created} DNI existentes incorporados al índice anti-duplicados.`);
  }catch(error){
    console.warn('[DNI único] El índice aún no pudo sincronizarse. Verifica que las reglas Firestore actualizadas estén publicadas.',error);
  }
}

onAuthStateChanged(auth,user => {
  if(user && clean(user.email).toLowerCase() === ADMIN_EMAIL) syncRegistry(user);
});
"""
    path.write_text(content, encoding='utf-8')


def patch_html():
    admin = ROOT / 'admin-preinscripciones.html'
    text = admin.read_text(encoding='utf-8')
    text = text.replace('admin-alumnos-manuales-editor.js?v=2026-08-18-universal-1', 'admin-alumnos-manuales-editor.js?v=2026-08-18-dni-unico-1')
    marker = '  <script type="module" src="assets/js/admin-alumnos-manuales-editor.js?v=2026-08-18-dni-unico-1"></script>'
    sync_tag = '  <script type="module" src="assets/js/admin-dni-unico-sync.js?v=2026-08-18-1"></script>'
    if sync_tag not in text:
        if marker not in text:
            raise SystemExit('No se encontro carga del editor en admin-preinscripciones.html')
        text = text.replace(marker, marker + '\n' + sync_tag, 1)
    admin.write_text(text, encoding='utf-8')

    pre = ROOT / 'preinscripcion.html'
    text = pre.read_text(encoding='utf-8')
    text = re.sub(r'preinscripcion-alumno-existente\.js\?v=[^"\']+', 'preinscripcion-alumno-existente.js?v=2026-08-18-dni-unico-1', text, count=1)
    text = re.sub(r'preinscripcion-firebase\.js\?v=[^"\']+', 'preinscripcion-firebase.js?v=2026-08-18-dni-unico-1', text, count=1)
    pre.write_text(text, encoding='utf-8')


def patch_rules():
    path = ROOT / '.nostrachat/firestore-rules-parts/insert-alumnos-manuales.rules'
    text = path.read_text(encoding='utf-8')
    pattern = re.compile(r"    match /alumnos_registro_dni/\{dniHash\} \{.*?^    \}\n", re.S | re.M)
    replacement = r"""    match /alumnos_registro_dni/{dniHash} {
      allow get: if true;
      allow list: if false;

      allow create: if dniHash.matches('^[0-9a-f]{64}$')
        && request.resource.data.dniHash == dniHash
        && request.resource.data.registroId is string
        && request.resource.data.registroId.size() >= 5
        && request.resource.data.registroId.size() <= 180
        && request.resource.data.tipo in ['registro_manual_admin','preinscripcion_web']
        && request.resource.data.activo == true
        && request.resource.data.createdAt == request.time
        && request.resource.data.updatedAt == request.time
        && (
          (
            isAdmin()
            && request.resource.data.keys().hasOnly([
              'dniHash','registroId','tipo','activo','creadoPor','createdAt','updatedAt'
            ])
            && request.resource.data.creadoPor == request.auth.token.email
          )
          ||
          (
            request.auth == null
            && request.resource.data.keys().hasOnly([
              'dniHash','registroId','tipo','activo','createdAt','updatedAt'
            ])
            && request.resource.data.tipo == 'preinscripcion_web'
            && existsAfter(
              /databases/$(database)/documents/preinscripciones/$(request.resource.data.registroId)
            )
            && getAfter(
              /databases/$(database)/documents/preinscripciones/$(request.resource.data.registroId)
            ).data.origen == 'web_preinscripcion'
            && getAfter(
              /databases/$(database)/documents/preinscripciones/$(request.resource.data.registroId)
            ).data.dni is string
            && getAfter(
              /databases/$(database)/documents/preinscripciones/$(request.resource.data.registroId)
            ).data.dni.matches('^[0-9]{8,12}$')
          )
        );

      allow update, delete: if isAdmin();
    }
"""
    new_text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit('No se encontro bloque alumnos_registro_dni en reglas')
    path.write_text(new_text, encoding='utf-8')


def validate():
    pre = (ROOT / 'assets/js/preinscripcion-firebase.js').read_text(encoding='utf-8')
    if "runTransaction(ctx.db" not in pre or "dni-already-exists" not in pre:
        raise SystemExit('Validacion: falta transaccion unica de DNI')
    existing = (ROOT / 'assets/js/preinscripcion-alumno-existente.js').read_text(encoding='utf-8')
    if 'Completando tus datos' in existing:
        raise SystemExit('Validacion: sigue activa la vinculacion antigua')
    editor = (ROOT / 'assets/js/admin-alumnos-manuales-editor.js').read_text(encoding='utf-8')
    if "tipo:isManualRecord(currentRecord) ? 'registro_manual_admin' : 'preinscripcion_web'" not in editor:
        raise SystemExit('Validacion: el editor no mantiene el indice universal')
    admin = (ROOT / 'admin-preinscripciones.html').read_text(encoding='utf-8')
    if 'admin-dni-unico-sync.js?v=2026-08-18-1' not in admin:
        raise SystemExit('Validacion: falta sincronizador de DNI en admin')
    rules = (ROOT / '.nostrachat/firestore-rules-parts/insert-alumnos-manuales.rules').read_text(encoding='utf-8')
    if "request.resource.data.tipo == 'preinscripcion_web'" not in rules or 'existsAfter(' not in rules:
        raise SystemExit('Validacion: reglas no permiten reserva atomica web')


def main():
    patch_preinscripcion_firebase()
    patch_existing_guard()
    patch_editor_registry()
    write_admin_sync()
    patch_html()
    patch_rules()
    validate()
    print('Bloqueo universal de DNI aplicado correctamente.')


if __name__ == '__main__':
    main()
