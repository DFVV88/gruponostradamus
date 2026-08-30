#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text, old, new, label):
    if new in text:
        return text, False
    if old not in text:
        raise SystemExit(f'No se encontro {label}')
    return text.replace(old, new, 1), True


def patch_culqi_flow():
    path = ROOT / 'assets/js/preinscripcion-culqi-preparacion.js'
    text = path.read_text(encoding='utf-8')

    helper_old = """  function clean(value){ return String(value == null ? '' : value).replace(/\\s+/g,' ').trim(); }
  function esc(value){"""
    helper_new = """  function clean(value){ return String(value == null ? '' : value).replace(/\\s+/g,' ').trim(); }
  function dniDigits(value){ return clean(value).replace(/\\D/g,'').slice(0,12); }
  function sha256(value){
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)).then(function(buffer){
      return Array.from(new Uint8Array(buffer)).map(function(byte){ return byte.toString(16).padStart(2,'0'); }).join('');
    });
  }
  function esc(value){"""
    if 'function dniDigits(value)' not in text:
        text, _ = replace_once(text, helper_old, helper_new, 'helpers DNI en flujo Culqi')

    text = text.replace(
        "    if(formValue(form,'dni').length < 8) return 'Escribe un DNI válido.';",
        "    if(dniDigits(formValue(form,'dni')).length < 8) return 'Escribe un DNI válido.';",
        1,
    )
    text = text.replace(
        "      dni:formValue(form,'dni'),",
        "      dni:dniDigits(formValue(form,'dni')),",
        1,
    )

    save_old = """    }).then(function(step){
      var ctx = step.official.ctx;
      var ref = ctx.fs.doc(ctx.fs.collection(ctx.db,'preinscripciones'));
      var data = buildData(form,step.official,ref.id);
      data.createdAt = ctx.fs.serverTimestamp();
      data.updatedAt = ctx.fs.serverTimestamp();
      return ctx.fs.setDoc(ref,data).then(function(){
        return {ref:ref,data:data,publicKey:step.publicKey};
      });
    }).then(function(result){"""
    save_new = """    }).then(function(step){
      var ctx = step.official.ctx;
      var dni = dniDigits(formValue(form,'dni'));
      return sha256(dni).then(function(hash){
        var registryRef = ctx.fs.doc(ctx.db,'alumnos_registro_dni',hash);
        var ref = ctx.fs.doc(ctx.db,'preinscripciones',hash);
        var data = buildData(form,step.official,ref.id);
        data.createdAt = ctx.fs.serverTimestamp();
        data.updatedAt = ctx.fs.serverTimestamp();
        return ctx.fs.runTransaction(ctx.db,function(transaction){
          return transaction.get(registryRef).then(function(registrySnapshot){
            if(registrySnapshot.exists()){
              throw Object.assign(new Error('Este DNI ya se encuentra registrado en Grupo Nostradamus.'),{code:'dni-already-exists'});
            }
            return transaction.get(ref).then(function(preSnapshot){
              if(preSnapshot.exists()){
                throw Object.assign(new Error('Este DNI ya cuenta con una preinscripción.'),{code:'dni-already-exists'});
              }
              transaction.set(ref,data);
              transaction.set(registryRef,{
                dniHash:hash,
                registroId:ref.id,
                tipo:'preinscripcion_web',
                activo:true,
                createdAt:ctx.fs.serverTimestamp(),
                updatedAt:ctx.fs.serverTimestamp()
              });
              return {ref:ref,data:data,publicKey:step.publicKey};
            });
          });
        });
      });
    }).then(function(result){"""
    text, _ = replace_once(text, save_old, save_new, 'guardado atomico del flujo Culqi')

    catch_old = """    }).catch(function(saveError){
      console.error('No se pudo registrar o preparar la preinscripción:',saveError);
      message('error',saveError && saveError.code === 'permission-denied'
        ? 'Firebase no permitió registrar la solicitud. Deben revisarse las reglas de preinscripciones.'
        : esc(saveError && saveError.message ? saveError.message : 'No se pudo verificar el tarifario o preparar el pago.'));
    }).finally(function(){"""
    catch_new = """    }).catch(function(saveError){
      console.error('No se pudo registrar o preparar la preinscripción:',saveError);
      if(saveError && saveError.code === 'dni-already-exists'){
        message('error','⚠️ Este DNI ya se encuentra registrado en Grupo Nostradamus.<br><b>No se creó una segunda preinscripción.</b><br><small>Si necesitas cambiar de ciclo, forma de pago o corregir datos, comunícate con Coordinación.</small>');
        return;
      }
      if(saveError && saveError.code === 'permission-denied'){
        message('error','No se pudo verificar de forma segura si este DNI ya está registrado. <b>No se creó ninguna preinscripción.</b> Intenta nuevamente o comunícate con Coordinación.');
        return;
      }
      message('error',esc(saveError && saveError.message ? saveError.message : 'No se pudo verificar el tarifario o preparar el pago.'));
    }).finally(function(){"""
    text, _ = replace_once(text, catch_old, catch_new, 'manejo seguro de errores del flujo Culqi')

    path.write_text(text, encoding='utf-8')


