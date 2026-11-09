import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { OriginalAssetStore, proveImageTiles } from '@dnd/assets';
import { WorldRepository } from '@dnd/persistence';

let root: string;
const opened: WorldRepository[] = [];
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'dnd-assets-')); });
afterEach(() => {
  for (const world of opened.splice(0)) world.close();
  rmSync(root, { recursive: true, force: true });
});
function world(name = 'world'): WorldRepository {
  const repository = WorldRepository.open(join(root, name), randomUUID(), true);
  opened.push(repository);
  return repository;
}
function source(bytes = 'original bytes'): string {
  const path = join(root, `source-${randomUUID()}`);
  writeFileSync(path, bytes);
  return path;
}
function record() {
  return { kind: 'entity', recordId: randomUUID(), version: 0, documentVersion: 1, json: '{}' } as const;
}
function reference(entity: ReturnType<typeof record>) {
  return { kind: entity.kind, recordId: entity.recordId };
}

it('stores exact original bytes by hash, deduplicates and preserves the previous import after source edits', () => {
  const repository = world();
  const input = source('x'.repeat(2 * 1024 * 1024 + 7));
  const asset = repository.importAsset(input);
  const store = new OriginalAssetStore(repository.folder);
  expect(asset).toEqual({ hash: createHash('sha256').update(readFileSync(input)).digest('hex'), byteLength: 2 * 1024 * 1024 + 7 });
  expect(readFileSync(store.path(asset.hash))).toEqual(readFileSync(input));
  expect(repository.importAsset(input)).toEqual(asset);
  expect(readdirSync(join(repository.folder, 'assets/sha256'))).toEqual([asset.hash]);
  writeFileSync(input, 'edited');
  const edited = repository.importAsset(input);
  expect(edited.hash).not.toBe(asset.hash);
  expect(store.verify(asset.hash)).toEqual(asset);
  expect(repository.importAsset(source(''))).toEqual({ hash: createHash('sha256').digest('hex'), byteLength: 0 });
}, 30_000);

it('retains immutable version references through replacement, cache deletion and reopening', async () => {
  const repository = world();
  const first = repository.importAsset(source('first'));
  const second = repository.importAsset(source('second'));
  const entity = record();
  repository.write(entity, [], [first.hash, first.hash]);
  expect(() => repository.write(entity, [], [second.hash])).toThrow(/immutable/);
  repository.write({ ...entity, version: 1 }, [], [second.hash]);
  expect(repository.assetsFor(reference(entity))).toEqual([second.hash]);
  expect(repository.assetsFor(reference(entity), 0)).toEqual([first.hash]);
  await proveImageTiles(join(repository.folder, 'derived'));
  rmSync(join(repository.folder, 'derived'), { recursive: true });
  repository.close();
  opened.pop();
  const reopened = WorldRepository.open(repository.folder, repository.worldInstanceId);
  opened.push(reopened);
  expect(reopened.assetsFor(reference(entity), 0)).toEqual([first.hash]);
  expect(reopened.referencedAssets()).toEqual([first, second].sort((a, b) => a.hash.localeCompare(b.hash)));
  expect(new OriginalAssetStore(reopened.folder).verify(first.hash)).toEqual(first);
  mkdirSync(join(repository.folder, 'derived'));
  await proveImageTiles(join(repository.folder, 'derived'));
}, 30_000);

it('rejects unpublished, foreign-world and corrupt assets without changing records or references', () => {
  const first = world('one');
  const second = world('two');
  const input = source();
  const asset = first.importAsset(input);
  const entity = record();
  expect(() => second.write(entity, [], [asset.hash])).toThrow(/not registered/);
  expect(second.get(reference(entity))).toBeUndefined();
  expect(() => first.write(entity, [], ['0'.repeat(64)])).toThrow(/not registered/);
  const path = new OriginalAssetStore(first.folder).path(asset.hash);
  rmSync(path);
  expect(() => first.write(entity, [], [asset.hash])).toThrow();
  expect(first.get(reference(entity))).toBeUndefined();
  // A retry can republish missing bytes, but cannot silently overwrite corrupt bytes.
  first.importAsset(input);
  writeFileSync(path, 'corrupt');
  expect(() => first.importAsset(input)).toThrow(/hash mismatch/);
  expect(() => first.write(entity, [], [asset.hash])).toThrow(/hash mismatch/);
  expect(first.get(reference(entity))).toBeUndefined();
  expect(first.referencedAssets()).toEqual([]);
  expect(readdirSync(join(first.folder, 'assets/sha256'))).toEqual([asset.hash]);
  expect(() => new OriginalAssetStore(first.folder).path('../escape')).toThrow(/Invalid/);
}, 30_000);

