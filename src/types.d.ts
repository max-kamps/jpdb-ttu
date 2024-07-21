/// <reference types="chrome-types" />

declare type Filter<T, TF extends T[keyof T]> = keyof {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};

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

declare type Configuration = {
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

declare interface DOMElementBaseOptions {
  id?: string;
  class?: string | string[];
  attributes?: Record<string, string | boolean>;
  style?: Partial<CSSStyleDeclaration>;
  innerText?: string | number;
  innerHTML?: string;
  handler?: (ev?: MouseEvent) => void;
}

declare type DOMElementOptions = DOMElementBaseOptions & {
  children?: (undefined | false | DOMElementTagOptions | HTMLElement)[];
};

declare type DOMElementTagOptions<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> = DOMElementOptions & {
  tag: K;
};

declare type Fragment = {
  start: number;
  length: number;
  end: number;
  node: Text;
  hasRuby: boolean;
};

/**
 * A Paragraph is a collection of fragments that are semantically connected.
 * Every sequence of inline elements not interrupted by a block element
 * in the source html corresponds to their own Paragraph.
 */
declare type Paragraph = Fragment[];
declare type IdentifyableParagraph = { id: number; paragraph: Paragraph };
declare type IdentifyableText = { id: number; text: string };

declare type AbortedState = { aborted: boolean };

declare type IdentifyableTextBatch = {
  sourceIndex: number;
  text: IdentifyableText;
}[];
declare type RawFurigana = (string | [kanji: string, kana: string])[];
declare type Token = [
  vocabIndex: number,
  position: number,
  length: number,
  furi: RawFurigana | null,
];
declare type ParagraphsTokens = Token[];

declare type Vocab = unknown[];

declare type JPDBParseResponse = { vocabulary: Vocab[]; tokens: ParagraphsTokens[] };
declare type ParseResponse = { paragraph: string; vocab: Vocab[]; tokens: Token[] }[];

declare type FuriganaItem = {
  kanji?: string;
  kana: string;
};
declare type Furigana = FuriganaItem[];

declare type TokenObject = {
  vocabIndex: number;
  position: number;
  length: number;
  furigana: Furigana | null;
};
// declare type
