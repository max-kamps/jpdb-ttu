import { browser } from '../../../unsorted/util';
import { jsxCreateElement } from '../../../lib/jsx';
import { SettingsController } from '../settings-controller';
import { cssURL } from 'src/unsorted/paths';
import { DEFAULT_OPTIONS } from '../default-options';

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
        },
      },
      'Reset',
    );

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.append(
      jsxCreateElement('link', {
        rel: 'stylesheet',
        href: cssURL('common'),
      }),
      label,
      this.input,
      this.reset,
    );

    SettingsController.getInstance()
      .getValueFor(this.name as keyof Configuration)
      .then((value) => {
        this.value = value as TValue;
      });
  }

  protected checkForChanges(): void {
    SettingsController.getInstance().checkForChanges(this.name, this.value);
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
    this.value = DEFAULT_OPTIONS[this.name as keyof Configuration] as TValue;

    this.checkForChanges();
  }

  protected valueChanged(): void {
    if (this.value !== (DEFAULT_OPTIONS[this.name as keyof Configuration] as TValue)) {
      this.reset.disabled = false;
      this.reset.innerText = 'Reset';
    } else {
      this.reset.disabled = true;
      this.reset.innerText = 'Default';
    }

    this.checkForChanges();
  }
}
