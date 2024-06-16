import { SettingBoolean } from './elements/setting-boolean';
import { SettingNumber } from './elements/setting-number';
import { SettingString } from './elements/setting-string';
import { SettingText } from './elements/setting-text';

class Settings {
  private _hasUnsavedChanges: boolean = false;

  constructor() {
    window.addEventListener('beforeunload', this._handleBeforeUnload, { capture: true });

    customElements.define('setting-number', SettingNumber);
    customElements.define('setting-boolean', SettingBoolean);
    customElements.define('setting-string', SettingString);
    customElements.define('setting-text', SettingText);
    // customElements.define('setting-keybind', SettingKeybind);
  }

  private _handleBeforeUnload(event: BeforeUnloadEvent) {
    console.log('beforeunload');
    if (this._hasUnsavedChanges) {
      event.preventDefault();
    }
  }

  private _setHasUnsavedChanges(value: boolean) {
    this._hasUnsavedChanges = value;
    this._updateChangesStatus();
  }

  private _updateChangesStatus() {
    const action: 'add' | 'remove' = this._hasUnsavedChanges ? 'add' : 'remove';

    document.body.classList[action]('has-unsaved-changes');
  }
}

Object.assign(window, { settings: new Settings() });
