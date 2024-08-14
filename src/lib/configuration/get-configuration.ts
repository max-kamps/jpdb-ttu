import { DEFAULT_CONFIGURATION } from './default-configuration';
import { readStorage } from '@lib/extension/read-storage';

type NumberKeys = FilterKeys<ConfigurationSchema, number>[];
type BooleanKeys = FilterKeys<ConfigurationSchema, boolean>[];
type ObjectKeys = FilterKeys<
  ConfigurationSchema,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];

const NUMBER_KEYS: NumberKeys = ['schemaVersion', 'contextWidth'];
const BOOLEAN_KEYS: BooleanKeys = [
  'jpdbAddToForq',
  'jpdbUseTwoGrades',
  'enableAnkiIntegration',
  'showPopupOnHover',
  'touchscreenSupport',
  'disableFadeAnimation',
];
const OBJECT_KEYS: ObjectKeys = [
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

export const getConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
  fetchDefault?: boolean,
): Promise<ConfigurationSchema[K]> => {
  const defaultValue = fetchDefault ? DEFAULT_CONFIGURATION[key] : undefined;
  const value: string = await readStorage(key, defaultValue?.toString());

  if (NUMBER_KEYS.includes(key as FilterKeys<ConfigurationSchema, number>)) {
    return parseInt(value, 10) as ConfigurationSchema[K];
  }

  if (BOOLEAN_KEYS.includes(key as FilterKeys<ConfigurationSchema, boolean>)) {
    return (value === 'true') as ConfigurationSchema[K];
  }

  if (OBJECT_KEYS.includes(key as FilterKeys<ConfigurationSchema, Keybind>)) {
    try {
      return JSON.parse(value) as ConfigurationSchema[K];
    } catch {
      // Catch broken persisted values and return the default value
      return defaultValue as ConfigurationSchema[K];
    }
  }

  return value as ConfigurationSchema[K];
};
