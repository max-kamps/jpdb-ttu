// Common types shared across both content and background scripts
export const CURRENT_SCHEMA_VERSION = 1;
export const defaultConfig = {
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
function localStorageGet(key, fallback = null) {
    const data = localStorage.getItem(key);
    if (data === null)
        return fallback;
    try {
        return JSON.parse(data) ?? fallback;
    }
    catch {
        return fallback;
    }
}
function localStorageSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
export function migrateSchema(config) {
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
        ]) {
            config[key] = defaultConfig[key];
        }
        config.schemaVersion = 1;
    }
}
export function loadConfig() {
    const config = Object.fromEntries(Object.entries(defaultConfig).map(([key, defaultValue]) => [key, localStorageGet(key, defaultValue)]));
    config.schemaVersion = localStorageGet('schemaVersion', 0);
    migrateSchema(config);
    // If the schema version is not the current version after applying all migrations, give up and refuse to load the config.
    // Use the default as a fallback.
    if (config.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        return defaultConfig;
    }
    return config;
}
export function saveConfig(config) {
    for (const [key, value] of Object.entries(config)) {
        localStorageSet(key, value);
    }
}
