import { JPDBCardState } from '@shared/jpdb';
import { PotentialPromise } from '@shared/types';

/**
 * Defines events emitted from any part of the extension to all parts of the extension
 */
export interface BroadcastEvents {
  configurationUpdated: [];
  cardStateUpdated: [vid: number, sid: number, cardstate: JPDBCardState[]];
}
export type BroadcastEventArgs<T extends keyof BroadcastEvents> = BroadcastEvents[T];
export type BroadcastEventFunction<T extends keyof BroadcastEvents = keyof BroadcastEvents> = (
  ...args: BroadcastEventArgs<T>
) => PotentialPromise<void>;
