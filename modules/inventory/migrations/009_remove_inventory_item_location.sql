-- La ubicación física no se gestiona en SIGTI; el área se conserva por separado.

BEGIN;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS location;

COMMIT;
