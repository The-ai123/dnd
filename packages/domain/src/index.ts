/** Pure domain primitives. No Electron, UI, storage or wall-clock dependencies. */
export type WindowRole = 'storyteller' | 'player';
export type PresentationContext = 'live' | 'staging' | 'replay' | 'frozen';

export interface SceneIdentity {
  readonly worldInstanceId: string;
  readonly sceneEpoch: number;
  readonly revision: number;
  readonly context: PresentationContext;
}

export type RecordKind = 'campaign' | 'session' | 'entity' | 'location' | 'area-template' | 'encounter' | 'placement' | 'draft' | 'definition' | 'asset' | 'shop';
export type SessionStatus = 'in-progress' | 'complete';
export interface RecordVersion {
  readonly kind: RecordKind;
  readonly recordId: string;
  /** Null means the record must not exist (creation), never a wildcard. */
  readonly version: number | null;
}
export interface VersionConflict {
  readonly kind: RecordKind;
  readonly recordId: string;
  readonly expectedVersion: number | null;
  readonly actualVersion: number | null;
}

/** Lookup must use the bound world, inside the serialized authority/transaction. */
export function findVersionConflicts(
  expected: readonly RecordVersion[],
  currentVersion: (kind: RecordKind, recordId: string) => number | null,
): VersionConflict[] {
  return expected.flatMap(record => {
    const actualVersion = currentVersion(record.kind, record.recordId);
    return actualVersion === record.version ? [] : [{
      kind: record.kind, recordId: record.recordId, expectedVersion: record.version, actualVersion,
    }];
  });
}
