import sharp from 'sharp';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

/** Synthetic image: proves packaged sharp/libvips and tile output, without importing user assets. */
export async function proveImageTiles(directory: string): Promise<void> {
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#283b40' } })
    .png().tile({ size: 256, layout: 'dz' }).toFile(join(directory, 'probe.dz'));
  if (!(await readdir(join(directory, 'probe_files'))).length) throw new Error('No image tiles generated');
}
