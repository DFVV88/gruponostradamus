# Parte 2 — Regla segura para precios de Nostra 360 UNI

Esta regla habilita únicamente la colección pública de precios y permite modificar solamente el documento de Nostra 360 desde la cuenta administradora autorizada.

## Importante

- No reemplazar todas las reglas actuales de Firestore.
- No borrar las reglas existentes de `preinscripciones`, `users`, cuentas u otras colecciones.
- Añadir el siguiente bloque **dentro** de:

```text
match /databases/{database}/documents {
  // Aquí van las reglas existentes y el bloque nuevo.
}
```

## Bloque que debe añadirse

```javascript
function isNostraPricingAdmin() {
  return request.auth != null
    && request.auth.token.email == "fernandodaniel8888@gmail.com"
    && request.auth.token.email_verified == true;
}

match /programas_publicos/{programId} {
  // Los visitantes pueden consultar precios publicados.
  allow read: if true;

  // Solo el administrador puede crear o modificar Nostra 360.
  allow create, update: if isNostraPricingAdmin()
    && programId == "nostra-360-uni";

  // Nadie elimina el tarifario desde la web.
  allow delete: if false;
}
```

## Resultado esperado

Después de publicar la regla:

1. `admin-preinscripciones.html` podrá leer el tarifario.
2. El botón **Guardar Nostra 360 UNI** podrá crear o actualizar `programas_publicos/nostra-360-uni`.
3. `ciclo-anual-uni.html` podrá mostrar los precios guardados.
4. `preinscripcion.html` podrá cargar los cuatro planes y el precio referencial.
5. Los demás ciclos seguirán sin permiso de escritura durante esta etapa.

## Prueba controlada

1. Cambiar temporalmente Presencial — Turno Mañana de S/400 a S/401.
2. Guardar Nostra 360.
3. Abrir `ciclo-anual-uni.html` con actualización forzada.
4. Confirmar que aparece S/401.
5. Volver a S/400 y guardar nuevamente.
