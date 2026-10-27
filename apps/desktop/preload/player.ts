import { contextBridge, ipcRenderer } from 'electron';
import { channels, type PlayerBridge, type PlayerSelection } from '@dnd/contracts';

const bridge: PlayerBridge = Object.freeze({
  snapshot: () => ipcRenderer.invoke(channels.playerSnapshot),
  select: (input: PlayerSelection) => ipcRenderer.invoke(channels.playerSelect, input),
});
contextBridge.exposeInMainWorld('player', bridge);
