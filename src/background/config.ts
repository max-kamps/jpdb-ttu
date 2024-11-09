import { DeckId } from '../types.js';

export type Keybind = { key: string; code: string; modifiers: string[] } | null;
// Common types shared across both content and background scripts

export const CURRENT_SCHEMA_VERSION = 1;

export type Config = {
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

  disableExtraSpace: boolean;
  disable2DReviewing: boolean;
  disableJPDBAutoParsing: boolean;

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
};

export const defaultConfig: Config = {
  schemaVersion: CURRENT_SCHEMA_VERSION,

  apiToken: null,

  miningDeckId: null,
  forqDeckId: 'forq',
  blacklistDeckId: 'blacklist',
  neverForgetDeckId: 'never-forget',
  contextWidth: 1,
  forqOnMine: true,

  customWordCSS: `/**** Ideas & Options *****
Remove the slash+asterisks surrounding the code parts below to enable experimental styling ideas
I personally use but don't want to enable by default or add as full-on options */
  
/***** Hide furigana on known/learning words unless hovering *****/
/*
.jpdb-word.known:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.learning:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.due .jpdb-furi { visibility: hidden; }
.jpdb-word.failed .jpdb-furi { visibility: hidden; }
*/

/***** ttsu reader dark mode (white text) colors *****/
/* Change "white" to "black" for light mode (black text) colors */
/*
.w-full.h-full .jpdb-word.known { color: white }
.w-full.h-full .jpdb-word.blacklisted { color:  white }
.w-full.h-full .jpdb-word.unparsed { color: white }
*/

/***** Black screen for OLED on JPDB *****/
/*
html.dark-mode, html.dark-mode body {
  background-color: black !important
}
*/

/***** E-ink screen new word visibility border - horizontal text version *****/
/*
.jpdb-word.new { border-bottom: 2px solid }
.jpdb-word.not-in-deck { border-bottom: 2px dashed }
*/

/***** E-ink screen new word visibility border - vertical text version *****/
/*
.jpdb-word.new{ border-left: 2px solid }
.jpdb-word.not-in-deck{ border-left: 2px dashed }
*/`,

  customPopupCSS: `/* Make review/mining buttons bigger for mobile */
/*
button { padding:20px 0; font-size: 14px; flex-grow:1 }
#mine-buttons button { padding: 10px 0; }
article { max-height: 50vh }
*/

/* Hide never forget and edit buttons */
/*
button.edit-add-review,button.never-forget { display:none; }
*/`,

  showPopupOnHover: false,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  disableExtraSpace: false,
  disable2DReviewing: false,
  disableJPDBAutoParsing: false,

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

function localStorageGet(key: string, fallback: any = null): any {
  const data = localStorage.getItem(key);
  if (data === null) return fallback;

  try {
    return JSON.parse(data) ?? fallback;
  } catch {
    return fallback;
  }
}

function localStorageSet(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

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

export function loadConfig(): Config {
  console.log('LOADING CONFIG');
  const config = Object.fromEntries(
    Object.entries(defaultConfig).map(([key, defaultValue]) => [key, localStorageGet(key, defaultValue)]),
  ) as Config;

  config.schemaVersion = localStorageGet('schemaVersion', 0);
  migrateSchema(config);

  // If the schema version is not the current version after applying all migrations, give up and refuse to load the config.
  // Use the default as a fallback.
  if (config.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return defaultConfig;
  }

  console.log(config);
  return config;
}

export function saveConfig(config: Config) {
  for (const [key, value] of Object.entries(config)) {
    localStorageSet(key, value);
  }
}
