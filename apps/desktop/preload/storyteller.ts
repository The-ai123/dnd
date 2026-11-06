import { contextBridge, ipcRenderer } from 'electron';
import { channels, responseSchema, storytellerRequestSchema, type StorytellerBridge, type StorytellerRequest } from '@dnd/contracts';

async function request(input: StorytellerRequest) {
  const parsed = storytellerRequestSchema.parse(input);
  const response = responseSchema.parse(await ipcRenderer.invoke(channels.storytellerRequest, parsed));
  if (response.requestId !== null && response.requestId !== parsed.requestId) throw new Error('Mismatched IPC response');
  return response;
}

const bridge: StorytellerBridge = Object.freeze({
  request,
  snapshot: async () => {
    const response = await request({ protocolVersion: 1, requestId: crypto.randomUUID(), actorWindowRole: 'storyteller', operation: 'host.snapshot' });
    if (!response.ok) throw new Error(response.error.message);
    if (response.result.type !== 'private-snapshot') throw new Error('Invalid snapshot response');
    return response.result.snapshot;
  },
  openPlayer: async () => {
    const response = await request({ protocolVersion: 1, requestId: crypto.randomUUID(), actorWindowRole: 'storyteller', operation: 'host.open-player' });
    if (!response.ok) throw new Error(response.error.message);
  },
});
contextBridge.exposeInMainWorld('storyteller', bridge);
