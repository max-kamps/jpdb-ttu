import { jsxCreateElement } from '../../../lib/jsx';
import { SettingElement } from './setting-element.abstract';

export class SettingString extends SettingElement<string, HTMLInputElement> {
  protected renderInputElem(name: string): HTMLInputElement {
    return jsxCreateElement('input', {
      part: 'input',
      type: 'text',
      name: name,
      oninput: () => {
        this.valueChanged();
      },
    });
  }
  protected get value() {
    return this.input.value ?? '';
  }
  protected set value(newValue) {
    this.input.value = newValue ?? '';
    this.valueChanged();
  }
}
