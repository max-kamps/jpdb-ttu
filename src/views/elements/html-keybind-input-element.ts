import { Keybind } from '@shared/configuration';
import { createElement } from '@shared/dom';
import { getStyleUrl } from '@shared/extension';

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
  protected _button: HTMLInputElement = createElement('input', {
    class: ['outline'],
    attributes: { type: 'button' },
    style: { width: '100%', marginBottom: '0' },
  });

  public get value(): Keybind {
    return JSON.parse(this.getAttribute('value')!) as Keybind;
  }
  public set value(value: Keybind) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name')!;
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  constructor() {
    super();
  }

  public connectedCallback(): void {
    this._shadow = this.attachShadow({ mode: 'open' });

    this.installStyles();

    this.buildInputElements();
    this.buildDOM();
  }

  public attributeChangedCallback(
    name: ObservedAttributes,
    oldValue: unknown,
    newValue: unknown,
  ): void {
    const pascalCaseName = name.replace(/(^\w|-\w)/g, (a) => a.replace(/-/, '').toUpperCase());
    const functionName = `on${pascalCaseName}Changed`;
    const changeHandler = this[functionName as keyof this] as
      | ((oldValue: unknown, newValue: unknown) => void | Promise<void>)
      | undefined;

    if (changeHandler) {
      changeHandler.apply(this, [oldValue, newValue]);
    }
  }

  protected installStyles(): void {
    ['css/theme', 'css/common', 'css/settings'].forEach((style) => {
      this._shadow.appendChild(
        createElement('link', {
          attributes: {
            rel: 'stylesheet',
            href: getStyleUrl(style),
          },
        }),
      );
    });
  }

  protected buildInputElements(): void {
    this._input = createElement('input', {
      attributes: {
        type: 'hidden',
        name: this.name,
      },
    });

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value) as Keybind;

      this.dispatchEvent(new Event('change'));
    });

    // We use mousedown instead of click to allow the left mouse button being used as keybind.
    // If we would use click, the event propagation cannot be stopped and the button would activate again immediately after the keybind was chosen.
    this._button.addEventListener('mousedown', (event) => this.initChooseKey(event));
  }

  protected buildDOM(): void {
    this._shadow.appendChild(this._input);
    this._shadow.appendChild(this._button);
  }

  protected initChooseKey(event: MouseEvent): void {
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

  protected activate(): void {
    this._button.value = 'Press a key, escape to cancel';

    const events = ['keydown', 'keyup', 'mousedown', 'mouseup'];

    events.forEach((event) =>
      document.addEventListener(event, (ev: KeyboardEvent | MouseEvent) =>
        HTMLKeybindInputElement.keyListener(ev),
      ),
    );

    HTMLKeybindInputElement.active = this;
  }

  protected deactivate(): void {
    this._button.value = this.keybindToString(this.value);

    const events = ['keydown', 'keyup', 'mousedown', 'mouseup'];

    events.forEach((event) =>
      document.removeEventListener(event, (ev: KeyboardEvent | MouseEvent) =>
        HTMLKeybindInputElement.keyListener(ev),
      ),
    );

    HTMLKeybindInputElement.active = undefined;
  }

  protected static keyListener(event: KeyboardEvent | MouseEvent): void {
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
        : (HTMLKeybindInputElement.MOUSE_BUTTONS[event.button] ?? code);
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

    HTMLKeybindInputElement.active!.value =
      code === 'Escape'
        ? {
            key: '',
            code: '',
            modifiers: [],
          }
        : { key, code, modifiers };

    HTMLKeybindInputElement.active!.deactivate();
  }

  protected keybindToString({ key, modifiers, code }: Keybind): string {
    return !key.length && !code.length ? 'None' : `${key} (${[...modifiers, code].join('+')})`;
  }

  protected onValueChanged(_: string, newValue: string): void {
    if (this._input && this._input.value !== newValue) {
      this._input.value = newValue;

      if (!HTMLKeybindInputElement.active) {
        this._button.value = this.keybindToString(this.value);
      }

      this.dispatchEvent(new Event('change'));
    }
  }
}
