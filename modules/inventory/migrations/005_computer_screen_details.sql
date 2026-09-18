-- Datos de pantalla provenientes del inventario histórico de equipos.
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS screen_asset_code VARCHAR(80),
  ADD COLUMN IF NOT EXISTS screen_brand VARCHAR(120),
  ADD COLUMN IF NOT EXISTS screen_model VARCHAR(120),
  ADD COLUMN IF NOT EXISTS screen_serial_number VARCHAR(120);
