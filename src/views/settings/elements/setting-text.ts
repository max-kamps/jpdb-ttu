import { jsxCreateElement } from '../../../lib/jsx';
import { SettingElement } from './setting-element.abstract';

export class SettingText extends SettingElement<string, HTMLTextAreaElement> {
  protected renderInputElem(name: string): HTMLTextAreaElement {
    return jsxCreateElement('textarea', {
      part: 'input',
      name: name,
      rows: 8,
      oninput: () => {
        this.valueChanged();
        // markUnsavedChanges();
      },
    });
  }
  protected get value() {
    return this.input.value;
  }
  protected set value(newValue) {
    this.input.value = newValue;
    this.valueChanged();
  }
  valueChanged() {
    super.valueChanged();

    this.input.rows = this.input.value.split(/\n/g).length;
  }
}
