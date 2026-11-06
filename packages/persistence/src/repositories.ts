import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { idSchema, recordReferenceSchema, revisionSchema } from '@dnd/contracts';
import type Database from 'better-sqlite3';
import { openWriter, type Migration } from './database';
import { checkStorageEntry, localDirectory } from './layout';

type RecordReference = ReturnType<typeof recordReferenceSchema.parse>;
export type StoredRecord = RecordReference & { version: number; documentVersion: number; json: string };
export type RegisteredWorld = { worldInstanceId: string; folder: string; name: string };

const catalogId = 0x444e4443; // DNDC
const worldId = 0x444e4457; // DNDW
const catalogMigrations: readonly Migration[] = [
  db => db.exec(`
    CREATE TABLE worlds (
      worldInstanceId TEXT PRIMARY KEY,
      folder TEXT NOT NULL,
      folderKey TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0)
    ) STRICT;
  `),
];
const worldMigrations: readonly Migration[] = [
  db => db.exec(`
    CREATE TABLE world_identity (
      singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
      worldInstanceId TEXT NOT NULL UNIQUE
    ) STRICT;
    CREATE TABLE records (
      kind TEXT NOT NULL,
      recordId TEXT NOT NULL,
      version INTEGER NOT NULL CHECK (version BETWEEN 0 AND 9007199254740991),
      documentVersion INTEGER NOT NULL CHECK (documentVersion BETWEEN 1 AND 9007199254740991),
      json TEXT NOT NULL CHECK (json_valid(json)),
      PRIMARY KEY (kind, recordId)
    ) STRICT;
  `),
  db => db.exec(`
    CREATE TABLE record_links (
      sourceKind TEXT NOT NULL,
      sourceId TEXT NOT NULL,
      targetKind TEXT NOT NULL,
      targetId TEXT NOT NULL,
      PRIMARY KEY (sourceKind, sourceId, targetKind, targetId),
      FOREIGN KEY (sourceKind, sourceId) REFERENCES records ON DELETE CASCADE,
      FOREIGN KEY (targetKind, targetId) REFERENCES records
    ) STRICT;
    CREATE INDEX record_links_target ON record_links (targetKind, targetId);
  `),
];

function databasePath(folder: string, name: string): string {
  const path = join(folder, name);
  for (const suffix of ['', '-wal', '-shm', '-journal']) checkStorageEntry(path + suffix);
  return path;
}

