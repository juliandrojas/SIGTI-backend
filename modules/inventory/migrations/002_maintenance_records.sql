ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS last_maintenance_at DATE,
  ADD COLUMN IF NOT EXISTS next_maintenance_at DATE;

CREATE TABLE IF NOT EXISTS maintenance_records (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  performed_at DATE NOT NULL,
  next_due_date DATE NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_item ON maintenance_records(item_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_due ON maintenance_records(next_due_date);
