-- category y equipment_type quedan sustituidos por asset_type.
BEGIN;

ALTER TABLE inventory_items
  ALTER COLUMN asset_type SET NOT NULL;

ALTER TABLE inventory_items
  ADD CONSTRAINT inventory_items_asset_type_check
  CHECK (asset_type IN ('laptop', 'all_in_one', 'tower', 'peripheral'));

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS equipment_type;

COMMIT;
