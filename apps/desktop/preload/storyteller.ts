import { contextBridge, ipcRenderer } from 'electron';
import { channels, type StorytellerBridge } from '@dnd/contracts';

const bridge: StorytellerBridge = Object.freeze({
  snapshot: () => ipcRenderer.invoke(channels.storytellerSnapshot),
  openPlayer: () => ipcRenderer.invoke(channels.openPlayer),
});
contextBridge.exposeInMainWorld('storyteller', bridge);
