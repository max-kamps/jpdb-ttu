import { browser } from '@lib/browser';
import { view } from '@lib/view';

const observedAttributes = ['value', 'name'] as const;
type ObservedAttributes = (typeof observedAttributes)[number];

export class HTMLKeybindInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;

  protected static active?: HTMLKeybindInputElement;
  protected static MODIFIERS = ['Control', 'Alt', 'AltGraph', 'Meta', 'Shift'];
  protected static MOUSE_BUTTONS = [
    'Left Mouse Button',
    'Middle Mouse Button',
    'Right Mouse Button',
  ];

  protected _shadow: ShadowRoot;
  protected _input: HTMLInputElement;
  protected _button: HTMLInputElement = view.createElement('input', {
    class: ['outline'],
    attributes: { type: 'button' },
    style: { width: '100%', marginBottom: '0' },
  });

  public get value(): Keybind {
    return JSON.parse(this.getAttribute('value'));
  }
  public set value(value: Keybind) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name');
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });

    this.installStyles();

    this.buildInputElements();
    this.buildDOM();
  }

  public attributeChangedCallback(name: ObservedAttributes, oldValue: unknown, newValue: unknown) {
    const pascalCaseName = name.replace(/(^\w|-\w)/g, (a) => a.replace(/-/, '').toUpperCase());
    const functionName = `on${pascalCaseName}Changed`;
    const changeHandler = this[functionName as keyof this] as
      | ((oldValue: unknown, newValue: unknown) => void | Promise<void>)
      | undefined;

    if (changeHandler) {
      changeHandler.apply(this, [oldValue, newValue]);
    }
  }

  protected installStyles() {
    ['styles/theme', 'styles/common', 'views/settings'].forEach((style) => {
      this._shadow.appendChild(
        view.createElement('link', {
          attributes: {
            rel: 'stylesheet',
            href: browser.styleUrl(style),
          },
        }),
      );
    });
  }

  protected buildInputElements() {
    this._input = view.createElement('input', {
      attributes: {
        type: 'hidden',
        name: this.name,
      },
    });

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value);

      this.dispatchEvent(new Event('change'));
    });

    // We use mousedown instead of click to allow the left mouse button being used as keybind.
    // If we would use click, the event propagation cannot be stopped and the button would activate again immediately after the keybind was chosen.
    this._button.addEventListener('mousedown', (event) => this.initChooseKey(event));
  }

  protected buildDOM() {
    this._shadow.appendChild(this._input);
    this._shadow.appendChild(this._button);
  }

  protected initChooseKey(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (HTMLKeybindInputElement.active) {
      if (HTMLKeybindInputElement.active !== this) {
        HTMLKeybindInputElement.active.deactivate();

        return this.activate();
      }

      return;
    }

    if (event.button !== 0) {
      return;
    }

    this.activate();
  }

  protected activate() {
    this._button.value = 'Press a key, escape to cancel';

    document.addEventListener('keydown', HTMLKeybindInputElement.keyListener);
    document.addEventListener('keyup', HTMLKeybindInputElement.keyListener);
    document.addEventListener('mousedown', HTMLKeybindInputElement.keyListener);

    HTMLKeybindInputElement.active = this;
  }

  protected deactivate() {
    this._button.value = this.keybindToString(this.value);

    document.removeEventListener('keydown', HTMLKeybindInputElement.keyListener);
    document.removeEventListener('keyup', HTMLKeybindInputElement.keyListener);
    document.removeEventListener('mousedown', HTMLKeybindInputElement.keyListener);

    HTMLKeybindInputElement.active = undefined;
  }

  protected static keyListener(event: KeyboardEvent | MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // We ignore the keydown event for modifiers, and only register them on keyup.
    // This allows pressing and holding modifiers before pressing the main hotkey.
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      HTMLKeybindInputElement.MODIFIERS.includes(event.key)
    ) {
      return;
    }

    // .code: Layout-independent key identifier (usually equal to whatever that key means in qwerty)
    // .key: Key character in the current layout (respecting modifiers like shift or altgr)
    // .button: Mouse button number
    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;
    const key =
      event instanceof KeyboardEvent
        ? event.key
        : HTMLKeybindInputElement.MOUSE_BUTTONS[event.button] ?? code;
    const modifiers = HTMLKeybindInputElement.MODIFIERS.filter(
      (name) => name !== key && event.getModifierState(name),
    );

    if (!modifiers.length && code === 'Mouse0') {
      // We don't want to allow the left mouse button as keybind, as it would be impossible to click on anything.
      return;
    }

    if (code === 'Mouse2') {
      // We don't want to allow the right mouse button as keybind, as it would interfere with the context menu, which is another event
      return;
    }

    HTMLKeybindInputElement.active.value =
      code === 'Escape'
        ? {
            key: '',
            code: '',
            modifiers: [],
          }
        : { key, code, modifiers };

    console.log(HTMLKeybindInputElement.active.value);
    HTMLKeybindInputElement.active.deactivate();
  }

  protected keybindToString({ key, modifiers, code }: Keybind) {
    return !key.length && !code.length ? 'None' : `${key} (${[...modifiers, code].join('+')})`;
  }

  protected onValueChanged(_: string, newValue: string) {
    if (this._input && this._input.value !== newValue) {
      this._input.value = newValue;

      if (!HTMLKeybindInputElement.active) {
        this._button.value = this.keybindToString(this.value);
      }

      this.dispatchEvent(new Event('change'));
    }
  }
}
