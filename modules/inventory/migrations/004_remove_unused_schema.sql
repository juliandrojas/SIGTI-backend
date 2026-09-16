-- Limpieza del esquema obsoleto de SIGTI.
-- Esta migración es irreversible para los datos de las tablas eliminadas;
-- conservar un respaldo antes de ejecutarla en cualquier entorno compartido.

BEGIN;

DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS maintenances;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS last_maintenance_at,
  DROP COLUMN IF EXISTS next_maintenance_at;

ALTER TABLE inventory_loans
  DROP COLUMN IF EXISTS pickup_signature;

ALTER TABLE users
  DROP COLUMN IF EXISTS reset_token_hash,
  DROP COLUMN IF EXISTS reset_token_expires_at;

COMMIT;
