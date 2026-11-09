import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, lstatSync, openSync, readSync, realpathSync, renameSync, unlinkSync, writeSync } from 'node:fs';
import { join } from 'node:path';

export type OriginalAsset = { hash: string; byteLength: number };

export function assetHash(value: string): string {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('Invalid SHA-256 asset hash');
  return value;
}

function regularFile(path: string): void {
  const entry = lstatSync(path);
  if (!entry.isFile() || entry.nlink !== 1) throw new Error(`Unexpected original asset entry: ${path}`);
}

/** Authority-only byte storage. Caller must hold the world's exclusive writer.
 * Originals are never decoded, modified or evicted here.
 */
export class OriginalAssetStore {
  private readonly folder: string;

  constructor(worldFolder: string) {
    this.folder = realpathSync.native(worldFolder);
    this.directory();
  }

  private directory(): string {
    for (const path of [this.folder, join(this.folder, 'assets'), join(this.folder, 'assets', 'sha256')]) {
      if (!lstatSync(path).isDirectory()) throw new Error(`Unexpected asset directory: ${path}`);
    }
    return join(this.folder, 'assets', 'sha256');
  }

  path(hash: string): string { return join(this.directory(), assetHash(hash)); }

  verify(hash: string): OriginalAsset {
    const path = this.path(hash);
    regularFile(path);
    const input = openSync(path, 'r');
    try {
      const digest = createHash('sha256');
      const buffer = Buffer.allocUnsafe(1024 * 1024);
      let byteLength = 0;
      for (let count; (count = readSync(input, buffer)) > 0;) {
        digest.update(buffer.subarray(0, count));
        byteLength += count;
      }
      if (digest.digest('hex') !== hash) throw new Error(`Original asset hash mismatch: ${hash}`);
      return { hash, byteLength };
    } finally { closeSync(input); }
  }

  /** Stream-copy with bounded memory, flush, then publish without replacing any original.
   * A crash can leave a .tmp or unreferenced original; neither is a database reference.
   */
  ingest(source: string): OriginalAsset {
    regularFile(source);
    const directory = this.directory();
    const temporary = join(directory, `.ingest-${randomUUID()}.tmp`);
    const input = openSync(source, 'r');
    let output: number | undefined;
    try {
      output = openSync(temporary, 'wx');
      const digest = createHash('sha256');
      const buffer = Buffer.allocUnsafe(1024 * 1024);
      let byteLength = 0;
      for (let count; (count = readSync(input, buffer)) > 0;) {
        digest.update(buffer.subarray(0, count));
        for (let offset = 0; offset < count;) offset += writeSync(output, buffer, offset, count - offset);
        byteLength += count;
      }
      fsyncSync(output);
      closeSync(output);
      output = undefined;
      const hash = digest.digest('hex');
      const destination = this.path(hash);
      if (lstatSync(destination, { throwIfNoEntry: false })) {
        // Never replace a duplicate or silently repair a corrupt original.
        this.verify(hash);
      } else {
        // Same-directory atomic publication, serialized by the world's writer.
        renameSync(temporary, destination);
      }
      const verified = this.verify(hash);
      if (verified.byteLength !== byteLength) throw new Error('Original asset size mismatch');
      return verified;
    } finally {
      closeSync(input);
      if (output !== undefined) closeSync(output);
      try { unlinkSync(temporary); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
  }
}
