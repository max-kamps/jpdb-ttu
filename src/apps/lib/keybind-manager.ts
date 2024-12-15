import { getConfiguration, ConfigurationSchema, Keybind } from '@shared/configuration';
import { onBroadcastMessage } from '@shared/messages';
import { FilterKeys } from '@shared/types';
import { IntegrationScript } from './integration-script';

export class KeybindManager extends IntegrationScript {
  /** Map of configured keybinds */
  private _keyMap: Partial<Record<FilterKeys<ConfigurationSchema, Keybind>, Keybind>> = {};
  /** Reference which can be added or removed as event listener */
  private _listener = this.handleKeydown.bind(this) as (e: KeyboardEvent | MouseEvent) => void;

  constructor(private _events: FilterKeys<ConfigurationSchema, Keybind>[]) {
    super();

    void this.setup();
  }

  public addKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild?: false,
  ): Promise<void>;
  public addKeys(keys: FilterKeys<ConfigurationSchema, Keybind>[], skipBuild: true): void;

  public addKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild = false,
  ): void | Promise<void> {
    this._events = [...new Set([...this._events, ...keys])];

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public async removeKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild?: false,
  ): Promise<void>;
  public removeKeys(keys: FilterKeys<ConfigurationSchema, Keybind>[], skipBuild: true): void;

  public removeKeys(
    keys: FilterKeys<ConfigurationSchema, Keybind>[],
    skipBuild = false,
  ): void | Promise<void> {
    this._events = this._events.filter((key) => !keys.includes(key));

    if (!skipBuild) {
      return this.buildKeyMap();
    }
  }

  public activate(): void {
    window.addEventListener('keydown', this._listener);
    window.addEventListener('mousedown', this._listener);
  }

  public deactivate(): void {
    window.removeEventListener('keydown', this._listener);
    window.removeEventListener('mousedown', this._listener);
  }

  private async setup(): Promise<void> {
    onBroadcastMessage('configurationUpdated', () => this.buildKeyMap());

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

  private checkKeybind(keybind: Keybind | undefined, event: KeyboardEvent | MouseEvent): boolean {
    if (!keybind) {
      return false;
    }

    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;

    return code === keybind.code && keybind.modifiers.every((name) => event.getModifierState(name));
  }
}
