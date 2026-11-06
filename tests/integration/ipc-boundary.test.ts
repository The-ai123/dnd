import { expect, it, vi } from 'vitest';
import { handleIpcRequest, validateWorldRequest, validateCommandVersions } from '../../apps/desktop/main/ipc-boundary';
import { worldCommandSchema, responseSchema, type IpcResponse } from '@dnd/contracts';

const worldId = '11111111-1111-4111-8111-111111111111';
const recordId = '22222222-2222-4222-8222-222222222222';
const request = { protocolVersion: 1 as const, requestId: recordId, actorWindowRole: 'storyteller' as const, operation: 'host.open-player' as const };
const ack: IpcResponse = { protocolVersion: 1, requestId: recordId, ok: true, result: { type: 'acknowledged' } };

it('rejects unknown, wrong-role, subframe and spoofed senders before dispatch', async () => {
  const dispatch = vi.fn(async () => ack);
  for (const sender of [{ registeredRole: undefined, isMainFrame: true }, { registeredRole: 'player' as const, isMainFrame: true }, { registeredRole: 'storyteller' as const, isMainFrame: false }]) {
    expect(await handleIpcRequest(sender, 'storyteller', request, dispatch)).toMatchObject({ ok: false, error: { code: 'UNAUTHORIZED' } });
  }
  expect(await handleIpcRequest({ registeredRole: 'player', isMainFrame: true }, 'player', request, dispatch)).toMatchObject({ ok: false, error: { code: 'INVALID_REQUEST' } });
  expect(dispatch).not.toHaveBeenCalled();
  expect(await handleIpcRequest({ registeredRole: 'storyteller', isMainFrame: true }, 'storyteller', request, dispatch)).toEqual(ack);
});

it('rejects malformed data and sanitizes invalid or failed authority replies', async () => {
  const sender = { registeredRole: 'storyteller' as const, isMainFrame: true };
  const dispatch = vi.fn(async () => ack);
  for (const input of [null, {}, { ...request, extra: true }, { ...request, protocolVersion: 0 }]) {
    expect(await handleIpcRequest(sender, 'storyteller', input, dispatch)).toMatchObject({ ok: false, error: { code: 'INVALID_REQUEST' } });
  }
  expect(dispatch).not.toHaveBeenCalled();
  for (const dispatch of [async () => { throw new Error('C:/private/database.sqlite'); }, async () => ({ ...ack, requestId: worldId }), async () => ({ ...ack, result: { type: 'committed', commandId: recordId, worldInstanceId: worldId, revision: 0 } } as IpcResponse)]) {
    const response = await handleIpcRequest(sender, 'storyteller', request, dispatch);
    expect(response).toMatchObject({ ok: false, error: { code: 'INTERNAL_ERROR' } });
    expect(JSON.stringify(response)).not.toContain('private');
  }
});

it('binds queries, commands and nested scene identities to the current engine world', () => {
  const query = { ...request, operation: 'world.snapshot', worldInstanceId: worldId };
  expect(validateWorldRequest(query, worldId)).toEqual(query);
  expect(validateWorldRequest(query, recordId)).toMatchObject({ ok: false, error: { code: 'WORLD_MISMATCH' } });
  const select = { ...request, actorWindowRole: 'player', operation: 'scene.select', worldInstanceId: worldId, payload: { identity: { worldInstanceId: recordId, revision: 0, sceneEpoch: 1, context: 'live' }, tokenId: recordId } };
  expect(validateWorldRequest(select, worldId)).toMatchObject({ ok: false, error: { code: 'WORLD_MISMATCH' } });
  const command = worldCommandSchema.parse({ ...request, operation: 'session.complete', commandId: recordId, worldInstanceId: worldId, sessionId: recordId, expectedRecordVersions: [{ kind: 'session', recordId, version: 2 }], payload: {} });
  expect(validateWorldRequest(command, recordId)).toMatchObject({ ok: false, error: { code: 'WORLD_MISMATCH' } });
  expect(validateCommandVersions(command, () => 2)).toBeUndefined();
  expect(responseSchema.parse(validateCommandVersions(command, () => 3))).toMatchObject({ ok: false, error: { code: 'VERSION_CONFLICT', conflicts: [{ expectedVersion: 2, actualVersion: 3 }] } });
});

it('rejects a successful authority result for a different command or restored world', async () => {
  const command = worldCommandSchema.parse({ ...request, operation: 'session.complete', commandId: recordId, worldInstanceId: worldId, sessionId: recordId, expectedRecordVersions: [{ kind: 'session', recordId, version: 2 }], payload: {} });
  const result = { type: 'committed' as const, commandId: recordId, worldInstanceId: worldId, revision: 3 };
  const sender = { registeredRole: 'storyteller' as const, isMainFrame: true };
  for (const change of [{ commandId: worldId }, { worldInstanceId: recordId }]) {
    const response = await handleIpcRequest(sender, 'storyteller', command, async () => ({ ...ack, ok: true, result: { ...result, ...change } }));
    expect(response).toMatchObject({ ok: false, error: { code: 'INTERNAL_ERROR' } });
  }
});
