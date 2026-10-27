/** Pure domain primitives. No Electron, UI, storage or wall-clock dependencies. */
export type WindowRole = 'storyteller' | 'player';
export type PresentationContext = 'live' | 'staging' | 'replay' | 'frozen';

export interface SceneIdentity {
  readonly worldInstanceId: string;
  readonly sceneEpoch: number;
  readonly revision: number;
  readonly context: PresentationContext;
}
