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
  disablePopupAutoClose: boolean;
  hideProgressBar: boolean;
  hideVocabOSuccessfulGrade: boolean;
  disable2DReviewing: boolean;

  disableJPDBAutoParsing: boolean;
  gradeButtonsAtBottom: boolean;
  moveLinksToPopup: boolean;
  prioritizePopupAboveWord: boolean;
  prioritizePopupToRightOfWord: boolean;

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

  customWordCSS: `/***** On by default *****
These are easily editable or deletable styling options that I'm leaving on by default and think others would like too.
Feel free to delete them or surround the options you don't want with /* and */

/***** Don't change colors for known, blacklisted, or unparsed words *****
 * This keeps all colors for JPDB.io pages (for 2D reviewing etc.)  */

.jpdb-word.known:not(div.vocabulary-list .jpdb-word.known) { color: inherit }
.jpdb-word.blacklisted:not(div.vocabulary-list .jpdb-word.blacklisted) { color: inherit }
.jpdb-word.unparsed:not(div.vocabulary-list .jpdb-word.unparsed) { color: inherit }

/***** Dim known vocab in JPDB *****/

.vocabulary-list .entry:has(.known),
.vocabulary-list .entry:has(.learning) { opacity: 0.25 }

/***** Black screen for OLED on JPDB *****/

html.dark-mode, html.dark-mode body {
  background-color: black !important
}

/***** Hide furigana on known/learning words unless hovering *****/

.jpdb-word.known:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.learning:not(:hover) .jpdb-furi { visibility: hidden; }
.jpdb-word.due .jpdb-furi { visibility: hidden; }
.jpdb-word.failed .jpdb-furi { visibility: hidden; }


/**** Ideas & Options *****
 * Remove the slash+asterisks surrounding the code parts below to enable experimental styling ideas.
 * These are all off by default! */

/***** Make parsed-text colors more visible on grayscale displays (super ugly though) *****/
/*
.jpdb-word.new { color: #18FFFF}
.jpdb-word.not-in-deck { color: #40C4FF }
.jpdb-word.known { color: #1B5E20 }
.jpdb-word.learning { color: #33691E }
.jpdb-word.due { color: #FFD180 }
.jpdb-word.failed { color: #FF8A80 }
.jpdb-word.unparsed { color: #616161 }
.jpdb-word.blacklisted { color:  #616161 }
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

button { padding:20px 10px; font-size: 14px; flex-grow:1 }
#mine-buttons button { padding: 10px 0; }
article { max-height: 50vh }


/* Hide never forget and edit buttons */

button.edit-add-review,button.never-forget { display:none; }`,

  showPopupOnHover: false,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  disableExtraSpace: false,
  disablePopupAutoClose: false,
  hideVocabOSuccessfulGrade: false,
  hideProgressBar: false,

  disable2DReviewing: false,
  disableJPDBAutoParsing: false,

  moveLinksToPopup: true,
  gradeButtonsAtBottom: true,
  prioritizePopupAboveWord: true,
  prioritizePopupToRightOfWord: true,

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
