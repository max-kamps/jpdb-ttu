declare type EventFunction<T extends any[]> = (...args: [...T]) => void;

declare interface BroadcastEvents {
  configurationUpdated: [];
}

declare interface BackgroundEvents {
  lookupText: [text: string];
  parse: [data: Array<[sequenceId: number, text: string]>];
  abortRequest: [sequence: number];
}

declare interface TabEvents {
  sequenceAborted: [sequence: number];
  sequenceSuccess: [sequence: number, data: any];
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
  parseKey: KeybindEvent;
  showPopupKey: KeybindEvent;
  showAdvancedDialogKey: KeybindEvent;
  lookupSelectionKey: KeybindEvent;
  addToMiningKey: KeybindEvent;
  addToBlacklistKey: KeybindEvent;
  addToNeverForgetKey: KeybindEvent;
}
