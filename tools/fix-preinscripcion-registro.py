#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'No se encontro el bloque esperado: {label}')
    return text.replace(old, new, 1)


def patch_culqi_flow():
    path = ROOT / 'assets/js/preinscripcion-culqi-preparacion.js'
    text = path.read_text(encoding='utf-8')

    # IMPORTANTE: no se modifican URLs, tokenizacion, 3DS, preparePayment,
    # createCharge, montos ni payloads de Culqi. Solo el alta Firestore previa.
    required_markers = [
        "var PREPARE_URL = API_BASE + 'culqiPreparePayment';",
        "var CHARGE_URL = API_BASE + 'culqiCreateCharge';",
        "function prepareOnlinePayment(context,publicKey)",
        "function openCheckout(context,publicKey)",
    ]
    for marker in required_markers:
        if marker not in text:
            raise SystemExit(f'Falta marcador critico de Culqi: {marker}')

    old = """        return ctx.fs.runTransaction(ctx.db,function(transaction){
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
        });"""

    new = """        return ctx.fs.runTransaction(ctx.db,function(transaction){
          return transaction.get(registryRef).then(function(registrySnapshot){
            if(registrySnapshot.exists()){
              throw Object.assign(new Error('Este DNI ya se encuentra registrado en Grupo Nostradamus.'),{code:'dni-already-exists'});
            }

            // No se intenta leer preinscripciones/{hash} desde la web publica.
            // Las reglas permiten CREATE publico, pero READ solo al administrador.
            // Leer este documento hacia que TODOS los DNI nuevos terminaran en
            // permission-denied antes de poder registrarse.
            //
            // La unicidad sigue protegida por dos capas:
            // 1) alumnos_registro_dni/{hash}, consultado dentro de la transaccion.
            // 2) preinscripciones/{hash}, ID deterministico. Si ya existe, este
            //    set seria una actualizacion y Firestore la rechaza al publico.
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
        });"""

    text = replace_once(text, old, new, 'lectura prohibida de preinscripcion en flujo Culqi')
    path.write_text(text, encoding='utf-8')


def patch_firebase_fallback_flow():
    path = ROOT / 'assets/js/preinscripcion-firebase.js'
    text = path.read_text(encoding='utf-8')

    old = """        return ctx.fs.runTransaction(ctx.db,function(transaction){
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

    new = """        return ctx.fs.runTransaction(ctx.db,function(transaction){
          return transaction.get(registryRef).then(function(registrySnapshot){
            if(registrySnapshot.exists()){
              throw Object.assign(new Error('Este DNI ya se encuentra registrado en Grupo Nostradamus.'),{code:'dni-already-exists'});
            }

            // Mantener el mismo criterio del flujo principal: no hacer una
            // lectura publica de preinscripciones/{hash}, porque Firestore
            // reserva esas lecturas al administrador.
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
        });"""

    text = replace_once(text, old, new, 'lectura prohibida de preinscripcion en flujo Firebase alterno')
    path.write_text(text, encoding='utf-8')


def patch_cache_bust():
    path = ROOT / 'preinscripcion.html'
    text = path.read_text(encoding='utf-8')
    version = '2026-09-01-registro-fix-1'
    text = re.sub(
        r'preinscripcion-culqi-preparacion\.js\?v=[^"\']+',
        f'preinscripcion-culqi-preparacion.js?v={version}',
        text,
        count=1,
    )
    text = re.sub(
        r'preinscripcion-firebase\.js\?v=[^"\']+',
        f'preinscripcion-firebase.js?v={version}',
        text,
        count=1,
    )
    path.write_text(text, encoding='utf-8')


def validate_result():
    culqi = (ROOT / 'assets/js/preinscripcion-culqi-preparacion.js').read_text(encoding='utf-8')
    legacy = (ROOT / 'assets/js/preinscripcion-firebase.js').read_text(encoding='utf-8')

    if "transaction.get(ref).then(function(preSnapshot)" in culqi:
        raise SystemExit('La lectura publica prohibida sigue presente en flujo Culqi')
    if "transaction.get(preRef).then(function(preSnapshot)" in legacy:
        raise SystemExit('La lectura publica prohibida sigue presente en flujo alterno')

    # La estructura de pagos Culqi debe seguir intacta.
    culqi_invariants = [
        "var PREPARE_URL = API_BASE + 'culqiPreparePayment';",
        "var CHARGE_URL = API_BASE + 'culqiCreateCharge';",
        "postJson(PREPARE_URL,{",
        "postJson(CHARGE_URL,payload)",
        "tokenId:tokenId",
        "deviceFingerprintId:security.deviceFingerprintId",
        "if(security.authentication3DS) payload.authentication3DS = security.authentication3DS;",
        "openCheckout(context,publicKey);",
    ]
    for marker in culqi_invariants:
        if marker not in culqi:
            raise SystemExit(f'Se altero un invariante de Culqi: {marker}')

    print('Correccion aplicada: registro restaurado sin alterar el flujo de pagos Culqi.')


def main():
    patch_culqi_flow()
    patch_firebase_fallback_flow()
    patch_cache_bust()
    validate_result()


if __name__ == '__main__':
    main()
