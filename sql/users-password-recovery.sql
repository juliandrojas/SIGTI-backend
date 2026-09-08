ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS users_reset_token_hash_idx
ON users (reset_token_hash);
