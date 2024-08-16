CREATE TABLE IF NOT EXISTS kvstore (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT
);

CREATE INDEX IF NOT EXISTS idx_kvstore_key ON kvstore(key);
