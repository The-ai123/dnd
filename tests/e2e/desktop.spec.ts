import { test, expect, _electron } from '@playwright/test';
import { resolve } from 'node:path';

test('packaged offline windows, native probes and public authority boundary', async ({}, testInfo) => {
  const application = await _electron.launch({
    executablePath: resolve('out/Storyteller-win32-x64/storyteller.exe'),
    env: { ...process.env, DND_SMOKE_DATA: testInfo.outputPath('app-data') },
  });
  application.process().stderr?.on('data', (data: Buffer) => process.stderr.write(data));
  try {
    await expect.poll(() => application.windows().length, { timeout: 30_000 }).toBe(2);
    const windows = application.windows();
    const storyteller = windows.find(window => window.url().includes('storyteller_window'))!;
    const player = windows.find(window => window.url().includes('player_window'))!;
    await expect(storyteller.getByText('Backup verified', { exact: true })).toBeVisible();
    await expect(storyteller.getByText('Catalog schema 1 ready', { exact: true })).toBeVisible();
    await expect(storyteller.getByText('Tile generation verified', { exact: true })).toBeVisible();
    await expect(player.locator('[data-renderer="webgl"] canvas')).toBeVisible();
    await expect(player.getByRole('alert')).toHaveCount(0);
    const security = await player.evaluate(async () => {
      const scene = await window.player.snapshot();
      let staleRejected = false;
      try { await window.player.select({ identity: { ...scene.identity, sceneEpoch: 0 }, tokenId: scene.tokens[0]!.id }); }
      catch { staleRejected = true; }
      return { scene, staleRejected, hasNode: 'require' in window, hasPrivateBridge: 'storyteller' in window };
    });
    expect(security.hasNode).toBe(false);
    expect(security.hasPrivateBridge).toBe(false);
    expect(security.staleRejected).toBe(true);
    expect(JSON.stringify(security.scene)).not.toMatch(/Hidden creature|Secret tactics|privateNotes|maxHp|catalogSchemaVersion/);
    expect(security.scene.tokens).toHaveLength(2);
    const contracts = await storyteller.evaluate(async () => {
      const snapshot = await window.storyteller.snapshot();
      const base = { protocolVersion: 1 as const, requestId: crypto.randomUUID(), actorWindowRole: 'storyteller' as const };
      const foreign = await window.storyteller.request({ ...base, operation: 'world.snapshot', worldInstanceId: crypto.randomUUID() });
      const current = await window.storyteller.request({ ...base, operation: 'world.snapshot', worldInstanceId: snapshot.publicScene.identity.worldInstanceId });
      const sessionId = crypto.randomUUID();
      const unavailable = await window.storyteller.request({ ...base, operation: 'session.complete', worldInstanceId: snapshot.publicScene.identity.worldInstanceId, commandId: crypto.randomUUID(), sessionId, expectedRecordVersions: [{ kind: 'session', recordId: sessionId, version: 0 }], payload: {} });
      let invalidRejected = false;
      try { await window.storyteller.request({ ...base, operation: 'host.open-player', extra: true } as Parameters<typeof window.storyteller.request>[0]); }
      catch { invalidRejected = true; }
      return { foreign, currentOk: current.ok, unavailable, invalidRejected };
    });
    expect(contracts.foreign).toMatchObject({ ok: false, error: { code: 'WORLD_MISMATCH' } });
    expect(contracts.currentOk).toBe(true);
    expect(contracts.unavailable).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_OPERATION' } });
    expect(contracts.invalidRejected).toBe(true);
    await player.evaluate(async () => {
      const scene = await window.player.snapshot();
      await window.player.select({ identity: scene.identity, tokenId: scene.tokens[0]!.id });
    });
    const processIds = await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().map(window => window.webContents.getOSProcessId()));
    expect(new Set(processIds).size).toBe(2);
    const unregisteredRejected = await application.evaluate(async ({ app, BrowserWindow }) => {
      const unregistered = new BrowserWindow({ show: false, webPreferences: {
        preload: `${app.getAppPath()}/.vite/build/storyteller.cjs`,
        sandbox: true, contextIsolation: true, nodeIntegration: false,
      } });
      try {
        await unregistered.loadURL('data:text/html,<title>Unregistered sender test</title>');
        return await unregistered.webContents.executeJavaScript(`window.storyteller.request({ protocolVersion: 1, requestId: '11111111-1111-4111-8111-111111111111', actorWindowRole: 'storyteller', operation: 'host.snapshot' }).then(response => !response.ok && response.error.code === 'UNAUTHORIZED')`) as boolean;
      } finally { unregistered.destroy(); }
    });
    expect(unregisteredRejected).toBe(true);
    await storyteller.screenshot({ path: testInfo.outputPath('storyteller.png') });
    await player.screenshot({ path: testInfo.outputPath('player.png') });
    await player.close();
    await storyteller.getByRole('button', { name: 'Open player display' }).click();
    await expect.poll(() => application.windows().length).toBe(2);
    const reopened = application.windows().find(window => window !== storyteller)!;
    await expect(reopened.locator('[data-renderer="webgl"] canvas')).toBeVisible();
    await expect(reopened.getByRole('alert')).toHaveCount(0);
  } finally { await application.close(); }
});
