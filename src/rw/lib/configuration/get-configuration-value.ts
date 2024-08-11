type NumberKeys = Filter<Configuration, number>[];
type BooleanKeys = Filter<Configuration, boolean>[];
type ObjectKeys = Filter<
  Configuration,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];

const numberKeys: NumberKeys = ['schemaVersion', 'contextWidth'];
const booleanKeys: BooleanKeys = ['showPopupOnHover', 'touchscreenSupport', 'disableFadeAnimation'];
const objectKeys: ObjectKeys = [
  'showPopupKey',
  'miningConfig',
  'blacklistConfig',
  'neverForgetConfig',
  'readonlyConfigs',
];

const readStorage = async (key: string, defaultValue?: string): Promise<string> => {
  const result = await chrome.storage.local.get(key);

  return ((result?.[key] ?? defaultValue) as string) ?? undefined;
};

export const getConfigurationValue = async <K extends keyof Configuration>(
  key: K,
  defaultValue?: Configuration[K],
): Promise<Configuration[K]> => {
  const value: string = await readStorage(key, defaultValue?.toString());

  if (numberKeys.includes(key as Filter<Configuration, number>)) {
    return parseInt(value, 10) as Configuration[K];
  }

  if (booleanKeys.includes(key as Filter<Configuration, boolean>)) {
    return (value === 'true') as Configuration[K];
  }

  if (objectKeys.includes(key as Filter<Configuration, Keybind>)) {
    try {
      return JSON.parse(value) as Configuration[K];
    } catch {
      // Catch broken persisted values and return the default value
      return defaultValue as Configuration[K];
    }
  }

  return value as Configuration[K];
};
