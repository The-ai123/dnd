import { describe, expect, it } from 'vitest';
import { buildPublicScene, SerialQueue, validatePlayerSelection, type EngineEntity } from '@dnd/engine';
import { playerSelectionSchema, publicSceneSchema } from '@dnd/contracts';

const identity = { worldInstanceId: '11111111-1111-4111-8111-111111111111', sceneEpoch: 1, revision: 7, context: 'live' as const };
const entity: EngineEntity = { id: '22222222-2222-4222-8222-222222222222', publicName: 'Guard', visible: true, party: false, hp: 17, maxHp: 23, x: 10, y: 20, privateNotes: 'Secret' };

describe('public boundary', () => {
  it('omits hidden identities, enemy health and private fields entirely', () => {
    const scene = buildPublicScene(identity, [entity, { ...entity, id: '33333333-3333-4333-8333-333333333333', visible: false, publicName: 'Hidden' }]);
    expect(publicSceneSchema.parse(scene).tokens).toEqual([{ id: entity.id, name: 'Guard', x: 10, y: 20 }]);
    expect(JSON.stringify(scene)).not.toMatch(/Hidden|Secret|privateNotes|maxHp|"hp"/);
    expect(buildPublicScene(identity, [{ ...entity, party: true }]).tokens[0]?.partyHp).toEqual({ current: 17, max: 23 });
  });
  it('rejects stale scenes, other worlds, hidden IDs and frozen/replay input', () => {
    const scene = buildPublicScene(identity, [entity]);
    expect(() => validatePlayerSelection(scene, { identity, tokenId: entity.id })).not.toThrow();
    for (const changed of [{ sceneEpoch: 0 }, { revision: 6 }, { worldInstanceId: 'other' }, { context: 'replay' as const }]) {
      expect(() => validatePlayerSelection(scene, { identity: { ...identity, ...changed }, tokenId: entity.id })).toThrow();
    }
    expect(() => validatePlayerSelection(scene, { identity, tokenId: 'hidden' })).toThrow();
    expect(() => validatePlayerSelection({ ...scene, identity: { ...identity, context: 'frozen' } }, { identity, tokenId: entity.id })).toThrow();
  });
  it('rejects invalid IPC payloads and extra authority fields', () => {
    expect(playerSelectionSchema.safeParse({ identity, tokenId: entity.id, role: 'storyteller' }).success).toBe(false);
    expect(playerSelectionSchema.safeParse({ identity: { ...identity, revision: -1 }, tokenId: entity.id }).success).toBe(false);
  });
});

it('serializes asynchronous authority and continues after a rejected operation', async () => {
  const queue = new SerialQueue();
  const order: number[] = [];
  const first = queue.run(async () => { await Promise.resolve(); order.push(1); throw new Error('rejected'); });
  const second = queue.run(() => { order.push(2); return 'committed'; });
  await expect(first).rejects.toThrow('rejected');
  await expect(second).resolves.toBe('committed');
  expect(order).toEqual([1, 2]);
});
