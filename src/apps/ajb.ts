import { isDisabled } from '@shared/host/is-disabled';
import { Integration } from './lib/integration';
import { KeybindManager } from './lib/keybind-manager';
import { onBroadcast } from '@shared/broadcaster/on-broadcast';
import { getHostMeta } from '@shared/host/get-host-meta';
import { get } from 'http';

export class AJB extends Integration {
  private baseKeyManager = new KeybindManager(['parseKey', 'lookupSelectionKey'], {
    closeAllDialogs: { key: '', code: 'Escape', modifiers: [] },
  });

  constructor() {
    super();

    this.setup();
  }

  private async setup(): Promise<void> {
    const hostMeta = await getHostMeta(window.location.href);

    if (await isDisabled(window.location.href)) {
      return;
    }

    this.installEvents();
    this.baseKeyManager.activate();

    if (hostMeta?.parse) {
      this.setParseBehavior(hostMeta.parse);
    }
  }

  private installEvents(): void {
    this.on('lookupSelectionKey', () => this.lookupText(window.getSelection()?.toString()));

    this.on('parseKey', () => {
      if (window.getSelection()?.toString()) {
        return this.parseSelection();
      }

      this.parsePage();
    });

    this.listen('parsePage', () => this.parsePage());
    this.listen('parseSelection', () => this.parseSelection());
  }
}

new AJB();
