import { DeckConfiguration, DiscoverWordConfiguration } from '@shared/anki';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type ConfigurationSchema = {
  schemaVersion: number;
  jpdbApiToken: string;
  jpdbMiningDeck: string;
  jpdbBlacklistDeck: string;
  jpdbForqDeck: string;
  jpdbNeverForgetDeck: string;
  jpdbAddToForq: boolean;
  jpdbUseTwoGrades: boolean;
  jpdbRotateFlags: boolean;
  jpdbReviewNothing: Keybind;
  jpdbReviewSomething: Keybind;
  jpdbReviewHard: Keybind;
  jpdbReviewGood: Keybind;
  jpdbReviewEasy: Keybind;
  jpdbReviewFail: Keybind;
  jpdbReviewPass: Keybind;
  jpdbRotateForward: Keybind;
  jpdbRotateBackward: Keybind;

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
