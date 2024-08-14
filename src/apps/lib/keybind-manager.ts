import { getConfiguration } from '@lib/configuration/get-configuration';
import { onBroadcast } from '@lib/broadcaster/on-broadcast';
import { IntegrationScript } from './integration-script';

export class KeybindManager extends IntegrationScript {
  //#region Singleton
  private static _instance: KeybindManager;
  public static getInstance(): KeybindManager {
    if (!KeybindManager._instance) {
      KeybindManager._instance = new KeybindManager();
    }

    return KeybindManager._instance;
  }

  private constructor() {
    super();

    this.setup();
  }
  //#endregion

  private _events: FilterKeys<ConfigurationSchema, Keybind>[] = [
    'jpdbReviewNothing',
    'jpdbReviewSomething',
    'jpdbReviewHard',
    'jpdbReviewGood',
    'jpdbReviewEasy',
    'jpdbReviewFail',
    'jpdbReviewPass',
    'showAdvancedDialogKey',
    'lookupSelectionKey',
    'addToMiningKey',
    'addToBlacklistKey',
    'addToNeverForgetKey',
    'parseKey',
    'showPopupKey',
  ];

  private _keyMap: Partial<Record<FilterKeys<ConfigurationSchema, Keybind>, Keybind>> = {};

  private async setup(): Promise<void> {
    onBroadcast('configuration-updated', () => this.buildKeyMap());

    await this.buildKeyMap();
    this.installGlobalListeners();
  }

  private async buildKeyMap(): Promise<void> {
    const isAnkiEnabled = await getConfiguration('enableAnkiIntegration', true);
    const keys = isAnkiEnabled
      ? this._events.filter((event) => !event.startsWith('jpdb'))
      : this._events;

    this._keyMap = {};

    for (const key of keys) {
      const value = await getConfiguration(key, true);

      if (value.code) {
        this._keyMap[key] = value;
      }
    }
  }

  private installGlobalListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeydown(e));
    window.addEventListener('mousedown', (e) => this.handleKeydown(e));
  }

  private handleKeydown(e: KeyboardEvent | MouseEvent): void {
    const keybind = Object.keys(this._keyMap).find(
      (keybind: FilterKeys<ConfigurationSchema, Keybind>) =>
        this.checkKeybind(this._keyMap[keybind], e),
    );

    if (keybind) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      this.emit(keybind as FilterKeys<ConfigurationSchema, Keybind>, e);
    }
  }

  private checkKeybind(keybind: Keybind, event: KeyboardEvent | MouseEvent): boolean {
    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;

    return code === keybind.code && keybind.modifiers.every((name) => event.getModifierState(name));
  }
}
