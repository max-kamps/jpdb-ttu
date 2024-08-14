//#region Utility Types

declare type Filter<T, TF extends T[keyof T]> = {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};
declare type FilterKeys<T, TF extends T[keyof T]> = keyof Filter<T, TF>;

//#endregion
//#region Communications

declare type ArgumentsFor<T> = T extends (...args: infer A) => any ? A : never;

declare interface EventMap {
  [key: string]: (...args: any) => any;
}
declare interface BroadcastEvents {
  'configuration-updated': () => void;
}

declare interface BackgroundEvents extends BroadcastEvents {}

declare interface TabEvents {
  parsePage: () => void;
  parseSelection: () => void;
}
declare type TE = {
  [K in keyof TabEvents]: (
    tabId: number,
    ...args: [...Parameters<TabEvents[K]>]
  ) => ReturnType<TabEvents[K]>;
};

declare interface LocalEvents {
  'close-all-dialogs': (e: KeyboardEvent | MouseEvent) => void;
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

//#endregion
//#region Configuration

declare type Keybind = { key: string; code: string; modifiers: string[] };

declare type AnkiFieldTemplateName =
  | 'empty'
  | 'spelling'
  | 'reading'
  | 'isKanji'
  | 'meaning'
  | 'sentence'
  | 'sentenceSanitized'
  | 'sound:silence'
  | 'hiragana'
  | 'frequency'
  | 'frequencyStylized';

declare type AnkiFieldTemplate = Record<AnkiFieldTemplateName, () => string>;

declare type TemplateTarget = {
  template: AnkiFieldTemplateName;
  field: string;
};

declare type DeckConfiguration = {
  deck: string;
  model: string;
  proxy: boolean;
  wordField: string;
  readingField: string;
  templateTargets: TemplateTarget[];
};

declare type DiscoverWordConfiguration = {
  model: string;
  wordField: string;
  deck?: string;
  readingField?: string;
};

declare type ConfigurationSchema = {
  schemaVersion: number;
  jpdbApiToken: string;
  jpdbMiningDeck: string;
  jpdbBlacklistDeck: string;
  jpdbForqDeck: string;
  jpdbNeverForgetDeck: string;
  jpdbAddToForq: boolean;
  jpdbUseTwoGrades: boolean;
  jpdbReviewNothing: Keybind;
  jpdbReviewSomething: Keybind;
  jpdbReviewHard: Keybind;
  jpdbReviewGood: Keybind;
  jpdbReviewEasy: Keybind;
  jpdbReviewFail: Keybind;
  jpdbReviewPass: Keybind;

  enableAnkiIntegration: boolean;
  ankiUrl: string;
  ankiProxyUrl: string;
  ankiMiningConfig: DeckConfiguration;
  ankiBlacklistConfig: DeckConfiguration;
  ankiNeverForgetConfig: DeckConfiguration;
  ankiReadonlyConfigs: DiscoverWordConfiguration[];

  contextWidth: number;

  showPopupOnHover: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;

  parseKey: Keybind;
  showPopupKey: Keybind;
  showAdvancedDialogKey: Keybind;
  lookupSelectionKey: Keybind;
  addToMiningKey: Keybind;
  addToBlacklistKey: Keybind;
  addToNeverForgetKey: Keybind;

  customWordCSS: string;
  customPopupCSS: string;
};

//#endregion
