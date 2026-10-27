import { app, BrowserWindow, ipcMain, dialog, type IpcMainInvokeEvent } from 'electron';
import { join } from 'node:path';
import { channels, privateSnapshotSchema, publicSceneSchema, playerSelectionSchema } from '@dnd/contracts';
import type { WindowRole } from '@dnd/domain';
import { WorkerClient } from './worker-client';

declare const STORYTELLER_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const PLAYER_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const STORYTELLER_WINDOW_VITE_NAME: string;
declare const PLAYER_WINDOW_VITE_NAME: string;

const roles = new Map<number, WindowRole>();
let engine: WorkerClient;
let assets: WorkerClient;
let playerWindow: BrowserWindow | undefined;
let imageTilesVerified = false;

function authorize(event: IpcMainInvokeEvent, role: WindowRole): void {
  if (roles.get(event.sender.id) !== role || event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Unauthorized IPC sender');
  }
}

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
  ipcMain.handle(channels.storytellerSnapshot, async event => {
    authorize(event, 'storyteller');
    const snapshot = privateSnapshotSchema.parse(await engine.call('privateSnapshot'));
    return { ...snapshot, diagnostics: { ...snapshot.diagnostics, imageTilesVerified } };
  });
  ipcMain.handle(channels.playerSnapshot, async event => {
    authorize(event, 'player');
    return publicSceneSchema.parse(await engine.call('publicSnapshot'));
  });
  ipcMain.handle(channels.playerSelect, async (event, input: unknown) => {
    authorize(event, 'player');
    await engine.call('select', playerSelectionSchema.parse(input));
  });
  ipcMain.handle(channels.openPlayer, async event => { authorize(event, 'storyteller'); await openPlayer(); });
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
