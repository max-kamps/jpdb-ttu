/// <reference types="chrome-types" />

declare type Configuration = {
  schemaVersion: number;
  apiToken: string;
  ankiUrl: string;
  miningDeckId: string;
  blacklistDeckId: string;
  neverForgetDeckId: string;
  contextWidth: number;
  customWordCSS: string;
  customPopupCSS: string;
  showPopupOnHover: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;
  showPopupKey: string;
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
