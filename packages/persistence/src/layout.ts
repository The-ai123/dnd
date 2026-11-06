import { execFileSync } from 'node:child_process';
import { lstatSync, mkdirSync, realpathSync } from 'node:fs';
import { parse, resolve } from 'node:path';

export function localDirectory(path: string, create: boolean): string {
  const target = resolve(path);
  if (process.platform === 'win32' && !/^[a-z]:\\$/i.test(parse(target).root)) {
    throw new Error(`Storage requires a local fixed drive: ${path}`);
  }
  // Inspect the nearest existing ancestor before creating any directories.
  let ancestor = target;
  while (!lstatSync(ancestor, { throwIfNoEntry: false })) {
    const parent = resolve(ancestor, '..');
    if (parent === ancestor) throw new Error(`Storage drive is unavailable: ${path}`);
    ancestor = parent;
  }
  const realAncestor = realpathSync.native(ancestor);
  if (process.platform === 'win32') {
    const root = parse(realAncestor).root;
    if (!/^[a-z]:\\$/i.test(root)) throw new Error(`Storage requires a local fixed drive: ${path}`);
    let driveType: string;
    try {
      driveType = execFileSync('powershell.exe', [
        '-NoProfile', '-NonInteractive', '-Command', '[int]([System.IO.DriveInfo]::new($env:DND_STORAGE_DRIVE).DriveType)',
      ], { env: { ...process.env, DND_STORAGE_DRIVE: root }, encoding: 'utf8', timeout: 5000, windowsHide: true }).trim();
    } catch (error) {
      throw new Error(`Could not verify the local storage drive for ${path}`, { cause: error });
    }
    if (driveType !== '3') throw new Error(`Storage requires a local fixed drive: ${path}`);
  }
  if (create) mkdirSync(target, { recursive: true });
  return realpathSync.native(target);
}

export function checkStorageEntry(path: string, directory = false): void {
  const entry = lstatSync(path, { throwIfNoEntry: false });
  if (entry && (directory ? !entry.isDirectory() : !entry.isFile() || entry.nlink !== 1)) {
    throw new Error(`Unexpected storage entry: ${path}`);
  }
}
