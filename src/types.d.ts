/// <reference types="chrome-types" />

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
  addToMiningKey: Keybind;
  addToBlacklistKey: Keybind;
  addToNeverForgetKey: Keybind;

  customWordCSS: string;
  customPopupCSS: string;
};
