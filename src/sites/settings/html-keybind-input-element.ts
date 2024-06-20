import { createElement } from '@lib/renderer';

const observedAttributes = ['value', 'name'] as const;
type ObservedAttributes = (typeof observedAttributes)[number];

export class HTMLKeybindInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;
  protected static active?: [Keybind, (event: KeyboardEvent) => void];

  protected MODIFIERS = ['Control', 'Alt', 'AltGraph', 'Meta', 'Shift'];
  protected MOUSE_BUTTONS = ['Left Mouse Button', 'Middle Mouse Button', 'Right Mouse Button'];

  protected _shadow: ShadowRoot;
  protected _input: HTMLInputElement;

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
    ['styles/theme', 'styles/common', 'sites/settings/settings'].forEach((style) => {
      this._shadow.appendChild(
        createElement('link', {
          attributes: {
            rel: 'stylesheet',
            href: chrome.runtime.getURL(`${style}.css`),
          },
        }),
      );
    });
  }

  protected buildInputElements() {
    this._input = createElement('input', {
      attributes: {
        // @TODO: CHange to hidden
        type: 'text',
        name: this.name,
      },
    });

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value);

      this.dispatchEvent(new Event('change'));
    });
  }

  protected buildDOM() {
    this._shadow.appendChild(this._input);

    // const container = createElement('div', {
    //   class: ['mining-input'],
    //   children: [
    //     this.buildHeaderBlock(),
    //     {
    //       tag: 'div',
    //       class: ['form-box-parent'],
    //       children: [
    //         this.buildColumn([
    //           this.buildSelectBlock('Deck', this._selects.deckInput),
    //           this.buildSelectBlock('Word Field', this._selects.wordInput),
    //         ]),
    //         this.buildColumn([
    //           this.buildSelectBlock('Model', this._selects.modelInput),
    //           this.buildSelectBlock('Reading Field', this._selects.readingInput),
    //         ]),
    //       ],
    //     },
    //     this.buildTemplateBlock(),
    //   ],
    // });
  }

  protected keybindToString(keybind: Keybind) {
    return keybind === null
      ? 'None'
      : `${keybind.key} (${[...keybind.modifiers, keybind.code].join('+')})`;
  }

  protected onValueChanged(_: string, newValue: string) {
    if (this._input && this._input.value !== newValue) {
      this._input.value = newValue;

      this.dispatchEvent(new Event('change'));
    }
  }
}
