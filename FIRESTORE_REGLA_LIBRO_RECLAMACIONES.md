# Regla Firestore para el Libro de Reclamaciones

El formulario público registra cada hoja en la colección `libro_reclamaciones`. Para que funcione sin exponer los reclamos al público, incorpora este bloque dentro de:

```javascript
match /databases/{database}/documents {
```

La función `isAdmin()` debe conservar la definición que ya utiliza el panel administrativo.

```javascript
match /libro_reclamaciones/{reclamoId} {
  // Cualquier consumidor puede crear una hoja, pero nunca leer reclamos existentes.
  allow create: if request.resource.data.keys().hasOnly([
      'codigo',
      'tipo',
      'consumidor',
      'apoderado',
      'servicio',
      'detalle',
      'pedido',
      'declaracionAceptada',
      'estado',
      'estadoAtencion',
      'respuestaAdministrativa',
      'responsable',
      'notificacionPendiente',
      'plazoMaximoDiasHabiles',
      'origen',
      'versionFormato',
      'pageUrl',
      'userAgent',
      'createdAt',
      'updatedAt'
    ])
    && request.resource.data.codigo is string
    && request.resource.data.codigo.size() >= 12
    && request.resource.data.codigo.size() <= 30
    && request.resource.data.tipo in ['reclamo', 'queja']
    && request.resource.data.estado == 'recibido'
    && request.resource.data.estadoAtencion == 'pendiente'
    && request.resource.data.respuestaAdministrativa == ''
    && request.resource.data.responsable == ''
    && request.resource.data.notificacionPendiente == true
    && request.resource.data.plazoMaximoDiasHabiles == 15
    && request.resource.data.origen == 'libro_reclamaciones_web'
    && request.resource.data.declaracionAceptada == true
    && request.resource.data.detalle is string
    && request.resource.data.detalle.size() >= 20
    && request.resource.data.detalle.size() <= 4000
    && request.resource.data.pedido is string
    && request.resource.data.pedido.size() >= 10
    && request.resource.data.pedido.size() <= 2000
    && request.resource.data.consumidor is map
    && request.resource.data.consumidor.keys().hasOnly([
      'nombres',
      'tipoDocumento',
      'numeroDocumento',
      'correo',
      'celular',
      'direccion',
      'distrito',
      'ubicacion',
      'menorEdad'
    ])
    && request.resource.data.consumidor.nombres is string
    && request.resource.data.consumidor.nombres.size() >= 5
    && request.resource.data.consumidor.nombres.size() <= 120
    && request.resource.data.consumidor.numeroDocumento is string
    && request.resource.data.consumidor.numeroDocumento.size() >= 6
    && request.resource.data.consumidor.numeroDocumento.size() <= 20
    && request.resource.data.consumidor.correo is string
    && request.resource.data.consumidor.correo.size() >= 5
    && request.resource.data.consumidor.correo.size() <= 120
    && request.resource.data.consumidor.celular is string
    && request.resource.data.consumidor.celular.size() >= 9
    && request.resource.data.consumidor.celular.size() <= 20
    && request.resource.data.servicio is map
    && request.resource.data.servicio.keys().hasOnly([
      'tipo',
      'nombre',
      'fecha',
      'monto',
      'comprobante'
    ])
    && request.resource.data.servicio.tipo == 'servicio educativo'
    && request.resource.data.servicio.nombre is string
    && request.resource.data.servicio.nombre.size() >= 3
    && request.resource.data.servicio.nombre.size() <= 160
    && request.resource.data.servicio.monto is number
    && request.resource.data.servicio.monto >= 0
    && request.resource.data.servicio.monto <= 100000
    && request.resource.data.createdAt == request.time
    && request.resource.data.updatedAt == request.time;

  // Solo el administrador autorizado puede revisar y actualizar la atención.
  allow read, update: if isAdmin();

  // Los registros no se eliminan desde la web.
  allow delete: if false;
}
```

## Verificación

1. Publica las reglas en Firebase Console.
2. Abre `libro-de-reclamaciones.html` en una ventana privada.
3. Registra una prueba.
4. Confirma que se genere una constancia y que aparezca un documento nuevo en `libro_reclamaciones`.
5. Ingresa a `admin-preinscripciones.html` con el correo administrador y revisa el panel del Libro de Reclamaciones.

No habilites lectura pública sobre esta colección porque contiene datos personales y detalles de consumo.