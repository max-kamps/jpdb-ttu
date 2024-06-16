import { jsxCreateElement } from '../../../lib/jsx';
import { SettingElement } from './setting-element.abstract';

export class SettingNumber extends SettingElement<number, HTMLInputElement> {
  protected renderInputElem(name: string): HTMLInputElement {
    console.log('SettingNumber.renderInputElem');
    return jsxCreateElement('input', {
      part: 'input',
      type: 'number',
      name: name,
      oninput: () => {
        this.valueChanged();
        // markUnsavedChanges();
      },
    });
  }

  protected get value(): number | null {
    return this.input.valueAsNumber;
  }

  protected set value(value: number | null) {
    this.input.value = value?.toString() ?? '';
    this.valueChanged();
  }

  protected get min() {
    return this.input.min;
  }
  protected set min(newValue) {
    this.input.min = newValue;
  }

  protected get max() {
    return this.input.max;
  }
  protected set max(newValue) {
    this.input.max = newValue;
  }

  protected get step() {
    return this.input.step;
  }
  protected set step(newValue) {
    this.input.step = newValue;
  }
}
