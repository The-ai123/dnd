import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { buildPublicScene, SerialQueue, validatePlayerSelection } from '@dnd/engine';
import { playerSelectionSchema, type PrivateSnapshot } from '@dnd/contracts';
import { proveSqliteBackup } from '@dnd/persistence';

const queue = new SerialQueue();
let snapshot: PrivateSnapshot | undefined;
process.parentPort?.on('message', ({ data }: { data: { id: number; method: string; input?: unknown } }) => {
  void queue.run(async () => {
    try {
      let result: unknown;
      if (data.method === 'initialize') {
        if (typeof data.input !== 'string') throw new Error('Missing probe directory');
        await mkdir(data.input, { recursive: true });
        const sqlite = await proveSqliteBackup(join(data.input, 'probe.sqlite'), join(data.input, 'backup.sqlite'));
        const identity = { worldInstanceId: randomUUID(), sceneEpoch: 1, revision: 0, context: 'live' as const };
        snapshot = {
          publicScene: buildPublicScene(identity, [
            { id: randomUUID(), publicName: 'Party adventurer', visible: true, party: true, hp: 18, maxHp: 24, x: 150, y: 150, privateNotes: 'Private character note' },
            { id: randomUUID(), publicName: 'Visible creature', visible: true, party: false, hp: 9, maxHp: 12, x: 350, y: 240, privateNotes: 'Secret tactics' },
            { id: randomUUID(), publicName: 'Hidden creature', visible: false, party: false, hp: 30, maxHp: 30, x: 450, y: 350, privateNotes: 'Never transmitted to players' },
          ]),
          diagnostics: { engine: 'ready', sqlite, backupVerified: true, imageTilesVerified: false },
          privateNotes: 'Development fixture. No campaign is open.',
        };
        result = snapshot;
      } else {
        if (!snapshot) throw new Error('Engine is not ready');
        if (data.method === 'privateSnapshot') result = snapshot;
        else if (data.method === 'publicSnapshot') result = snapshot.publicScene;
        else if (data.method === 'select') validatePlayerSelection(snapshot.publicScene, playerSelectionSchema.parse(data.input));
        else throw new Error('Unknown engine method');
      }
      process.parentPort?.postMessage({ id: data.id, result });
    } catch (error) {
      process.parentPort?.postMessage({ id: data.id, error: error instanceof Error ? error.message : 'Engine operation failed' });
    }
  });
});
