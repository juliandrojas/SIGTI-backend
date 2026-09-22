# SIGTI — documentación para entrega interna

**Estado:** borrador para revisión de Sistemas y del responsable del servidor.

**Alcance:** aplicación web de Gestión de Activos TI; el cliente Flutter no forma parte de esta entrega.
**Última revisión del código:** 22 de septiembre de 2026.

| Documento | Destinatario | Contenido |
| --- | --- | --- |
| [Manual de usuario](USER_GUIDE.md) | Colaboradores y área de Sistemas | Operación diaria de solicitudes, inventario y mantenimiento. |
| [Guía técnica](TECHNICAL_GUIDE.md) | Desarrollo y soporte TI | Arquitectura, permisos, modelo de datos y reglas de negocio. |
| [Despliegue y recuperación](DEPLOYMENT_RUNBOOK.md) | Administrador del servidor/BD | Migración a PostgreSQL, verificación, respaldos y reversión. |

El mapa de código para desarrolladores está en [la guía de proyecto](../PROJECT_GUIDE.md). Los contratos de API específicos viven en `../api/`. Los archivos SQL de `modules/inventory/migrations/` y el historial Git explican los cambios de esquema; **no sustituyen un respaldo actual de la base en uso**.

## Datos por completar antes de aprobar la entrega

| Dato operativo | Responsable | Estado |
| --- | --- | --- |
| Nombre, sistema operativo y versión de PostgreSQL del servidor | Infraestructura | Pendiente |
| Cifrado TLS/SSL, firewall y acceso de red entre API y PostgreSQL | Infraestructura | Pendiente |
| Dominio definitivo de la API y responsable del despliegue | Sistemas | Pendiente |
| Política de respaldo: frecuencia, retención, destino cifrado y custodio | Empresa | Pendiente |
| Responsable de soporte e incidentes y medio de contacto | Empresa | Pendiente |
| Prueba de restauración y acta de aceptación con recuentos de datos | Sistemas/Infraestructura | Pendiente |

No guardar contraseñas, cadenas de conexión, tokens, respaldos, exportaciones de usuarios ni datos reales de empleados en este repositorio. Registrar esos secretos en el gestor corporativo autorizado.

## Criterio de aprobación

La entrega se aprueba cuando la base restaurada conserva las relaciones entre equipos, técnicos y mantenimientos; se completan las pruebas del procedimiento de [despliegue](DEPLOYMENT_RUNBOOK.md); y la empresa asigna los responsables y política de respaldo indicados arriba. Hasta entonces, este paquete es una guía de preparación, no evidencia de que la migración se haya ejecutado.
