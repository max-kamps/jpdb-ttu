import { PotentialPromise } from '@shared/types';

type KeybindEvent = [[e: KeyboardEvent | MouseEvent], PotentialPromise<void>];

/**
 * Defines events which can occur in the current scope
 * Those do not get transferred between browser and extension
 */
export interface LocalEvents {
  closeAllDialogs: KeybindEvent;
  jpdbReviewNothing: KeybindEvent;
  jpdbReviewSomething: KeybindEvent;
  jpdbReviewHard: KeybindEvent;
  jpdbReviewGood: KeybindEvent;
  jpdbReviewEasy: KeybindEvent;
  jpdbReviewFail: KeybindEvent;
  jpdbReviewPass: KeybindEvent;
  jpdbRotateForward: KeybindEvent;
  jpdbRotateBackward: KeybindEvent;
  parseKey: KeybindEvent;
  showPopupKey: KeybindEvent;
  showAdvancedDialogKey: KeybindEvent;
  lookupSelectionKey: KeybindEvent;
  addToMiningKey: KeybindEvent;
  addToBlacklistKey: KeybindEvent;
  addToNeverForgetKey: KeybindEvent;
}
export type LocalEventArgs<T extends keyof LocalEvents> = LocalEvents[T][0];
export type LocalEventResult<T extends keyof LocalEvents> = LocalEvents[T][1];
export type LocalEventFunction<T extends keyof LocalEvents = keyof LocalEvents> = (
  ...args: LocalEventArgs<T>
) => LocalEventResult<T>;
