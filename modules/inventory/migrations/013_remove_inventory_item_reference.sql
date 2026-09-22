-- El modelo concentra la referencia comercial del activo.
ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS reference;
