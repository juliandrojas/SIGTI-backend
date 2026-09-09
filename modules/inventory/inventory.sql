CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'component',
  brand VARCHAR(120),
  reference VARCHAR(120),
  model VARCHAR(120),
  serial_number VARCHAR(120),
  quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(50) NOT NULL DEFAULT 'good',
  location VARCHAR(120) NOT NULL DEFAULT 'bodega',
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_loans (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  requested_by VARCHAR(150) NOT NULL,
  position VARCHAR(120),
  start_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  expected_return_datetime TIMESTAMP WITHOUT TIME ZONE,
  actual_return_datetime TIMESTAMP WITHOUT TIME ZONE,
  pickup_signature TEXT,
  return_signature TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_inventory_loans_item FOREIGN KEY (item_id)
    REFERENCES inventory_items(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_loans_item_id ON inventory_loans(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_loans_status ON inventory_loans(status);
