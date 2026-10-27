import Database from 'better-sqlite3';

/** A03 compatibility database only. Product schemas/migrations belong to B02. */
export async function proveSqliteBackup(databasePath: string, backupPath: string): Promise<string> {
  const db = new Database(databasePath);
  try {
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = FULL');
    db.exec('CREATE TABLE IF NOT EXISTS compatibility_probe (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
    db.prepare('INSERT OR REPLACE INTO compatibility_probe VALUES (1, ?)').run('durable');
    await db.backup(backupPath);
    const backup = new Database(backupPath, { readonly: true });
    try {
      const row = backup.prepare('SELECT value FROM compatibility_probe WHERE id = 1').get() as { value: string };
      if (row.value !== 'durable' || backup.pragma('integrity_check', { simple: true }) !== 'ok') {
        throw new Error('SQLite backup verification failed');
      }
    } finally { backup.close(); }
    return (db.prepare('SELECT sqlite_version() AS version').get() as { version: string }).version;
  } finally { db.close(); }
}
