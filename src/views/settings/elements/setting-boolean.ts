import { jsxCreateElement } from '../../../lib/jsx';
import { SettingElement } from './setting-element.abstract';

export class SettingBoolean extends SettingElement<boolean, HTMLInputElement> {
  protected renderInputElem(name: string): HTMLInputElement {
    return jsxCreateElement('input', {
      part: 'input',
      type: 'checkbox',
      name: name,
      oninput: () => {
        this.valueChanged();
      },
    });
  }
  protected get value() {
    return this.input.checked;
  }
  protected set value(newValue) {
    this.input.checked = newValue;

    this.valueChanged();
  }
}
