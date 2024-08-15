import { getConfiguration } from '@shared/configuration/get-configuration';
import { onBroadcast } from '@shared/broadcaster/on-broadcast';
import { IntegrationScript } from './integration-script';

export class KeybindManager extends IntegrationScript {
  /** Map of configured keybinds */
  private _keyMap: Partial<Record<FilterKeys<ConfigurationSchema, Keybind>, Keybind>> = {};
  /** Reference which can be added or removed as event listener */
  private _listener = this.handleKeydown.bind(this);

  constructor(
    private _events: FilterKeys<ConfigurationSchema, Keybind>[],
    private _extraListeners: Partial<Record<keyof LocalEvents, Keybind>> = {},
  ) {
    super();

    this.setup();
  }

  // private _events: FilterKeys<ConfigurationSchema, Keybind>[] = [
  //   'jpdbReviewNothing',
  //   'jpdbReviewSomething',
  //   'jpdbReviewHard',
  //   'jpdbReviewGood',
  //   'jpdbReviewEasy',
  //   'jpdbReviewFail',
  //   'jpdbReviewPass',
  //   'showAdvancedDialogKey',
  //   'lookupSelectionKey',
  //   'addToMiningKey',
  //   'addToBlacklistKey',
  //   'addToNeverForgetKey',
  //   'parseKey',
  //   'showPopupKey',
  // ];
  public activate(): void {
    window.addEventListener('keydown', this._listener);
    window.addEventListener('mousedown', this._listener);
  }

  public deactivate(): void {
    window.removeEventListener('keydown', this._listener);
    window.removeEventListener('mousedown', this._listener);
  }

  private async setup(): Promise<void> {
    onBroadcast('configurationUpdated', () => this.buildKeyMap());

    await this.buildKeyMap();
  }

  private async buildKeyMap(): Promise<void> {
    this._keyMap = {};

    for (const key of this._events) {
      const value = await getConfiguration(key, true);

      if (value.code) {
        this._keyMap[key] = value;
      }
    }
  }

  private handleKeydown(e: KeyboardEvent | MouseEvent): void {
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA'
    ) {
      // Ignore events on input elements! Otherwise we may interfere with typing.
      return;
    }

    let keybind = Object.keys(this._keyMap).find(
      (keybind: FilterKeys<ConfigurationSchema, Keybind>) =>
        this.checkKeybind(this._keyMap[keybind], e),
    );

    if (!keybind) {
      keybind = Object.keys(this._extraListeners).find((key: keyof LocalEvents) =>
        this.checkKeybind(this._extraListeners[key], e),
      );
    }

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
