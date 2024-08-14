import { Integration } from './lib/integration';
import { KeybindManager } from './lib/keybind-manager';
import { onBroadcast } from '@lib/broadcaster/on-broadcast';

export class AJB extends Integration {
  private static _instance: AJB;

  public static get instance(): AJB {
    if (!this._instance) {
      this._instance = new AJB();
    }

    return this._instance;
  }

  private keyBindManager = KeybindManager.getInstance();

  private constructor() {
    super();

    this.on('parseKey', () => console.log('parsePage'));
    this.on('lookupSelectionKey', () => this.lookupText(window.getSelection()?.toString()));

    this.listen('parsePage', () => console.log('parsePage'));
    this.listen('parseSelection', () => console.log('parseSelection'));

    onBroadcast('configurationUpdated', () => console.log('configuration-updated'));
  }
}

export default AJB.instance;
