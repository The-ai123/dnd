import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { CatalogRepository, WorldRepository, type StoredRecord } from '@dnd/persistence';
import { openWriter } from '../../packages/persistence/src/database';

let root: string;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'dnd-storage-')); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

it('registers and reopens isolated worlds with identical internal IDs and local foreign keys', () => {
  const appData = join(root, 'app');
  const catalog = CatalogRepository.open(appData);
  const first = WorldRepository.open(join(root, 'one'), randomUUID(), true);
  const second = WorldRepository.open(join(root, 'two'), randomUUID(), true);
  const campaign = { kind: 'campaign', recordId: randomUUID() } as const;
  const entity = { kind: 'entity', recordId: randomUUID() } as const;
  const record: StoredRecord = { ...entity, version: 0, documentVersion: 1, json: '{"name":"Original"}' };
  try {
    catalog.registerWorld(first, 'One');
    catalog.registerWorld(first, 'One');
    catalog.registerWorld(second, 'Two');
    first.write({ ...campaign, version: 0, documentVersion: 1, json: '{}' });
    first.write(record, [campaign]);
    second.write({ ...record, json: '{"name":"Other world"}' });
    expect(() => second.write({ ...record, version: 1 }, [campaign])).toThrow(/FOREIGN KEY/);
    expect(second.get(entity)).toMatchObject({ version: 0, json: '{"name":"Other world"}' });
    expect(first.linksFrom(entity)).toEqual([campaign]);
    expect(second.linksFrom(entity)).toEqual([]);
    expect(() => first.write({ ...record, json: '{' })).toThrow(/json_valid/);
    expect(first.get(entity)).toEqual(record);
    expect(existsSync(join(first.folder, 'assets', 'sha256'))).toBe(true);
    expect(existsSync(join(first.folder, 'derived'))).toBe(true);
    expect(existsSync(join(first.folder, 'manifests', 'world.json'))).toBe(true);
  } finally {
    first.close();
    second.close();
    catalog.close();
  }
  const reopened = CatalogRepository.open(appData);
  try {
    expect(reopened.listWorlds().map(world => world.worldInstanceId)).toEqual([first.worldInstanceId, second.worldInstanceId]);
    const world = reopened.openWorld(first.worldInstanceId);
    try { expect(world.get(entity)).toEqual(record); }
    finally { world.close(); }
    expect(() => WorldRepository.open(first.folder, second.worldInstanceId)).toThrow(/manifest/);
  } finally { reopened.close(); }
}, 30_000);

it('retains the writer lock between transactions and recovers provisioning with the same identity', () => {
  const path = join(root, 'world');
  const id = randomUUID();
  const world = WorldRepository.open(path, id, true);
  try { expect(() => WorldRepository.open(path, id)).toThrow(/locked/); }
  finally { world.close(); }
  rmSync(join(path, 'manifests', 'world.json'));
  expect(() => WorldRepository.open(path, randomUUID(), true)).toThrow(/identity mismatch/);
  WorldRepository.open(path, id, true).close();
  WorldRepository.open(path, id).close();
}, 30_000);

it('upgrades a version-one world in place and refuses a future schema', () => {
  const id = randomUUID();
  const world = WorldRepository.open(root, id, true);
  const record = { kind: 'campaign', recordId: randomUUID(), version: 0, documentVersion: 1, json: '{}' } as const;
  world.write(record);
  world.close();
  const path = join(root, 'world.sqlite');
  const legacy = new Database(path);
  legacy.exec('DROP TABLE record_asset_references; DROP TABLE record_asset_versions; DROP TABLE original_assets; DROP TABLE record_links; PRAGMA user_version = 1');
  legacy.close();
  const upgraded = WorldRepository.open(root, id);
  try {
    expect(upgraded.schemaVersion).toBe(3);
    expect(upgraded.get({ kind: record.kind, recordId: record.recordId })).toEqual(record);
  } finally { upgraded.close(); }
  const future = new Database(path);
  future.pragma('user_version = 999');
  future.close();
  expect(() => WorldRepository.open(root, id)).toThrow(/Unsupported SQLite schema version 999/);
}, 30_000);

it('rolls back schema changes when the migration process exits before commit', () => {
  const path = join(root, 'interrupted.sqlite');
  const applicationId = 1234;
  const initial = (db: Database.Database) => db.exec("CREATE TABLE original (name TEXT); INSERT INTO original VALUES ('preserved')");
  openWriter(path, applicationId, [initial], true).close();
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import { openWriter } from ${JSON.stringify(new URL('../../packages/persistence/src/database.ts', import.meta.url).href)};
    openWriter(process.argv[1], ${applicationId}, [() => {}, db => {
      db.exec('CREATE TABLE upgraded (value TEXT); DROP TABLE original');
      process.exit(42);
    }], false);
  `, path], { encoding: 'utf8' });
  expect(child.status, child.stderr).toBe(42);
  const db = openWriter(path, applicationId, [initial], false);
  try {
    expect(db.pragma('user_version', { simple: true })).toBe(1);
    expect(db.prepare('SELECT name FROM original').pluck().get()).toBe('preserved');
    expect(db.prepare("SELECT name FROM sqlite_schema WHERE name = 'upgraded'").get()).toBeUndefined();
  } finally { db.close(); }
  const retry = openWriter(path, applicationId, [initial, db => db.exec('CREATE TABLE upgraded (value TEXT)')], false);
  try { expect(retry.pragma('user_version', { simple: true })).toBe(2); }
  finally { retry.close(); }
});
