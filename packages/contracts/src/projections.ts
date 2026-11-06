import { z } from 'zod';
import { revisionSchema } from './domain';
import type { StorytellerRequest, IpcResponse } from './envelopes';

export const channels = {
  storytellerRequest: 'storyteller:request',
  playerRequest: 'player:request',
} as const;

export const sceneIdentitySchema = z.object({
  worldInstanceId: z.uuid(),
  sceneEpoch: revisionSchema,
  revision: revisionSchema,
  context: z.enum(['live', 'staging', 'replay', 'frozen']),
}).strict();

export const publicTokenSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  partyHp: z.object({ current: z.number(), max: z.number().positive() }).strict().optional(),
}).strict();

export const publicSceneSchema = z.object({
  identity: sceneIdentitySchema,
  title: z.string(),
  tokens: z.array(publicTokenSchema),
}).strict();

export const privateSnapshotSchema = z.object({
  publicScene: publicSceneSchema,
  diagnostics: z.object({
    engine: z.literal('ready'),
    sqlite: z.string(),
    backupVerified: z.boolean(),
    imageTilesVerified: z.boolean(),
    catalogSchemaVersion: revisionSchema.min(1),
  }).strict(),
  privateNotes: z.string(),
}).strict();

export const playerSelectionSchema = z.object({
  identity: sceneIdentitySchema,
  tokenId: z.uuid(),
}).strict();

export type PublicScene = z.infer<typeof publicSceneSchema>;
export type PrivateSnapshot = z.infer<typeof privateSnapshotSchema>;
export type PlayerSelection = z.infer<typeof playerSelectionSchema>;
export interface StorytellerBridge {
  request(input: StorytellerRequest): Promise<IpcResponse>;
  snapshot(): Promise<PrivateSnapshot>;
  openPlayer(): Promise<void>;
}
export interface PlayerBridge {
  snapshot(): Promise<PublicScene>;
  select(input: PlayerSelection): Promise<void>;
}
