# Panel financiero — Etapa 1

Prototipo funcional e independiente para registrar y consultar ingresos y egresos del Grupo Nostradamus.

## Funciones incluidas

- Registro de ingresos y egresos.
- Categorías diferenciadas por tipo de movimiento.
- Métodos de pago: efectivo, Yape, Plin, transferencia BCP, tarjeta/pasarela y otros.
- Resumen por día, mes, año o historial completo.
- Indicadores de ingresos, egresos, saldo y cantidad de movimientos.
- Historial con búsqueda y filtro por tipo.
- Exportación del historial a CSV.
- Diseño adaptable para computadora, tablet y celular.

## Acceso local

Abrir `admin-finanzas/index.html` en un navegador moderno.

## Almacenamiento actual

Esta etapa utiliza `localStorage` del navegador únicamente para validar la experiencia de uso. Los datos permanecen en el dispositivo y navegador donde fueron registrados.

**No debe utilizarse todavía como sistema financiero definitivo ni compartirse públicamente.**

## Siguiente etapa técnica

Antes de manejar información real se debe incorporar:

1. Inicio de sesión seguro.
2. Usuarios, roles y permisos.
3. Base de datos centralizada.
4. Auditoría de creación, modificación y anulación.
5. Copias de seguridad.
6. Protección de la ruta administrativa.

Después se conectarán los módulos de pagos de alumnos, pagos de docentes y asistencia.