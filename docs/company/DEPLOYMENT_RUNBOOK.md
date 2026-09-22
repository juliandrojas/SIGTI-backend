# Instalación, migración y recuperación — SIGTI

**Estado:** procedimiento propuesto; no registra una migración ya ejecutada. Requiere un PostgreSQL propio en el servidor, accesible de forma segura desde la API, y aprobación del administrador de infraestructura. Todos los comandos que puedan modificar datos se prueban primero en una base aislada.

## 1. Preparar el destino

1. Registrar versión de PostgreSQL, sistema operativo, nombre de la base, responsable y ventana de cambio en el [índice de entrega](README.md).
2. Crear una **base nueva y dedicada** para SIGTI, con usuario de aplicación de mínimos privilegios y mecanismo de respaldo. No restaurar encima de otra base empresarial.
3. Restringir el puerto de PostgreSQL por firewall; permitir solo el origen de la API. Confirmar si la conexión tendrá TLS/SSL. El código actual en `config/db.js` solicita SSL siempre; si el servidor no lo admite, se debe adaptar y probar esa configuración **antes** de cambiar la conexión.
4. Preparar las variables del backend en el gestor de secretos: `DATABASE_URL` (o `SUPABASE_CONNECTION`), `JWT_SECRET`, `JWT_EXPIRES_IN` y las demás que requiera el despliegue. Para el frontend, configurar `VITE_API_URL` con la URL definitiva de la API. La URL predeterminada del código aún señala al backend actual en Vercel.
5. Confirmar quién administra la aplicación web y la API. Mover solo la base de datos no mueve automáticamente el frontend ni el backend.

No colocar cadenas de conexión ni contraseñas en Git, documentación, tickets públicos o historiales de comandos compartidos.

## 2. Exportar la base de origen

Programar una ventana de cambio y detener o restringir las escrituras de la aplicación antes del volcado final. Tomar primero un respaldo completo de seguridad según la política de la empresa. Para transferir **las tablas de aplicación del esquema `public`**, usar un `pg_dump` compatible con la versión del servidor de origen. Ejemplo en PowerShell, suponiendo que un operador ya cargó las conexiones en variables de entorno protegidas:

```powershell
pg_dump --dbname "$env:SIGTI_ORIGIN_DB" --schema=public --format=custom --file="sigti-public.dump"
pg_restore --list "sigti-public.dump"
```

El archivo contiene estructura, datos, índices y secuencias de `public`, incluidos `users`, `inventory_items` y `maintenance_records`. **Contiene información personal y hashes de contraseñas**: cifrarlo, restringir su acceso y no subirlo a GitHub. El volcado de `public` no equivale a respaldar todos los servicios internos de Supabase (por ejemplo, Storage o Auth si se usan); confirmar si esta instalación depende de ellos.

## 3. Restaurar primero en ensayo

La primera restauración debe hacerse en una **base nueva y dedicada de ensayo**. El siguiente comando contiene `--clean`, que elimina los objetos incluidos en el volcado antes de recrearlos: **nunca ejecutarlo contra una base con información que deba conservarse**.

```powershell
pg_restore --dbname "$env:SIGTI_TEST_DB" --clean --if-exists --no-owner --no-acl --exit-on-error --single-transaction "sigti-public.dump"
```

Revisar errores de roles, extensiones, funciones, políticas y permisos. Un volcado limitado a `public` puede depender de objetos externos al esquema: corregir esas dependencias de forma documentada, no ignorar errores. PostgreSQL documenta tanto el [volcado](https://www.postgresql.org/docs/current/app-pgdump.html) como la [restauración](https://www.postgresql.org/docs/current/app-pgrestore.html); Supabase describe consideraciones adicionales al salir de su plataforma en su [guía de restauración](https://supabase.com/docs/guides/self-hosting/restore-from-platform).

No ejecutar el script de importación de usuarios sobre una restauración que ya incluye `users`: podría crear usuarios distintos y romper la correspondencia de `technician_id`. Si se decide reconstruir usuarios con ese script, hace falta un plan de remapeo por `username` y de equipos por `asset_code` antes de importar mantenimientos.

## 4. Verificar datos y funciones

Ejecutar las siguientes consultas **tanto en origen como en ensayo**, registrar fecha y resultados y comparar. No imprimir nombres ni otros datos personales en el acta:

```sql
SELECT 'roles' AS tabla, count(*) FROM public.roles
UNION ALL SELECT 'users', count(*) FROM public.users
UNION ALL SELECT 'inventory_items', count(*) FROM public.inventory_items
UNION ALL SELECT 'inventory_requests', count(*) FROM public.inventory_requests
UNION ALL SELECT 'inventory_loans', count(*) FROM public.inventory_loans
UNION ALL SELECT 'maintenance_records', count(*) FROM public.maintenance_records;

SELECT count(*) AS mantenimientos_sin_equipo
FROM public.maintenance_records AS m
LEFT JOIN public.inventory_items AS i ON i.id = m.item_id
WHERE i.id IS NULL;

SELECT count(*) AS mantenimientos_sin_tecnico_referenciado
FROM public.maintenance_records AS m
LEFT JOIN public.users AS u ON u.id = m.technician_id
WHERE m.technician_id IS NOT NULL AND u.id IS NULL;
```

Ambas consultas de huérfanos deben devolver `0`. Comparar además una muestra autorizada de códigos EF, fechas y técnicos de mantenimiento. Probar en la aplicación: inicio de sesión de ambos roles, inventario, solicitud, entrega/devolución, registro de equipo y edición de IP/fecha/observaciones de un **equipo de ensayo**.

## 5. Corte a producción

1. Confirmar que ensayo y restauración fueron aceptados y que existe respaldo recuperable del origen.
2. Mantener las escrituras detenidas; generar el **volcado final** para no perder cambios realizados después del ensayo.
3. Restaurar ese volcado en la base definitiva **nueva y vacía**, repetir las verificaciones y documentar los recuentos.
4. Cambiar la variable de conexión de la API al servidor PostgreSQL y desplegarla. Verificar que el frontend apunte a esa API. Ejecutar las pruebas funcionales con las cuentas autorizadas.
5. Registrar hora del cambio, responsables, versiones/commits y resultados. Conservar el origen y el respaldo final durante el periodo de reversión acordado, sin permitir escrituras simultáneas en ambas bases.

## 6. Respaldo y recuperación continua

- Definir frecuencia, retención, almacenamiento cifrado, custodio y alerta por fallo antes de aceptar el servicio. Un respaldo sin prueba de restauración no acredita recuperabilidad.
- Hacer respaldos automáticos del PostgreSQL del servidor y verificar periódicamente su restauración en una base aislada; conservar evidencias sin datos personales en la documentación.
- Si el corte falla **antes de permitir escrituras en el destino**, revertir la variable de conexión de la API al origen y verificar el acceso. Si ya hubo escrituras en el destino, detenerlas y reconciliar los cambios antes de revertir; cambiar solo la URL causaría pérdida de información.
- No usar `BD.sql` ni `schema_recuperado.sql` como sustitutos del volcado actual: el primero no refleja el modelo final y el segundo está vacío en esta revisión.
