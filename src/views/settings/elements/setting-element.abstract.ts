import { browser } from '../../../util';
import { jsxCreateElement } from '../../../lib/jsx';

export abstract class SettingElement<
  TValue extends string | boolean | number,
  TInput extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> extends HTMLElement {
  protected input: TInput;
  protected reset: HTMLButtonElement;

  protected abstract renderInputElem(name: string): TInput;
  protected abstract value: TValue | null;

  protected static get observedAttributes() {
    return ['name'];
  }

  constructor() {
    super();

    const label = jsxCreateElement(
      'label',
      { part: 'label', for: 'input' },
      jsxCreateElement('slot', null),
    );

    this.input = this.renderInputElem(this.getAttribute('name') ?? '');
    this.reset = jsxCreateElement(
      'button',
      {
        part: 'reset-button',
        onclick: () => {
          this.resetValue();
          // markUnsavedChanges();
        },
      },
      'Reset',
    );

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.append(
      jsxCreateElement('link', {
        rel: 'stylesheet',
        href: browser.runtime.getURL('styles/common.css'),
      }),
      label,
      this.input,
      this.reset,
    );
  }

  protected attributeChangedCallback(
    name: keyof SettingElement<TValue, TInput>,
    oldValue: SettingElement<TValue, TInput>[keyof SettingElement<TValue, TInput>],
    newValue: SettingElement<TValue, TInput>[keyof SettingElement<TValue, TInput>],
  ): void {
    (this as any)[name] = newValue;
  }

  protected set name(newValue) {
    this.input.name = newValue;
  }

  protected get name() {
    return this.input.name;
  }

  protected resetValue(): void {
    this.value = (({} as Configuration)[this.name as keyof Configuration] as TValue) ?? null;
  }

  protected valueChanged(): void {
    if (
      this.value !== ((({} as Configuration)[this.name as keyof Configuration] as TValue) ?? null)
    ) {
      this.reset.disabled = false;
      this.reset.innerText = 'Reset';
    } else {
      this.reset.disabled = true;
      this.reset.innerText = 'Default';
    }
  }
}
