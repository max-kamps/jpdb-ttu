declare type EventFunction<T extends unknown[]> = (...args: [...T]) => void;

declare interface BroadcastEvents {
  configurationUpdated: [];
  cardStateUpdated: [vid: number, sid: number, cardstate: JPDBCardState[]];
}

declare interface BackgroundEvents {
  parse: [data: [sequenceId: number, text: string][]];
  lookupText: [text: string];
  abortRequest: [sequence: number];
  updateCardState: [vid: number, sid: number];
  addToDeck: [vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'];
  removeFromDeck: [vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'];
}

declare interface TabEvents {
  sequenceAborted: [sequence: number];
  sequenceSuccess: [sequence: number, data: unknown];
  sequenceError: [sequence: number, data: string];
  parsePage: [];
  parseSelection: [];
  toast: [type: 'error' | 'success', message: string, timeoutDuration?: number];
}

type KeybindEvent = [e: KeyboardEvent | MouseEvent];
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
