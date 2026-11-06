import { z } from 'zod';
import { expectedRecordVersionsSchema, idSchema, revisionSchema, versionConflictSchema } from './domain';
import { playerSelectionSchema, privateSnapshotSchema, publicSceneSchema } from './projections';

const header = { protocolVersion: z.literal(1), requestId: idSchema };
const worldBinding = { worldInstanceId: idSchema };
const commandHeader = {
  ...header, ...worldBinding, actorWindowRole: z.literal('storyteller'),
  commandId: idSchema, expectedRecordVersions: expectedRecordVersionsSchema,
};

/** Only reviewed command shapes are admitted. New handlers must extend this union. */
export const worldCommandSchema = z.discriminatedUnion('operation', [
  z.object({ ...commandHeader, operation: z.literal('session.create'), payload: z.object({
    sessionId: idSchema, campaignId: idSchema, continuationOf: idSchema.optional(),
  }).strict() }).strict(),
  z.object({ ...commandHeader, operation: z.literal('session.complete'), sessionId: idSchema, payload: z.object({}).strict() }).strict(),
]).superRefine((command, context) => {
  const sessionId = command.operation === 'session.create' ? command.payload.sessionId : command.sessionId;
  const expectation = command.expectedRecordVersions.find(record => record.kind === 'session' && record.recordId === sessionId);
  if (!expectation || (command.operation === 'session.create' ? expectation.version !== null : expectation.version === null)) {
    context.addIssue({ code: 'custom', path: ['expectedRecordVersions'], message: 'Session creation requires absence; completion requires an existing version' });
  }
  if (command.operation === 'session.create' && !command.expectedRecordVersions.some(record =>
    record.kind === 'campaign' && record.recordId === command.payload.campaignId && record.version !== null)) {
    context.addIssue({ code: 'custom', path: ['expectedRecordVersions'], message: 'Campaign version is required' });
  }
});

export const storytellerRequestSchema = z.union([
  z.object({ ...header, actorWindowRole: z.literal('storyteller'), operation: z.literal('host.snapshot') }).strict(),
  z.object({ ...header, actorWindowRole: z.literal('storyteller'), operation: z.literal('host.open-player') }).strict(),
  z.object({ ...header, ...worldBinding, actorWindowRole: z.literal('storyteller'), operation: z.literal('world.snapshot') }).strict(),
  worldCommandSchema,
]);
export const playerRequestSchema = z.discriminatedUnion('operation', [
  z.object({ ...header, actorWindowRole: z.literal('player'), operation: z.literal('host.snapshot') }).strict(),
  z.object({ ...header, ...worldBinding, actorWindowRole: z.literal('player'), operation: z.literal('world.snapshot') }).strict(),
  z.object({ ...header, ...worldBinding, actorWindowRole: z.literal('player'), operation: z.literal('scene.select'), payload: playerSelectionSchema }).strict(),
]);
export const requestSchema = z.union([storytellerRequestSchema, playerRequestSchema]);

export const failureSchema = z.discriminatedUnion('code', [
  z.object({ code: z.enum(['INVALID_REQUEST', 'UNAUTHORIZED', 'WORLD_MISMATCH', 'UNSUPPORTED_OPERATION', 'INVALID_SELECTION', 'INTERNAL_ERROR']), message: z.string().max(512) }).strict(),
  z.object({ code: z.literal('VERSION_CONFLICT'), message: z.string().max(512), conflicts: z.array(versionConflictSchema).min(1).max(1024) }).strict(),
]);
export const responseSchema = z.discriminatedUnion('ok', [
  z.object({ protocolVersion: z.literal(1), requestId: idSchema.nullable(), ok: z.literal(false), error: failureSchema }).strict(),
  z.object({ protocolVersion: z.literal(1), requestId: idSchema, ok: z.literal(true), result: z.discriminatedUnion('type', [
    z.object({ type: z.literal('private-snapshot'), snapshot: privateSnapshotSchema }).strict(),
    z.object({ type: z.literal('public-snapshot'), snapshot: publicSceneSchema }).strict(),
    z.object({ type: z.literal('acknowledged') }).strict(),
    z.object({ type: z.literal('committed'), commandId: idSchema, worldInstanceId: idSchema, revision: revisionSchema }).strict(),
  ]) }).strict(),
]);
export type IpcRequest = z.infer<typeof requestSchema>;
export type StorytellerRequest = z.infer<typeof storytellerRequestSchema>;
export type WorldCommand = z.infer<typeof worldCommandSchema>;
export type IpcResponse = z.infer<typeof responseSchema>;
export type IpcFailure = z.infer<typeof failureSchema>;