def patch_legacy_flow():
    path = ROOT / 'assets/js/preinscripcion-firebase.js'
    text = path.read_text(encoding='utf-8')

    save_old = """        var registryRef = ctx.fs.doc(ctx.db,'alumnos_registro_dni',hash);
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
        });"""
    save_new = """        var registryRef = ctx.fs.doc(ctx.db,'alumnos_registro_dni',hash);
        var preRef = ctx.fs.doc(ctx.db,'preinscripciones',hash);
        return ctx.fs.runTransaction(ctx.db,function(transaction){
          return transaction.get(registryRef).then(function(registrySnapshot){
            if(registrySnapshot.exists()){
              throw Object.assign(new Error('Este DNI ya se encuentra registrado en Grupo Nostradamus.'),{code:'dni-already-exists'});
            }
            return transaction.get(preRef).then(function(preSnapshot){
              if(preSnapshot.exists()){
                throw Object.assign(new Error('Este DNI ya cuenta con una preinscripción.'),{code:'dni-already-exists'});
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
          });
        });"""
    text, _ = replace_once(text, save_old, save_new, 'guardado atomico del flujo Firebase alterno')

    catch_old = """      if(err && err.code === 'dni-already-exists'){
        msg('error','⚠️ Este DNI ya se encuentra registrado en Grupo Nostradamus.<br><b>El sistema te reconoce como alumno antiguo o existente.</b><br><small>No se creó una nueva preinscripción. Si necesitas cambiar de ciclo o corregir datos, comunícate con Coordinación.</small>');
        return;
      }
      msg('error','No se pudo guardar la preinscripción en Firebase. Revisa las reglas de Firestore o intenta nuevamente.');"""
    catch_new = """      if(err && err.code === 'dni-already-exists'){
        msg('error','⚠️ Este DNI ya se encuentra registrado en Grupo Nostradamus.<br><b>No se creó una segunda preinscripción.</b><br><small>Si necesitas cambiar de ciclo, forma de pago o corregir datos, comunícate con Coordinación.</small>');
        return;
      }
      if(err && err.code === 'permission-denied'){
        msg('error','No se pudo verificar de forma segura si este DNI ya está registrado. <b>No se creó ninguna preinscripción.</b> Intenta nuevamente o comunícate con Coordinación.');
        return;
      }
      msg('error','No se pudo guardar la preinscripción. Intenta nuevamente o comunícate con Coordinación.');"""
    text, _ = replace_once(text, catch_old, catch_new, 'manejo seguro de errores del flujo Firebase alterno')

    if 'flujo compatible' in text or "ctx.fs.addDoc(ctx.fs.collection(ctx.db,'preinscripciones'),data)" in text:
        raise SystemExit('Todavia existe una ruta que permite guardar sin validar el DNI')

    path.write_text(text, encoding='utf-8')


def patch_cache_bust():
    path = ROOT / 'preinscripcion.html'
    text = path.read_text(encoding='utf-8')
    version = '2026-08-30-dni-atomico-1'
    text = re.sub(r'preinscripcion-alumno-existente\.js\?v=[^"\']+', f'preinscripcion-alumno-existente.js?v={version}', text, count=1)
    text = re.sub(r'preinscripcion-culqi-preparacion\.js\?v=[^"\']+', f'preinscripcion-culqi-preparacion.js?v={version}', text, count=1)
    text = re.sub(r'preinscripcion-firebase\.js\?v=[^"\']+', f'preinscripcion-firebase.js?v={version}', text, count=1)
    path.write_text(text, encoding='utf-8')


def main():
    patch_culqi_flow()
    patch_legacy_flow()
    patch_cache_bust()
    print('Proteccion atomica contra doble preinscripcion aplicada.')


if __name__ == '__main__':
    main()
