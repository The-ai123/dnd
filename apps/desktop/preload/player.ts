import { contextBridge, ipcRenderer } from 'electron';
import { channels, playerRequestSchema, responseSchema, type PlayerBridge, type PlayerSelection, type IpcRequest } from '@dnd/contracts';

async function request(input: IpcRequest) {
  const parsed = playerRequestSchema.parse(input);
  const response = responseSchema.parse(await ipcRenderer.invoke(channels.playerRequest, parsed));
  if (!response.ok) throw new Error(response.error.message);
  if (response.requestId !== parsed.requestId) throw new Error('Mismatched IPC response');
  return response.result;
}

const bridge: PlayerBridge = Object.freeze({
  snapshot: async () => {
    const result = await request({ protocolVersion: 1, requestId: crypto.randomUUID(), actorWindowRole: 'player', operation: 'host.snapshot' });
    if (result.type !== 'public-snapshot') throw new Error('Invalid snapshot response');
    return result.snapshot;
  },
  select: async (input: PlayerSelection) => {
    await request({ protocolVersion: 1, requestId: crypto.randomUUID(), actorWindowRole: 'player', operation: 'scene.select', worldInstanceId: input.identity.worldInstanceId, payload: input });
  },
});
contextBridge.exposeInMainWorld('player', bridge);
