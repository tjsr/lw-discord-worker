export type KeyVal = {
  key: string;
  value: string;
  ttl: number;
  updated_by: string;
  last_updated: string;
};

const ONE_DAY = 60 * 60 * 24;
const SEVEN_DAYS = ONE_DAY * 7;

export const getKeyval = async (key: string, db: D1Database): Promise<KeyVal|null> => {
  const preparedStatement = db.prepare("SELECT key, value, ttl, updated_by, last_updated FROM kvstore WHERE key = ?;");
  return preparedStatement.bind(key).first<KeyVal>();
};

export const setKeyval = async(key: string, data: object, userId: string, db: D1Database, ttl = SEVEN_DAYS): Promise<D1Result<KeyVal>> => {
  return db.prepare(
    "INSERT INTO kvstore (key, value, ttl, updated_by, last_updated) \
    SELECT CONCAT(key, '.', last_updated), value, ttl, updated_by, last_updated \
    FROM kvstore WHERE key = ?;")
  .bind(key)
  .run<KeyVal>()
  .then((versionResult: D1Result<KeyVal>) => {
    if (versionResult.success) {
      const preparedStatement = db.prepare(
        "INSERT INTO kvstore (key, value, ttl, updated_by, last_updated) \
        VALUES (?, ?, ?, ?, strftime('%Y-%m-%d %H-%M-%S','now')) \
        ON CONFLICT(key) DO UPDATE SET value=excluded.value, ttl=excluded.ttl, updated_by=excluded.updated_by, last_updated=excluded.last_updated;");
      return preparedStatement
        .bind(key, JSON.stringify(data), ttl, userId)
        .run<KeyVal>()
        .then((result) => {
          console.log(`Write ${key} to kvstore: ${result.success}`);
          result.meta.versionUpdateMeta = versionResult.meta;
          return result;
        });
    } else {
      throw new Error(`Failed to update previous version of key ${key}.`);
    }
  });
};
