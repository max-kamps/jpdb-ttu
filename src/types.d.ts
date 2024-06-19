/// <reference types="chrome-types" />

declare type Filter<T, TF extends T[keyof T]> = keyof {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};

declare type Keybind = { key: string; code: string; modifiers: string[] };

declare type AnkiFieldTemplateName = 'sentence' | 'sentenceSanitized';
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

declare type Configuration = {
  schemaVersion: number;
  apiToken: string;
  ankiUrl: string;
  ankiProxyUrl: string;
  miningConfig: DeckConfiguration;
  blacklistConfig: DeckConfiguration;
  neverForgetConfig: DeckConfiguration;
  readonlyConfigs: DeckConfiguration[];
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
