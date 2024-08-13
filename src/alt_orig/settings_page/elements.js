import { defaultConfig } from '../background/config.js';
import { jsxCreateElement } from '../jsx.js';
import { markUnsavedChanges } from './settings.js';
export class SettingElement extends HTMLElement {
    input;
    reset;
    static get observedAttributes() {
        return ['name'];
    }
    constructor() {
        super();
        const label = (jsxCreateElement("label", { part: 'label', for: 'input' },
            jsxCreateElement("slot", null)));
        this.input = this.renderInputElem(this.getAttribute('name') ?? '');
        this.reset = (jsxCreateElement("button", { part: 'reset-button', onclick: () => {
                this.resetValue();
                markUnsavedChanges();
            } }, "Reset"));
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(jsxCreateElement("link", { rel: 'stylesheet', href: '../common.css' }), label, this.input, this.reset);
    }
    renderInputElem(_name) {
        throw Error('SettingElement subclass must implement render()');
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }
    set name(newValue) {
        this.input.name = newValue;
    }
    get name() {
        return this.input.name;
    }
    get value() {
        throw Error('SettingElement subclass must implement get value()');
    }
    set value(newValue) {
        throw Error('SettingElement subclass must implement set value(newValue)');
    }
    resetValue() {
        this.value = defaultConfig[this.name] ?? null;
    }
    valueChanged() {
        console.log('changed', this.name, 'to', this.value, '(default', defaultConfig[this.name] ?? null, ')');
        if (this.value !== (defaultConfig[this.name] ?? null)) {
            this.reset.disabled = false;
            this.reset.innerText = 'Reset';
        }
        else {
            this.reset.disabled = true;
            this.reset.innerText = 'Default';
        }
    }
}
class SettingNumber extends SettingElement {
    static get observedAttributes() {
        return ['name', 'min', 'max', 'step'];
    }
    renderInputElem(name) {
        return (jsxCreateElement("input", { part: 'input', type: 'number', name: name, oninput: () => {
                this.valueChanged();
                markUnsavedChanges();
            } }));
    }
    get min() {
        return this.input.min;
    }
    set min(newValue) {
        this.input.min = newValue;
    }
    get max() {
        return this.input.max;
    }
    set max(newValue) {
        this.input.max = newValue;
    }
    get step() {
        return this.input.step;
    }
    set step(newValue) {
        this.input.step = newValue;
    }
    get value() {
        return this.input.valueAsNumber;
    }
    set value(newValue) {
        this.input.valueAsNumber = newValue;
        this.valueChanged();
    }
}
class SettingBoolean extends SettingElement {
    renderInputElem(name) {
        return (jsxCreateElement("input", { part: 'input', type: 'checkbox', name: name, oninput: () => {
                this.valueChanged();
                markUnsavedChanges();
            } }));
    }
    get value() {
        return this.input.checked;
    }
    set value(newValue) {
        this.input.checked = newValue;
        this.valueChanged();
    }
}
class SettingToken extends SettingElement {
    renderInputElem(name) {
        return (jsxCreateElement("input", { part: 'input', type: 'text', name: name, oninput: () => {
                this.valueChanged();
                markUnsavedChanges();
            } }));
    }
    get value() {
        return this.input.value ?? '';
    }
    set value(newValue) {
        this.input.value = newValue ?? '';
        this.valueChanged();
    }
}
class SettingDeckId extends SettingElement {
    renderInputElem(name) {
        return (jsxCreateElement("input", { part: 'input', type: 'text', name: name, pattern: '\\d+|forq|blacklist|never-forget', oninput: () => {
                this.valueChanged();
                markUnsavedChanges();
            } }));
    }
    get value() {
        const n = parseInt(this.input.value);
        return isNaN(n) ? this.input.value || null : n;
    }
    set value(newValue) {
        this.input.value = newValue === null ? '' : newValue.toString();
        this.valueChanged();
    }
}
class SettingString extends SettingElement {
    renderInputElem(name) {
        return (jsxCreateElement("textarea", { part: 'input', name: name, rows: 8, oninput: () => {
                this.valueChanged();
                markUnsavedChanges();
            } }));
    }
    get value() {
        return this.input.value;
    }
    set value(newValue) {
        this.input.value = newValue;
        this.valueChanged();
    }
    valueChanged() {
        super.valueChanged();
        // Resize to fit all rows
        this.input.rows = this.input.value.split(/\n/g).length;
    }
}
const MODIFIERS = ['Control', 'Alt', 'AltGraph', 'Meta', 'Shift'];
const MOUSE_BUTTONS = ['Left Mouse Button', 'Middle Mouse Button', 'Right Mouse Button'];
function keybindToString(bind) {
    return bind === null ? 'None' : `${bind.key} (${[...bind.modifiers, bind.code].join('+')})`;
}
class SettingKeybind extends SettingElement {
    #value = null;
    static active;
    renderInputElem(name) {
        return (jsxCreateElement("button", { part: 'input', name: name, onmousedown: event => {
                event.preventDefault();
                event.stopPropagation();
                this.chooseKey();
            } }, "Loading..."));
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
            const modifiers = MODIFIERS.filter(name => name !== key && event.getModifierState(name));
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
