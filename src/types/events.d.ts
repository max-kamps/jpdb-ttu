//#region Event Types

declare type EventTypes = BackgroundEvents | BroadcastEvents | TabEvents | LocalEvents;

declare type EventFunctions<
  T extends EventTypes,
  // @ts-expect-error: Typescript does not allow indexing, but we know they exist
> = (...args: [...T[keyof T][0]]) => T[keyof T][1];

declare type EventFunction<
  Collection extends EventTypes,
  Key extends keyof Collection,
  // @ts-expect-error: Typescript does not allow indexing, but we know they exist
> = (...args: [...Collection[Key][0]]) => Collection[Key][1];

declare type ArgumentsForEvent<
  Collection extends EventTypes,
  Key extends keyof Collection,
  // @ts-expect-error: Typescript does not allow indexing, but we know they exist
> = Collection[Key][0];

declare type ResultForEvent<
  Collection extends EventTypes,
  Key extends keyof Collection,
  // @ts-expect-error: Typescript does not allow indexing, but we know they exist
> = Collection[Key][1];

//#endregion
//#region Events

declare interface BroadcastEvents {
  configurationUpdated: [[], void];
  cardStateUpdated: [[vid: number, sid: number, cardstate: JPDBCardState[]], void];
}

declare interface BackgroundEvents {
  parse: [[data: [sequenceId: number, text: string][]], void];
  lookupText: [[text: string], void];
  abortRequest: [[sequence: number], void];
  updateCardState: [[vid: number, sid: number], void];
  addToDeck: [[vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'], void];
  removeFromDeck: [[vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'], void];
}

declare interface TabEvents {
  sequenceAborted: [[sequence: number], void];
  sequenceSuccess: [[sequence: number, data: unknown], void];
  sequenceError: [[sequence: number, data: string], void];
  parsePage: [[], void];
  parseSelection: [[], void];
  toast: [[type: 'error' | 'success', message: string, timeoutDuration?: number], void];
}

type KeybindEvent = [[e: KeyboardEvent | MouseEvent], PotentialPromise<void>];
declare interface LocalEvents {
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

//#endregion
