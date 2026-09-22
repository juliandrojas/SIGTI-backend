# Guía técnica — SIGTI

## Alcance y arquitectura

| Componente | Implementación actual | Responsabilidad |
| --- | --- | --- |
| Interfaz web | React/Vite, repositorio `SIGTI-frontend` | Rutas, formularios y visualización. |
| API | Express/Node.js, repositorio `SIGTI-backend` | Autenticación, permisos y reglas de negocio. |
| Base de datos | PostgreSQL; origen actual en Supabase | Usuarios, inventario, préstamos, solicitudes y mantenimientos. |
| Cliente móvil | Flutter, repositorio separado | No incluido ni validado para esta entrega. |

El frontend llama a la API con JSON y un JWT de sesión. La API usa `pg` para PostgreSQL. Los repositorios web son independientes y se publican por separado. El mapa de carpetas y puntos de entrada está en [PROJECT_GUIDE.md](../PROJECT_GUIDE.md).

## Acceso y permisos

- `POST /users/login` devuelve los datos del usuario y un JWT tras validar las credenciales.
- Las rutas `/inventory/*` exigen token. Las operaciones de administración de artículos, solicitudes y mantenimientos verifican además el rol en el backend.
- La interfaz web presenta el área de Sistemas para rol `1` y el área de colaboradores para rol `2`; los permisos de la interfaz no sustituyen la autorización del servidor.
- La ruta pública de creación `POST /users/create` está presente en el código. **Antes de exponer una nueva instalación a internet**, la empresa debe decidir y verificar si permite el autorregistro; no asumir que el acceso está limitado por ocultar el formulario.

El material de importación de usuarios debe revisarse antes de reutilizarlo: contiene supuestos sobre ID de roles y una contraseña inicial definida en el script. No documentar ni distribuir la contraseña en este paquete.

## Modelo de datos operativo

| Tabla | Función | Relación esencial |
| --- | --- | --- |
| `roles` | Perfiles de acceso | `users.role_id → roles.id` |
| `users` | Identidad y técnico | `maintenance_records.technician_id → users.id` |
| `inventory_items` | Periféricos y computadores | `maintenance_records.item_id → inventory_items.id` |
| `maintenance_records` | Historial de mantenimiento | `item_id` obligatorio; `technician_id` opcional |
| `inventory_requests` | Solicitudes de usuarios | Vincula solicitante y artículo |
| `inventory_loans` | Préstamos y devoluciones | Vincula el préstamo y el artículo |

La IP, el código institucional, área, usuario asignado y características técnicas están en `inventory_items`. `maintenance_records` guarda fecha realizada, próxima fecha, técnico, actividades y observaciones; **no almacena una IP histórica por mantenimiento**. Editar una IP desde el historial actualiza el artículo vinculado. Véase el [contrato de mantenimiento](../api/maintenance.md).

`asset_type` clasifica cada artículo como `laptop`, `all_in_one`, `tower` o `peripheral`. El código institucional para equipos se compone del prefijo de empresa/tipo (`PPO`, `PPC`, `CPO`, `CPC`) y `EF` más 3 o 4 dígitos. Las solicitudes y préstamos son para periféricos; el historial de mantenimiento corresponde a computadores.

La fuente más fiable del **esquema instalado** es un volcado actual de PostgreSQL. Los SQL históricos de `modules/inventory/migrations/` explican la evolución, pero `inventory.sql` y el `BD.sql` del espacio de trabajo no constituyen por sí solos el esquema final. `schema_recuperado.sql` está vacío en esta revisión.

## Reglas de negocio relevantes

- La próxima fecha de mantenimiento se calcula a seis meses de la fecha realizada, ajustando al último día del mes si es necesario.
- No se crea un nuevo mantenimiento cuando el último del equipo aún está vigente; se corrige el existente desde el historial cuando procede.
- Para registrar mantenimiento son obligatorias la limpieza interna y el cambio de pasta térmica.
- El tablero calcula unidades prestadas de componentes como `unidades totales − unidades disponibles` y clasifica equipos por la próxima fecha de su último mantenimiento.
- Las escrituras de fecha/observaciones e IP al editar un mantenimiento se confirman en una misma transacción.

## Rutas principales

| API | Uso |
| --- | --- |
| `POST /users/login` | Inicio de sesión |
| `GET/POST/PATCH/DELETE /inventory/items` | Consulta y administración de activos (según ruta y rol) |
| `GET/POST/PATCH /inventory/requests` | Solicitudes, entrega, rechazo y devolución |
| `GET/POST/PATCH /inventory/maintenance` | Consulta, registro y edición de mantenimiento |

Las rutas exactas y sus variantes `/:id` se definen en `modules/inventory/inventory.routes.js`; no usar esta tabla como especificación completa de API.

## Verificación y mantenimiento

- Frontend: `npm run lint` y `npm run build` dentro de `client/`.
- Backend: ejecutar las pruebas aplicables con `node --test` y la comprobación de sintaxis para archivos cambiados. La prueba de validación de mantenimiento está en `modules/inventory/maintenance.validation.test.js`.
- Mantener los contratos de API en `docs/api/` y los cambios estructurales de base en una migración nueva; no modificar una migración ya aplicada.

Para instalación, recuperación y pruebas de datos, seguir el [procedimiento de despliegue](DEPLOYMENT_RUNBOOK.md). Los valores operativos aún por completar se enumeran en el [índice de entrega](README.md).