it('rolls asset references back together with failed record/link writes', () => {
  const repository = world();
  const asset = repository.importAsset(source());
  const entity = record();
  expect(() => repository.write(entity, [{ kind: 'campaign', recordId: randomUUID() }], [asset.hash])).toThrow(/FOREIGN KEY/);
  expect(repository.get(reference(entity))).toBeUndefined();
  expect(repository.assetsFor(reference(entity), 0)).toEqual([]);
  expect(repository.referencedAssets()).toEqual([]);
  // The failed version claim must also roll back.
  repository.write(entity);
  expect(repository.assetsFor(reference(entity))).toEqual([]);
}, 30_000);

it('recovers a process exit after publication and ignores unfinished staged files', () => {
  const repository = world();
  const input = source();
  const hash = createHash('sha256').update(readFileSync(input)).digest('hex');
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import { OriginalAssetStore } from ${JSON.stringify(new URL('../../packages/assets/src/originals.ts', import.meta.url).href)};
    new OriginalAssetStore(process.argv[1]).ingest(process.argv[2]);
    process.exit(42);
  `, repository.folder, input], { encoding: 'utf8' });
  expect(child.status, child.stderr).toBe(42);
  expect(existsSync(new OriginalAssetStore(repository.folder).path(hash))).toBe(true);
  expect(repository.originalAsset(hash)).toBeUndefined();
  expect(() => repository.write(record(), [], [hash])).toThrow(/not registered/);
  writeFileSync(join(repository.folder, 'assets/sha256/.ingest-interrupted.tmp'), 'partial');
  const retried = repository.importAsset(input);
  expect(retried.hash).toBe(hash);
  const entity = record();
  repository.write(entity, [], [hash]);
  expect(repository.referencedAssets()).toEqual([retried]);
}, 30_000);

it('never registers a reference when a process exits before rename publication', () => {
  const repository = world();
  const input = source();
  const hash = createHash('sha256').update(readFileSync(input)).digest('hex');
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import fs from 'node:fs';
    import { syncBuiltinESMExports } from 'node:module';
    import { OriginalAssetStore } from ${JSON.stringify(new URL('../../packages/assets/src/originals.ts', import.meta.url).href)};
    fs.renameSync = () => process.exit(42);
    syncBuiltinESMExports();
    new OriginalAssetStore(process.argv[1]).ingest(process.argv[2]);
  `, repository.folder, input], { encoding: 'utf8' });
  expect(child.status, child.stderr).toBe(42);
  expect(existsSync(new OriginalAssetStore(repository.folder).path(hash))).toBe(false);
  expect(readdirSync(join(repository.folder, 'assets/sha256'))).toHaveLength(1);
  expect(repository.originalAsset(hash)).toBeUndefined();
  expect(() => repository.write(record(), [], [hash])).toThrow(/not registered/);
  const asset = repository.importAsset(input);
  repository.write(record(), [], [hash]);
  expect(repository.referencedAssets()).toEqual([asset]);
}, 30_000);

it('rejects linked internal asset directories and never writes through them', () => {
  const repository = world();
  const storePath = join(repository.folder, 'assets/sha256');
  const parked = join(repository.folder, 'assets/parked');
  renameSync(storePath, parked);
  const outside = join(root, 'outside');
  mkdirSync(outside);
  symlinkSync(outside, storePath, process.platform === 'win32' ? 'junction' : 'dir');
  expect(() => repository.importAsset(source())).toThrow(/Unexpected asset directory/);
  expect(readdirSync(outside)).toEqual([]);
  // Remove only the junction, before the test cleanup recurses through the root.
  rmSync(storePath);
  renameSync(parked, storePath);
}, 30_000);

it('upgrades a B02 world without losing records and freezes its existing empty asset version', () => {
  const repository = world();
  const entity = record();
  repository.write(entity);
  repository.close();
  opened.pop();
  const legacy = new Database(join(repository.folder, 'world.sqlite'));
  legacy.exec('DROP TABLE record_asset_references; DROP TABLE record_asset_versions; DROP TABLE original_assets; PRAGMA user_version = 2');
  legacy.close();
  const upgraded = WorldRepository.open(repository.folder, repository.worldInstanceId);
  opened.push(upgraded);
  expect(upgraded.schemaVersion).toBe(3);
  expect(upgraded.get(reference(entity))).toEqual(entity);
  const asset = upgraded.importAsset(source());
  expect(() => upgraded.write(entity, [], [asset.hash])).toThrow(/immutable/);
  upgraded.write({ ...entity, version: 1 }, [], [asset.hash]);
  expect(upgraded.assetsFor(reference(entity), 0)).toEqual([]);
}, 30_000);
