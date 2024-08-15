import { Integration } from './lib/integration';
import { KeybindManager } from './lib/keybind-manager';
import { onBroadcast } from '@shared/broadcaster/on-broadcast';

export class AJB extends Integration {
  private baseKeyManager = new KeybindManager(['parseKey', 'lookupSelectionKey']);

  constructor() {
    super();

    this.baseKeyManager.activate();

    this.on('lookupSelectionKey', () => this.lookupText(window.getSelection()?.toString()));

    this.on('parseKey', () => {
      if (window.getSelection()?.toString()) {
        return this.parseSelection();
      }

      this.parsePage();
    });

    this.listen('parsePage', () => this.parsePage());
    this.listen('parseSelection', () => this.parseSelection());

    onBroadcast('configurationUpdated', () => console.log('configuration-updated'));
  }
}

new AJB();
