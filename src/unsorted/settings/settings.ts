import { SettingBoolean } from './elements/setting-boolean';
import { SettingNumber } from './elements/setting-number';
import { SettingString } from './elements/setting-string';
import { SettingText } from './elements/setting-text';
import { SettingsController } from './settings-controller';

class Settings {
  constructor() {
    window.addEventListener('beforeunload', this._handleBeforeUnload, { capture: true });

    SettingsController.getInstance().unsavedChangesChanged$.subscribe(() => {
      this._updateChangesStatus();
    });

    // customElements.define('setting-number', SettingNumber);
    // customElements.define('setting-boolean', SettingBoolean);
    // customElements.define('setting-string', SettingString);
    // customElements.define('setting-text', SettingText);
    // customElements.define('setting-keybind', SettingKeybind);
  }

  private _handleBeforeUnload(event: BeforeUnloadEvent) {
    if (SettingsController.getInstance().hasUnsavedChanges) {
      event.preventDefault();
    }
  }

  private _updateChangesStatus() {
    const action: 'add' | 'remove' = SettingsController.getInstance().hasUnsavedChanges
      ? 'add'
      : 'remove';

    document.body.classList[action]('has-unsaved-changes');
  }
}

new Settings();
