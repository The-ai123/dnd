import { expect, it } from 'vitest';
import {
  worldCommandSchema, playerRequestSchema, responseSchema, placementSchema,
  sessionStatusSchema, formulaSchema, qualifiedRecordReferenceSchema,
} from '@dnd/contracts';
import { findVersionConflicts } from '@dnd/domain';

export const worldId = '11111111-1111-4111-8111-111111111111';
export const sessionId = '22222222-2222-4222-8222-222222222222';
export const campaignId = '33333333-3333-4333-8333-333333333333';
export const createCommand = {
  protocolVersion: 1 as const, requestId: sessionId, commandId: campaignId,
  worldInstanceId: worldId, actorWindowRole: 'storyteller' as const, operation: 'session.create' as const,
  expectedRecordVersions: [{ kind: 'session' as const, recordId: sessionId, version: null }, { kind: 'campaign' as const, recordId: campaignId, version: 2 }],
  payload: { sessionId, campaignId },
};

it('admits only strict, versioned commands with explicit creation/existing expectations', () => {
  expect(worldCommandSchema.parse(createCommand)).toEqual(createCommand);
  const invalid = [
    { ...createCommand, actorWindowRole: 'player' }, { ...createCommand, protocolVersion: 2 },
    { ...createCommand, path: 'C:/world.sqlite' }, { ...createCommand, expectedRecordVersions: [] },
    { ...createCommand, payload: { ...createCommand.payload, paused: true } },
    { ...createCommand, expectedRecordVersions: [...createCommand.expectedRecordVersions, createCommand.expectedRecordVersions[0]] },
    { ...createCommand, expectedRecordVersions: [{ kind: 'session', recordId: sessionId, version: 1 }] },
    { ...createCommand, expectedRecordVersions: [{ kind: 'session', recordId: sessionId, version: null }, { kind: 'campaign', recordId: campaignId, version: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...createCommand, operation: 'eval', payload: { code: 'process.exit()' } },
  ];
  for (const command of invalid) expect(worldCommandSchema.safeParse(command).success).toBe(false);
  expect(worldCommandSchema.safeParse({ ...createCommand, operation: 'session.complete', sessionId, payload: {} }).success).toBe(false);
  expect(worldCommandSchema.safeParse({ ...createCommand, operation: 'session.complete', sessionId, payload: {}, expectedRecordVersions: [{ kind: 'session', recordId: sessionId, version: 0 }] }).success).toBe(true);
  expect(playerRequestSchema.safeParse(createCommand).success).toBe(false);
});

it('distinguishes absence, deletion and stale versions without mutating inputs', () => {
  const expected = worldCommandSchema.parse(createCommand).expectedRecordVersions;
  expect(findVersionConflicts(expected, kind => kind === 'session' ? null : 2)).toEqual([]);
  expect(findVersionConflicts(expected, kind => kind === 'session' ? 0 : null)).toEqual([
    { kind: 'session', recordId: sessionId, expectedVersion: null, actualVersion: 0 },
    { kind: 'campaign', recordId: campaignId, expectedVersion: 2, actualVersion: null },
  ]);
  expect(expected).toEqual(createCommand.expectedRecordVersions);
});

it('bounds domain data and prohibits executable formulas and copied placement health', () => {
  expect(sessionStatusSchema.safeParse('paused').success).toBe(false);
  expect(qualifiedRecordReferenceSchema.safeParse({ kind: 'entity', recordId: sessionId, worldInstanceId: worldId }).success).toBe(true);
  expect(qualifiedRecordReferenceSchema.safeParse({ kind: 'entity', recordId: 'Guard', worldInstanceId: worldId }).success).toBe(false);
  const placement = { id: sessionId, entityId: campaignId, encounterId: worldId, version: 0, xFeet: -1, yFeet: 0, elevationFeet: -10, widthFeet: 5, heightFeet: 5 };
  expect(placementSchema.safeParse(placement).success).toBe(true);
  for (const changed of [{ hp: 20 }, { widthFeet: 0 }, { yFeet: Infinity }]) expect(placementSchema.safeParse({ ...placement, ...changed }).success).toBe(false);
  expect(formulaSchema.safeParse({ terms: [{ type: 'dice', count: 2, sides: 6, sign: 1 }, { type: 'constant', value: -2 }] }).success).toBe(true);
  for (const terms of [[{ type: 'eval', source: 'alert(1)' }], [{ type: 'dice', count: 101, sides: 6, sign: 1 }], []]) expect(formulaSchema.safeParse({ terms }).success).toBe(false);
  expect(responseSchema.safeParse({ protocolVersion: 1, requestId: sessionId, ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed', stack: 'private path' } }).success).toBe(false);
});
