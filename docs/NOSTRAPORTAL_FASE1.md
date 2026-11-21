# NostraPORTAL — fase 1, 21 de noviembre de 2026

## Alcance ejecutado
- NostraCUENTA conserva activación Microsoft 365, usuario corto y Firebase Authentication.
- Nuevo panel responsivo después de login solamente para perfiles de alumno activos y no bloqueados.
- Accesos directos a NostraCHAT, clases en vivo, WhatsApp institucional.
- NostraLAB consulta el catálogo público oficial nostralab/catalogo.json; sólo muestra experiencias con publicado: true, usando títulos, cursos e imágenes originales y enlace al visor canónico.
- Secciones de mis asistencias, notas NostraREPORTES, pagos, matrícula, materiales, progreso y comunicados muestran explícitamente integración pendiente. No se inventan métricas, faltas ni notas.
- Ambas rutas de sesión aplican la misma validación de perfil activo y no bloqueado.

## Protección de datos
No se concede lectura del lado cliente a preinscripciones, asistencia_registros, alumno_cuotas, finanzas_movimientos ni alumno_abonos. Por ahora ninguna de esas secciones muestra datos personales.
Para fase 2 se requiere:
1. Vinculación administrativa verificable de users/{uid} con identificador interno único de alumno, sin hacer match por nombre ni aceptar DNI ingresado como autorización.
2. API de lectura de asistencia de un solo alumno después de verificar ID token y vínculo de alumno activo. Actualmente asistenciaAdmin exige administrador y no debe reutilizarse.
3. Reportes NostraREPORTES: QA aprobado, asociación exacta, aprobación de publicación y almacenamiento privado con rutas por UID más reglas de Storage y Firestore dedicadas.
4. Pagos y matrícula: lecturas individuales filtradas y controladas; no abrir las colecciones administrativas.
5. Integrar material autorizado por ciclo y comunicados verificados.

## Validación
Ejecutar: node --test scripts/test-nostraportal-phase1.mjs

No se realizan cambios en las colecciones de pagos, preinscripciones o asistencias ni se publican documentos académicos privados durante esta fase.
