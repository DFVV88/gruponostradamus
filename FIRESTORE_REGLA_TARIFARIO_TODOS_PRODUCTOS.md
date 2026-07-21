# Regla Firestore para todos los productos académicos

En **Firebase Console → Firestore Database → Reglas**, reemplaza únicamente el bloque actual de `programas_publicos` por el siguiente bloque. Debe permanecer dentro de:

```javascript
match /databases/{database}/documents {
```

```javascript
match /programas_publicos/{programId} {
  // Lectura pública para mostrar planes, precios, horarios y promociones.
  allow read: if true;

  // Solo el administrador puede crear o modificar productos autorizados.
  allow create, update: if isAdmin()
    && programId in [
      'nostra-360-uni',
      'nostra-power-uni',
      'nostra-elite-uni',
      'nostra-prime-uni',
      'nostra-talentum-uni',
      'ciclo-ien',
      'proyecto-escolar',
      'paralelo-cepre-uni',
      'ciclo-verano-uni'
    ];

  // El tarifario no se elimina desde la web.
  allow delete: if false;
}
```

No reemplaces las demás reglas de preinscripciones, usuarios, NostraCUENTAS o NostraCHAT.
