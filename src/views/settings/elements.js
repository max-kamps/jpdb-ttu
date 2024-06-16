import { defaultConfig } from '../../background/config.js';
import { jsxCreateElement } from '../../jsx.js';
import { markUnsavedChanges } from './settings.js';

const MODIFIERS = ['Control', 'Alt', 'AltGraph', 'Meta', 'Shift'];
const MOUSE_BUTTONS = ['Left Mouse Button', 'Middle Mouse Button', 'Right Mouse Button'];
function keybindToString(bind) {
  return bind === null ? 'None' : `${bind.key} (${[...bind.modifiers, bind.code].join('+')})`;
}
class SettingKeybind extends SettingElement {
  #value = null;
  static active;
  renderInputElem(name) {
    return jsxCreateElement(
      'button',
      {
        part: 'input',
        name: name,
        onmousedown: (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.chooseKey();
        },
      },
      'Loading...',
    );
  }
  chooseKey() {
    if (SettingKeybind.active) {
      // If there's currently another SettingKeybind waiting for input, stop it
      const [other, listener] = SettingKeybind.active;
      other.input.innerText = keybindToString(other.#value);
      document.removeEventListener('keydown', listener);
      document.removeEventListener('keyup', listener);
      document.removeEventListener('mousedown', listener);
      if (other === this) {
        SettingKeybind.active = undefined;
        return;
      }
    }
    const keyListener = (event) => {
      event.preventDefault();
      event.stopPropagation();
      // We ignore the keydown event for modifiers, and only register them on keyup.
      // This allows pressing and holding modifiers before pressing the main hotkey.
      if (event.type === 'keydown' && MODIFIERS.includes(event.key)) {
        return;
      }
      // .code: Layout-independent key identifier (usually equal to whatever that key means in qwerty)
      // .key: Key character in the current layout (respecting modifiers like shift or altgr)
      // .button: Mouse button number
      const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;
      const key = event instanceof KeyboardEvent ? event.key : MOUSE_BUTTONS[event.button] ?? code;
      const modifiers = MODIFIERS.filter((name) => name !== key && event.getModifierState(name));
      this.#value = code === 'Escape' ? null : { key, code, modifiers };
      this.input.innerText = keybindToString(this.#value);
      markUnsavedChanges();
      this.valueChanged();
      SettingKeybind.active = undefined;
      document.removeEventListener('keydown', keyListener);
      document.removeEventListener('keyup', keyListener);
      document.removeEventListener('mousedown', keyListener);
    };
    this.input.innerText = 'Press a key, click to cancel';
    document.addEventListener('keydown', keyListener);
    document.addEventListener('keyup', keyListener);
    document.addEventListener('mousedown', keyListener);
    SettingKeybind.active = [this, keyListener];
  }
  get value() {
    return this.#value;
  }
  set value(newValue) {
    this.#value = newValue;
    this.input.innerText = keybindToString(newValue);
    this.valueChanged();
  }
}
export function defineCustomElements() {
  customElements.define('setting-number', SettingNumber);
  customElements.define('setting-boolean', SettingBoolean);
  customElements.define('setting-token', SettingToken);
  customElements.define('setting-deck-id', SettingDeckId);
  customElements.define('setting-string', SettingString);
  customElements.define('setting-keybind', SettingKeybind);
  document.body.classList.add('ready');
}
