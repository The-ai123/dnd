import type { PrivateSnapshot, PublicScene, PlayerSelection } from '@dnd/contracts';

export interface EngineEntity {
  readonly id: string;
  readonly publicName: string;
  readonly visible: boolean;
  readonly party: boolean;
  readonly hp: number;
  readonly maxHp: number;
  readonly x: number;
  readonly y: number;
  readonly privateNotes: string;
}

/** Construct an allowlisted DTO; never spread private records into a public scene. */
export function buildPublicScene(identity: PublicScene['identity'], entities: readonly EngineEntity[]): PublicScene {
  return {
    identity,
    title: 'Architecture test scene',
    tokens: entities.filter(entity => entity.visible).map(entity => ({
      id: entity.id, name: entity.publicName, x: entity.x, y: entity.y,
      ...(entity.party ? { partyHp: { current: entity.hp, max: entity.maxHp } } : {}),
    })),
  };
}

export function validatePlayerSelection(scene: PublicScene, input: PlayerSelection): void {
  const current = scene.identity;
  const sent = input.identity;
  if (current.context !== 'live' || sent.context !== 'live' ||
      current.worldInstanceId !== sent.worldInstanceId || current.sceneEpoch !== sent.sceneEpoch ||
      current.revision !== sent.revision || !scene.tokens.some(token => token.id === input.tokenId)) {
    throw new Error('Selection does not belong to the current public scene');
  }
}

/** Serializes authority, including future asynchronous repository operations. */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(operation: () => T | Promise<T>): Promise<T> {
    const result = this.tail.then(operation);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

export type EngineSnapshot = PrivateSnapshot;
