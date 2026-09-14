CREATE TABLE IF NOT EXISTS inventory_requests (
  id SERIAL PRIMARY KEY, item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  requester_id INTEGER NOT NULL REFERENCES users(id), requested_by VARCHAR(150) NOT NULL,
  position VARCHAR(120) NOT NULL, quantity INTEGER NOT NULL CHECK (quantity > 0),
  request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('temporary_loan','permanent_replacement')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','rejected','returned')),
  expected_return_datetime TIMESTAMP, previous_component_received BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by INTEGER REFERENCES users(id), reviewed_at TIMESTAMP, rejection_reason TEXT, notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_requests_status ON inventory_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_requests_requester ON inventory_requests(requester_id);
