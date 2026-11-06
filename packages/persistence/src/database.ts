import Database from 'better-sqlite3';

export type Migration = (db: Database.Database) => void;

export function openWriter(
  path: string, applicationId: number, migrations: readonly Migration[], create: boolean,
  verifyIdentity?: (db: Database.Database, initializing: boolean) => void,
): Database.Database {
  const db = new Database(path, { fileMustExist: !create, timeout: 1000 });
  try {
    db.pragma('foreign_keys = ON');
    // Exclusive WAL keeps the file lock for the lifetime of this writer. A
    // second utility process cannot take ownership between transactions.
    db.pragma('locking_mode = EXCLUSIVE');
    db.pragma('synchronous = FULL');
    const migrate = db.transaction(() => {
      const id = db.pragma('application_id', { simple: true });
      const version = Number(db.pragma('user_version', { simple: true }));
      if (id !== applicationId) {
        const empty = !db.prepare('SELECT 1 FROM sqlite_schema LIMIT 1').get();
        if (!create || id !== 0 || version !== 0 || !empty) throw new Error('Unexpected SQLite database type');
        db.pragma(`application_id = ${applicationId}`);
      }
      if (version < 0 || version > migrations.length || (id === applicationId && version === 0)) {
        throw new Error(`Unsupported SQLite schema version ${version}`);
      }
      for (const migration of migrations.slice(version)) migration(db);
      verifyIdentity?.(db, id !== applicationId);
      if (db.prepare('SELECT 1 FROM pragma_foreign_key_check LIMIT 1').get()) {
        throw new Error('SQLite foreign key check failed');
      }
      if (version !== migrations.length) db.pragma(`user_version = ${migrations.length}`);
    });
    // Validate type/version before changing the persistent journal mode.
    // The exclusive connection holds its lock after this transaction commits.
    migrate.exclusive();
    if (db.pragma('journal_mode = WAL', { simple: true }) !== 'wal') throw new Error('SQLite could not enable WAL');
    return db;
  } catch (error) {
    db.close();
    throw new Error(`Cannot open storage at ${path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
