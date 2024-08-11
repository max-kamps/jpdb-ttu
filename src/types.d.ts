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
  apiToken: string;
  ankiUrl: string;
  ankiProxyUrl: string;
  miningConfig: DeckConfiguration;
  blacklistConfig: DeckConfiguration;
  neverForgetConfig: DeckConfiguration;
  readonlyConfigs: DiscoverWordConfiguration[];
  contextWidth: number;
  customWordCSS: string;
  customPopupCSS: string;
  showPopupOnHover: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;
  showPopupKey: Keybind;
};
