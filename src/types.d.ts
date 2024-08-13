//#region Communications

declare type BroadcastEvents = { 'configuration-updated': [[], void] };
declare type BackgroundEvents = BroadcastEvents & {};
declare type TabEvents = BroadcastEvents & {
  parsePage: [[], void];
  parseSelection: [[], void];
};

declare type BroadcastEventOptions<TEvent extends keyof BroadcastEvents> = {
  event: TEvent;
  target: 'all' | 'background' | 'tab';
};
declare type BackgroundEventOptions<TEvent extends keyof BackgroundEvents> = {
  event: TEvent;
  target?: 'background';
};
declare type TabEventOptions<TEvent extends keyof TabEvents> = {
  event: TEvent;
  tabId: number;
  target?: 'tab';
};

type KeybindArgs = [e: KeyboardEvent | MouseEvent];
declare type LocalEvents = {
  'close-all-dialogs': [KeybindArgs, void];
  jpdbReviewNothing: [KeybindArgs, void];
  jpdbReviewSomething: [KeybindArgs, void];
  jpdbReviewHard: [KeybindArgs, void];
  jpdbReviewGood: [KeybindArgs, void];
  jpdbReviewEasy: [KeybindArgs, void];
  jpdbReviewFail: [KeybindArgs, void];
  jpdbReviewPass: [KeybindArgs, void];
  parseKey: [KeybindArgs, void];
  showPopupKey: [KeybindArgs, void];
  showAdvancedDialogKey: [KeybindArgs, void];
  lookupSelectionKey: [KeybindArgs, void];
  addToMiningKey: [KeybindArgs, void];
  addToBlacklistKey: [KeybindArgs, void];
  addToNeverForgetKey: [KeybindArgs, void];
};

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
