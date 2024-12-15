import { ConfigurationSchema } from '@shared/configuration';

export const DEFAULT_CONFIGURATION = Object.freeze<ConfigurationSchema>({
  schemaVersion: 1,

  jpdbApiToken: '',
  jpdbMiningDeck: '',
  jpdbBlacklistDeck: '',
  jpdbForqDeck: '',
  jpdbNeverForgetDeck: '',
  jpdbAddToForq: false,
  jpdbUseTwoGrades: false,
  jpdbRotateFlags: false,
  jpdbReviewNothing: { key: '', code: '', modifiers: [] },
  jpdbReviewSomething: { key: '', code: '', modifiers: [] },
  jpdbReviewHard: { key: '', code: '', modifiers: [] },
  jpdbReviewGood: { key: '', code: '', modifiers: [] },
  jpdbReviewEasy: { key: '', code: '', modifiers: [] },
  jpdbReviewFail: { key: '', code: '', modifiers: [] },
  jpdbReviewPass: { key: '', code: '', modifiers: [] },
  jpdbRotateForward: { key: '', code: '', modifiers: [] },
  jpdbRotateBackward: { key: '', code: '', modifiers: [] },

  enableAnkiIntegration: false,
  ankiUrl: 'http://localhost:8765',
  ankiProxyUrl: '',
  ankiMiningConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiBlacklistConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiNeverForgetConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiReadonlyConfigs: [],

  contextWidth: 1,

  showPopupOnHover: true,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  parseKey: { key: 'P', code: 'KeyP', modifiers: ['Alt'] },
  showPopupKey: { key: 'Left Mouse Button', code: 'Mouse0', modifiers: ['Shift'] },
  showAdvancedDialogKey: { key: '', code: '', modifiers: [] },
  lookupSelectionKey: { key: 'L', code: 'KeyL', modifiers: ['Alt'] },
  addToMiningKey: { key: '', code: '', modifiers: [] },
  addToBlacklistKey: { key: '', code: '', modifiers: [] },
  addToNeverForgetKey: { key: '', code: '', modifiers: [] },

  customWordCSS: '',
  customPopupCSS: '',
});
