import { DeckId } from './types.js';
import { EnsureJson } from './util.js';
import { browser } from './webextension.js';

export const CURRENT_SCHEMA_VERSION = 1;

export type Keybind = { key: string; code: string; modifiers: string[] } | null;
export type Config = EnsureJson<{
    schemaVersion: number;

    apiToken: string | null;

    miningDeckId: DeckId | null;
    forqDeckId: DeckId | null;
    blacklistDeckId: DeckId | null;
    neverForgetDeckId: DeckId | null;

    contextWidth: number;
    forqOnMine: boolean;

    customWordCSS: string;
    customPopupCSS: string;

    showPopupOnHover: boolean;
    touchscreenSupport: boolean;
    disableFadeAnimation: boolean;

    showPopupKey: Keybind;
    addKey: Keybind;
    dialogKey: Keybind;
    blacklistKey: Keybind;
    neverForgetKey: Keybind;
    nothingKey: Keybind;
    somethingKey: Keybind;
    hardKey: Keybind;
    goodKey: Keybind;
    easyKey: Keybind;
}>;

export const defaultConfig: Config = {
    schemaVersion: CURRENT_SCHEMA_VERSION,

    apiToken: null,

    miningDeckId: null,
    forqDeckId: 'forq',
    blacklistDeckId: 'blacklist',
    neverForgetDeckId: 'never-forget',
    contextWidth: 1,
    forqOnMine: true,

    customWordCSS: '',
    customPopupCSS: '',

    showPopupOnHover: false,
    touchscreenSupport: false,
    disableFadeAnimation: false,

    showPopupKey: { key: 'Shift', code: 'ShiftLeft', modifiers: [] },
    addKey: null,
    dialogKey: null,
    blacklistKey: null,
    neverForgetKey: null,
    nothingKey: null,
    somethingKey: null,
    hardKey: null,
    goodKey: null,
    easyKey: null,
};

// The following complicated incantation allows us simpler syntax for accessing config values.
// Getting mulitple properties at once is easily supported by the webextension storage API:
//    const { apiToken, miningDeckId } = await config.get('apiToken', 'miningDeckId');
// However, if we want to access a single value in an expression, we have to do this:
//    console.log((await config.get('apiToken')).apiToken);
// The repetition and parentheses make this rather verbose. By using a Proxy, we can allow this instead:
//    console.log(await config.apiToken);
// Much nicer!

// Methods for explicitly getting or setting the config values
type ConfigAccessor = typeof configAccessor;
const configAccessor = {
    get<Keys extends keyof Config>(...keys: Keys[]): Promise<Pick<Config, Keys>> {
        return browser.storage.local.get(Object.fromEntries(keys.map(key => [key, defaultConfig[key]]))) as any;
    },
    set(items: Partial<Config>): Promise<void> {
        return browser.storage.local.set(items);
    },
};

// Config where every property is a promise. This is what we will fake with the Proxy.
type PromisedConfig = { [key in keyof Config]: Promise<Config[key]> };

// And here's the Proxy
export const config: ConfigAccessor & PromisedConfig = new Proxy(configAccessor, {
    get(target, prop: keyof ConfigAccessor | keyof Config) {
        if (Object.hasOwn(target, prop)) {
            // prop is one of the accessor properties, like `get` or `set`
            return target[prop as keyof ConfigAccessor];
        } else {
            // prop is one of the config properties. We want to return a promise for the value.
            return target.get(prop as keyof Config).then(values => values[prop as keyof Config]);
        }
    },
}) as any;

export function migrateSchema(config: Config) {
    if (config.schemaVersion === 0) {
        // Keybinds changed from string to object
        // We don't have all the information required to turn them into objects
        // Just delete them and let users re-enter them
        for (const key of [
            'showPopupKey',
            'blacklistKey',
            'neverForgetKey',
            'nothingKey',
            'somethingKey',
            'hardKey',
            'goodKey',
            'easyKey',
        ] as const) {
            config[key] = defaultConfig[key];
        }

        config.schemaVersion = 1;
    }
}

// export function loadConfig(): Config {
//     const config = Object.fromEntries(
//         Object.entries(defaultConfig).map(([key, defaultValue]) => [key, localStorageGet(key, defaultValue)]),
//     ) as Config;

//     config.schemaVersion = localStorageGet('schemaVersion', 0);
//     migrateSchema(config);

//     // If the schema version is not the current version after applying all migrations, give up and refuse to load the config.
//     // Use the default as a fallback.
//     if (config.schemaVersion !== CURRENT_SCHEMA_VERSION) {
//         return defaultConfig;
//     }

//     return config;
// }

// export function saveConfig(config: Config) {
//     for (const [key, value] of Object.entries(config)) {
//         localStorageSet(key, value);
//     }
// }
