declare interface BroadcastEvents {
  configurationUpdated: () => void;
}

declare interface BackgroundEvents {
  lookupText: (text: string) => void;
}

declare interface TabEvents {
  parsePage: () => void;
  parseSelection: () => void;
  toast: (type: 'error' | 'success', message: string, timeoutDuration?: number) => void;
}

declare interface LocalEvents {
  closeAllDialogs: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewNothing: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewSomething: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewHard: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewGood: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewEasy: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewFail: (e: KeyboardEvent | MouseEvent) => void;
  jpdbReviewPass: (e: KeyboardEvent | MouseEvent) => void;
  parseKey: (e: KeyboardEvent | MouseEvent) => void;
  showPopupKey: (e: KeyboardEvent | MouseEvent) => void;
  showAdvancedDialogKey: (e: KeyboardEvent | MouseEvent) => void;
  lookupSelectionKey: (e: KeyboardEvent | MouseEvent) => void;
  addToMiningKey: (e: KeyboardEvent | MouseEvent) => void;
  addToBlacklistKey: (e: KeyboardEvent | MouseEvent) => void;
  addToNeverForgetKey: (e: KeyboardEvent | MouseEvent) => void;
}