function verifyManifest(path: string, expectedId: string, provision: boolean): boolean {
  checkStorageEntry(path);
  let raw: string;
  try { raw = readFileSync(path, 'utf8'); }
  catch (error) {
    if (!provision || (error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return false;
  }
  const manifest = JSON.parse(raw) as { formatVersion?: unknown; worldInstanceId?: unknown } | null;
  if (manifest?.formatVersion !== 1 || manifest.worldInstanceId !== expectedId) {
    throw new Error(`Unexpected world manifest: ${path}`);
  }
  return true;
}

export class WorldRepository {
  private constructor(private readonly db: Database.Database, readonly worldInstanceId: string, readonly folder: string) {}

  static open(path: string, expectedId: string, provision = false): WorldRepository {
    idSchema.parse(expectedId);
    const folder = localDirectory(path, provision);
    for (const directory of ['assets', 'derived', 'manifests']) checkStorageEntry(join(folder, directory), true);
    checkStorageEntry(join(folder, 'assets', 'sha256'), true);
    const manifest = join(folder, 'manifests', 'world.json');
    const hasManifest = verifyManifest(manifest, expectedId, provision);
    const db = openWriter(databasePath(folder, 'world.sqlite'), worldId, worldMigrations, provision && !hasManifest, (writer, initializing) => {
      if (initializing) writer.prepare('INSERT INTO world_identity VALUES (1, ?)').run(expectedId);
      const identity = writer.prepare('SELECT worldInstanceId FROM world_identity WHERE singleton = 1').pluck().get();
      if (identity !== expectedId) throw new Error(`World identity mismatch at ${folder}`);
    });
    try {
      if (provision) {
        for (const directory of ['assets/sha256', 'derived', 'manifests']) mkdirSync(join(folder, directory), { recursive: true });
      }
      if (!hasManifest) {
        const temporary = join(folder, 'manifests', `.world-${randomUUID()}.tmp`);
        try {
          writeFileSync(temporary, JSON.stringify({ formatVersion: 1, worldInstanceId: expectedId }) + '\n', { flag: 'wx', flush: true });
          renameSync(temporary, manifest);
        } finally { rmSync(temporary, { force: true }); }
      }
      return new WorldRepository(db, expectedId, folder);
    } catch (error) {
      db.close();
      throw error;
    }
  }

  get schemaVersion(): number { return Number(this.db.pragma('user_version', { simple: true })); }

  get(reference: RecordReference): StoredRecord | undefined {
    return this.db.prepare('SELECT * FROM records WHERE kind = @kind AND recordId = @recordId')
      .get(recordReferenceSchema.parse(reference)) as StoredRecord | undefined;
  }

  linksFrom(reference: RecordReference): RecordReference[] {
    return this.db.prepare(`
      SELECT targetKind AS kind, targetId AS recordId FROM record_links
      WHERE sourceKind = @kind AND sourceId = @recordId ORDER BY targetKind, targetId
    `).all(recordReferenceSchema.parse(reference)) as RecordReference[];
  }

  write(record: StoredRecord, links: readonly RecordReference[] = []): void {
    recordReferenceSchema.parse({ kind: record.kind, recordId: record.recordId });
    revisionSchema.parse(record.version);
    revisionSchema.min(1).parse(record.documentVersion);
    const targets = links.map(link => recordReferenceSchema.parse(link));
    this.db.transaction(() => {
      this.db.prepare(`
        INSERT INTO records (kind, recordId, version, documentVersion, json)
        VALUES (@kind, @recordId, @version, @documentVersion, @json)
        ON CONFLICT (kind, recordId) DO UPDATE SET
          version = excluded.version, documentVersion = excluded.documentVersion, json = excluded.json
      `).run(record);
      this.db.prepare('DELETE FROM record_links WHERE sourceKind = ? AND sourceId = ?').run(record.kind, record.recordId);
      const insert = this.db.prepare('INSERT INTO record_links VALUES (?, ?, ?, ?)');
      for (const target of targets) insert.run(record.kind, record.recordId, target.kind, target.recordId);
    })();
  }

  close(): void { this.db.close(); }
}

export class CatalogRepository {
  private constructor(private readonly db: Database.Database, readonly folder: string) {}

  static open(path: string): CatalogRepository {
    const folder = localDirectory(path, true);
    return new CatalogRepository(openWriter(databasePath(folder, 'catalog.sqlite'), catalogId, catalogMigrations, true), folder);
  }

  get schemaVersion(): number { return Number(this.db.pragma('user_version', { simple: true })); }

  listWorlds(): RegisteredWorld[] {
    return this.db.prepare('SELECT worldInstanceId, folder, name FROM worlds ORDER BY name, worldInstanceId').all() as RegisteredWorld[];
  }

  registerWorld(world: WorldRepository, name: string): void {
    // Re-registering the same identity and canonical folder is safe after a
    // crash between provisioning the world and committing its catalog row.
    const folderKey = process.platform === 'win32' ? world.folder.toLowerCase() : world.folder;
    const result = this.db.prepare(`
      INSERT INTO worlds VALUES (?, ?, ?, ?)
      ON CONFLICT (worldInstanceId) DO UPDATE SET name = excluded.name
      WHERE worlds.folderKey = excluded.folderKey
    `).run(world.worldInstanceId, world.folder, folderKey, name);
    if (result.changes !== 1) throw new Error('World identity is already registered at another folder');
  }

  openWorld(worldInstanceId: string): WorldRepository {
    const folder = this.db.prepare('SELECT folder FROM worlds WHERE worldInstanceId = ?').pluck()
      .get(idSchema.parse(worldInstanceId)) as string | undefined;
    if (folder === undefined) throw new Error('World is not registered');
    return WorldRepository.open(folder, worldInstanceId);
  }

  close(): void { this.db.close(); }
}
