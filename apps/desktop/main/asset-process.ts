import { mkdir } from 'node:fs/promises';
import { proveImageTiles } from '@dnd/assets';

process.parentPort?.on('message', async ({ data }: { data: { id: number; input: unknown } }) => {
  try {
    if (typeof data.input !== 'string') throw new Error('Missing probe directory');
    await mkdir(data.input, { recursive: true });
    await proveImageTiles(data.input);
    process.parentPort?.postMessage({ id: data.id, result: true });
  } catch (error) {
    process.parentPort?.postMessage({ id: data.id, error: error instanceof Error ? error.message : 'Asset probe failed' });
  }
});
