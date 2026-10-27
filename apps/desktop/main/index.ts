import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'node:path';
import { channels, privateSnapshotSchema, type IpcResponse } from '@dnd/contracts';
import type { WindowRole } from '@dnd/domain';
import { WorkerClient } from './worker-client';
import { handleIpcRequest } from './ipc-boundary';

declare const STORYTELLER_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const PLAYER_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const STORYTELLER_WINDOW_VITE_NAME: string;
declare const PLAYER_WINDOW_VITE_NAME: string;

const roles = new Map<number, WindowRole>();
let engine: WorkerClient;
let assets: WorkerClient;
let playerWindow: BrowserWindow | undefined;
let imageTilesVerified = false;

async function createWindow(role: WindowRole): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    title: role === 'storyteller' ? 'Storyteller' : 'Player display',
    width: role === 'storyteller' ? 1280 : 960, height: 800, show: false,
    webPreferences: {
      preload: join(__dirname, `${role}.cjs`),
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true,
    },
  });
  roles.set(window.webContents.id, role);
  const senderId = window.webContents.id;
  window.on('closed', () => { roles.delete(senderId); });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  const devUrl = role === 'storyteller' ? STORYTELLER_WINDOW_VITE_DEV_SERVER_URL : PLAYER_WINDOW_VITE_DEV_SERVER_URL;
  const name = role === 'storyteller' ? STORYTELLER_WINDOW_VITE_NAME : PLAYER_WINDOW_VITE_NAME;
  if (devUrl) await window.loadURL(devUrl);
  else await window.loadFile(join(__dirname, `../renderer/${name}/index.html`));
  window.show();
  return window;
}

async function openPlayer(): Promise<void> {
  if (playerWindow && !playerWindow.isDestroyed()) { playerWindow.focus(); return; }
  playerWindow = await createWindow('player');
  playerWindow.on('closed', () => { playerWindow = undefined; });
}

void app.whenReady().then(async () => {
  engine = new WorkerClient(join(__dirname, 'engine-process.cjs'), 'World authority');
  assets = new WorkerClient(join(__dirname, 'asset-process.cjs'), 'Asset jobs');
  const probePath = join(process.env['DND_SMOKE_DATA'] ?? app.getPath('userData'), 'compatibility');
  await engine.call('initialize', probePath);
  imageTilesVerified = await assets.call('probe', join(probePath, 'tiles')) === true;
  for (const role of ['storyteller', 'player'] as const) {
    ipcMain.handle(role === 'storyteller' ? channels.storytellerRequest : channels.playerRequest, async (event, input: unknown) =>
      handleIpcRequest({ registeredRole: roles.get(event.sender.id), isMainFrame: event.senderFrame !== null && event.senderFrame === event.sender.mainFrame }, role, input, async request => {
        if (request.operation === 'host.open-player') {
          await openPlayer();
          return { protocolVersion: 1, requestId: request.requestId, ok: true, result: { type: 'acknowledged' } };
        }
        const response = await engine.call('request', request) as IpcResponse;
        if (response.ok && response.result.type === 'private-snapshot') {
          const snapshot = privateSnapshotSchema.parse(response.result.snapshot);
          return { ...response, result: { type: 'private-snapshot', snapshot: { ...snapshot, diagnostics: { ...snapshot.diagnostics, imageTilesVerified } } } };
        }
        return response;
      }));
  }
  await createWindow('storyteller');
  await openPlayer();
}).catch(error => {
  console.error('Startup failed:', error);
  if (process.env['DND_SMOKE_DATA']) { app.exit(1); return; }
  dialog.showErrorBox('Startup failed', error instanceof Error ? error.message : String(error));
  app.quit();
});

app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { engine?.close(); assets?.close(); });
