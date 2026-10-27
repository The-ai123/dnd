import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { buildPublicScene, SerialQueue, validatePlayerSelection } from '@dnd/engine';
import { type PrivateSnapshot, type IpcResponse } from '@dnd/contracts';
import { failure, validateWorldRequest } from './ipc-boundary';
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
        if (data.method !== 'request') throw new Error('Unknown engine method');
        const request = validateWorldRequest(data.input, snapshot.publicScene.identity.worldInstanceId);
        if ('ok' in request) result = request;
        else {
          let response: IpcResponse;
          if (request.operation === 'host.snapshot' || request.operation === 'world.snapshot') {
            response = { protocolVersion: 1, requestId: request.requestId, ok: true, result: request.actorWindowRole === 'storyteller'
              ? { type: 'private-snapshot', snapshot } : { type: 'public-snapshot', snapshot: snapshot.publicScene } };
          } else if (request.operation === 'scene.select') {
            try {
              validatePlayerSelection(snapshot.publicScene, request.payload);
              response = { protocolVersion: 1, requestId: request.requestId, ok: true, result: { type: 'acknowledged' } };
            } catch { response = failure(request.requestId, 'INVALID_SELECTION', 'Selection does not belong to the current public scene'); }
          } else response = failure(request.requestId, 'UNSUPPORTED_OPERATION', 'Command handler is not installed');
          result = response;
        }
      }
      process.parentPort?.postMessage({ id: data.id, result });
    } catch (error) {
      process.parentPort?.postMessage({ id: data.id, error: error instanceof Error ? error.message : 'Engine operation failed' });
    }
  });
});
