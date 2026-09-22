-- El estado del inventario se deriva de available_quantity.
-- Los estados de inventory_requests e inventory_loans se conservan porque
-- representan el ciclo de vida de cada solicitud o préstamo.

BEGIN;

DROP INDEX IF EXISTS idx_inventory_items_status;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS status;

COMMIT;
