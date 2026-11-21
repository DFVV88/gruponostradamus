# NostraPUBLICADOR 1.0 — piloto técnico

**Estado inicial: cerrado por defecto.** La incorporación del frontend al sitio por GitHub Pages no activa por sí misma la función Firebase ni las reglas de Storage.

## Funciones disponibles

- `admin_batch_preview`: valida el lote JSON de transporte sin publicar.
- `admin_batch_publish`: publica únicamente en las cuentas piloto explícitamente habilitadas.
- `admin_recipients`: consulta matrículas oficiales con vínculo bidireccional y cuentas activas.
- `admin_manual_preview`: verifica la identidad, el informe y la autorización **antes** de la subida manual.
- `admin_report_publish`: usa PDF temporal en Storage restringido; sólo piloto.
- `admin_report_list` y `admin_report_revoke`: historial y revocación.
- `student_report_download`: entrega PDF por sesión Firebase verificada, no por URL pública.
- `student_state` (NostraPORTAL): lista únicamente informes publicados y vinculados al UID autenticado.

## Activación técnica, sólo después de revisar y fusionar el PR

En el directorio del repositorio con `firebase.json`, usando Cloud Shell autenticada para el proyecto:

```bash
git pull origin main
firebase deploy --only functions:nostrareportesApi,functions:nostraportalApi,storage --project nostrachat-grupo-nostradamus
```

Este comando crea/actualiza las dos funciones y publica las reglas vigentes de Storage, incluyendo el acceso temporal limitado a admin. No incluye despliegue de funciones de pagos, matrículas, finanzas o asistencia. **No ejecutarlo automáticamente sin autorización de operaciones Firebase.**

## Autorización deliberada de cuenta piloto

En Firestore Console, colección `nostrapublicador_config`, documento `publicacion`:

```json
{
  "enabled": true,
  "permitidos": ["UID_EXACTO_DE_LA_NOSTRACUENTA_PROPIA_DE_PRUEBAS"]
}
```

El UID tiene que proceder de la cuenta de pruebas que ya esté vinculada a una matrícula oficial. **No usar un UID de alumno real para el piloto.** Sin este documento o con `enabled=false`, ambas rutas de publicación quedan deshabilitadas; la consulta previa sigue disponible.

## Pruebas de aceptación

1. Con `enabled=false` o documento ausente, la subida manual queda bloqueada tras previsualizar y el lote devuelve `NO_AUTORIZADO_PARA_PRUEBA`.
2. Con la propia NostraCUENTA autorizada, seleccionar su matrícula oficial y cargar un PDF individual **de prueba** que superó NostraQA.
3. Confirmar que su nombre, DNI parcialmente oculto y programa coinciden antes de publicar.
4. Verificar que `Mi notas` en esa NostraCUENTA muestre el informe, y que pueda descargarse como PDF sin enlace público.
5. Confirmar que otra cuenta de estudiante y una sesión anónima no acceden a su descarga.
6. Revocar el PDF desde el panel y verificar que deja de estar disponible.
7. Verificar que no cambió ningún documento de matrícula, asistencia, cuotas ni finanzas.

**No distribuir informes reales a alumnos/padres ni habilitar todos los UIDs sin aprobación explícita y QA de extremo a extremo.**

## Diferencia entre automático y manual

En automático, NostraREPORTES prepara manifiesto y archivos verificados por NostraQA; para la pantalla del piloto, se genera un JSON de transporte con `pdf_base64` por fila (máximo 8 informes, 16 MiB por archivo). En manual, el administrador selecciona un PDF individual de hasta 8 MiB y lo publica en la cuenta piloto verificada sin preparar ese JSON. Ninguna de las dos vías cambia la generación tradicional de PDF, ZIP, ranking o análisis.

**Limitación actual:** este piloto dispone de recepción por lote y carga manual en NostraADMIN, pero no incluye todavía un conector remoto que transfiera los archivos automáticamente desde ChatGPT sin usar el panel. No afirmar esa automatización hasta comprobar conexión y entrega real.
