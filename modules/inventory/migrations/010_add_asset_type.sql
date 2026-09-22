-- Clasificación única de activos: laptop, all_in_one, tower o peripheral.
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS asset_type VARCHAR(30);
