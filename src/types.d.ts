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
};
