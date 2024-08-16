CREATE TABLE IF NOT EXISTS kvstore (
    key TEXT PRIMARY KEY,
    value TEXT,
    ttl INTEGER,
    updated_by TEXT,
    last_updated INTEGER
);

CREATE INDEX IF NOT EXISTS idx_kvstore_key ON kvstore(key);
