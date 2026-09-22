-- Estos campos nunca recibieron datos y no participan en la aplicación.
-- La eliminación es irreversible; se validó previamente que las cuatro columnas
-- estuvieran vacías en producción.

BEGIN;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS screen_asset_code,
  DROP COLUMN IF EXISTS screen_brand,
  DROP COLUMN IF EXISTS screen_model,
  DROP COLUMN IF EXISTS screen_serial_number;

COMMIT;
