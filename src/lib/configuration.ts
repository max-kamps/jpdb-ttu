import { browser } from './browser';

type Filter<T, TF extends T[keyof T]> = keyof {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};

type NumberKeys = Filter<ConfigurationSchema, number>[];
type BooleanKeys = Filter<ConfigurationSchema, boolean>[];
type ObjectKeys = Filter<
  ConfigurationSchema,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];

class Configuration {
  private NUMBER_KEYS: NumberKeys = ['schemaVersion', 'contextWidth'];
  private BOOLEAN_KEYS: BooleanKeys = [
    'jpdbAddToForq',
    'jpdbUseTwoGrades',
    'enableAnkiIntegration',
    'showPopupOnHover',
    'touchscreenSupport',
    'disableFadeAnimation',
  ];
  private OBJECT_KEYS: ObjectKeys = [
    'jpdbReviewNothing',
    'jpdbReviewSomething',
    'jpdbReviewHard',
    'jpdbReviewGood',
    'jpdbReviewEasy',
    'jpdbReviewFail',
    'jpdbReviewPass',
    'ankiMiningConfig',
    'ankiBlacklistConfig',
    'ankiNeverForgetConfig',
    'ankiReadonlyConfigs',
    'parseKey',
    'showPopupKey',
    'showAdvancedDialogKey',
    'lookupSelectionKey',
    'addToMiningKey',
    'addToBlacklistKey',
    'addToNeverForgetKey',
  ];

  public readonly DEFAULTS: ConfigurationSchema = {
    schemaVersion: 1,

    jpdbApiToken: '',
    jpdbMiningDeck: '',
    jpdbBlacklistDeck: '',
    jpdbForqDeck: '',
    jpdbNeverForgetDeck: '',
    jpdbAddToForq: false,
    jpdbUseTwoGrades: false,
    jpdbReviewNothing: { key: '', code: '', modifiers: [] },
    jpdbReviewSomething: { key: '', code: '', modifiers: [] },
    jpdbReviewHard: { key: '', code: '', modifiers: [] },
    jpdbReviewGood: { key: '', code: '', modifiers: [] },
    jpdbReviewEasy: { key: '', code: '', modifiers: [] },
    jpdbReviewFail: { key: '', code: '', modifiers: [] },
    jpdbReviewPass: { key: '', code: '', modifiers: [] },

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

    parseKey: { key: 'P', code: 'KeyP', modifiers: ['Control', 'Shift'] },
    showPopupKey: { key: 'Shift', code: 'ShiftLeft', modifiers: [] },
    showAdvancedDialogKey: { key: '', code: '', modifiers: [] },
    lookupSelectionKey: { key: 'L', code: 'KeyL', modifiers: ['Control', 'Shift'] },
    addToMiningKey: { key: '', code: '', modifiers: [] },
    addToBlacklistKey: { key: '', code: '', modifiers: [] },
    addToNeverForgetKey: { key: '', code: '', modifiers: [] },

    customWordCSS: '',
    customPopupCSS: '',
  };

  public async get<K extends keyof ConfigurationSchema>(
    key: K,
    defaultValue?: ConfigurationSchema[K],
  ): Promise<ConfigurationSchema[K]> {
    const value: string = await browser.readStorage(key, defaultValue?.toString());

    if (this.NUMBER_KEYS.includes(key as Filter<ConfigurationSchema, number>)) {
      return parseInt(value, 10) as ConfigurationSchema[K];
    }

    if (this.BOOLEAN_KEYS.includes(key as Filter<ConfigurationSchema, boolean>)) {
      return (value === 'true') as ConfigurationSchema[K];
    }

    if (this.OBJECT_KEYS.includes(key as Filter<ConfigurationSchema, Keybind>)) {
      try {
        return JSON.parse(value) as ConfigurationSchema[K];
      } catch {
        // Catch broken persisted values and return the default value
        return defaultValue as ConfigurationSchema[K];
      }
    }

    return value as ConfigurationSchema[K];
  }

  public async getOrDefault<K extends keyof ConfigurationSchema>(
    key: K,
  ): Promise<ConfigurationSchema[K]> {
    return this.get(key, this.DEFAULTS[key]);
  }

  public async set<K extends keyof ConfigurationSchema>(
    key: K,
    value: ConfigurationSchema[K],
  ): Promise<void> {
    await browser.writeStorage(
      key,
      typeof value === 'object' ? JSON.stringify(value) : value.toString(),
    );
  }
}

export const configuration = new Configuration();
