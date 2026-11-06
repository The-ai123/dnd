import {
  requestSchema, storytellerRequestSchema, playerRequestSchema, responseSchema,
  type IpcRequest, type IpcResponse, type IpcFailure, type WorldCommand,
} from '@dnd/contracts';
import { findVersionConflicts, type WindowRole, type RecordKind } from '@dnd/domain';

export interface SenderContext { readonly registeredRole: WindowRole | undefined; readonly isMainFrame: boolean }
export function failure(requestId: string | null, code: Exclude<IpcFailure['code'], 'VERSION_CONFLICT'>, message: string): IpcResponse {
  return { protocolVersion: 1, requestId, ok: false, error: { code, message } };
}

/** The submitted role is an assertion, never the source of authority. */
export async function handleIpcRequest(
  sender: SenderContext, channelRole: WindowRole, input: unknown,
  dispatch: (request: IpcRequest) => Promise<IpcResponse>,
): Promise<IpcResponse> {
  if (sender.registeredRole !== channelRole || !sender.isMainFrame) {
    return failure(null, 'UNAUTHORIZED', 'Unauthorized IPC sender');
  }
  const parsed = (channelRole === 'storyteller' ? storytellerRequestSchema : playerRequestSchema).safeParse(input);
  if (!parsed.success) return failure(null, 'INVALID_REQUEST', 'Invalid IPC request');
  try {
    const response = responseSchema.parse(await dispatch(parsed.data));
    if (response.requestId !== parsed.data.requestId || (response.ok && (
      (parsed.data.operation === 'host.snapshot' || parsed.data.operation === 'world.snapshot')
        ? response.result.type !== (channelRole === 'storyteller' ? 'private-snapshot' : 'public-snapshot')
        : parsed.data.operation.startsWith('session.') ? response.result.type !== 'committed' : response.result.type !== 'acknowledged'
    ))) throw new Error('Invalid authority response');
    if (response.ok && 'worldInstanceId' in parsed.data) {
      const result = response.result;
      const resultWorld = result.type === 'committed' ? result.worldInstanceId
        : result.type === 'private-snapshot' ? result.snapshot.publicScene.identity.worldInstanceId
        : result.type === 'public-snapshot' ? result.snapshot.identity.worldInstanceId : parsed.data.worldInstanceId;
      if (resultWorld !== parsed.data.worldInstanceId || (result.type === 'committed' && (
        !('commandId' in parsed.data) || result.commandId !== parsed.data.commandId
      ))) throw new Error('Mismatched authority binding');
    }
    return response;
  } catch {
    return failure(parsed.data.requestId, 'INTERNAL_ERROR', 'IPC operation failed');
  }
}

/** Called inside the engine queue, again validating the utility-process boundary. */
export function validateWorldRequest(input: unknown, worldInstanceId: string): IpcRequest | IpcResponse {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return failure(null, 'INVALID_REQUEST', 'Invalid engine request');
  const request = parsed.data;
  if ('worldInstanceId' in request && request.worldInstanceId !== worldInstanceId) {
    return failure(request.requestId, 'WORLD_MISMATCH', 'Request belongs to another world instance');
  }
  if (request.operation === 'scene.select' && request.payload.identity.worldInstanceId !== worldInstanceId) {
    return failure(request.requestId, 'WORLD_MISMATCH', 'Selection belongs to another world instance');
  }
  return request;
}

/** B04 handlers call this in their transaction before applying any changes. */
export function validateCommandVersions(command: WorldCommand, currentVersion: (kind: RecordKind, recordId: string) => number | null): IpcResponse | undefined {
  const conflicts = findVersionConflicts(command.expectedRecordVersions, currentVersion);
  if (conflicts.length) return {
    protocolVersion: 1, requestId: command.requestId, ok: false,
    error: { code: 'VERSION_CONFLICT', message: 'Records changed; reload before retrying', conflicts },
  };
  return undefined;
}
