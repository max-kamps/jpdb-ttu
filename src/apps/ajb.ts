import { isDisabled } from '@shared/host/is-disabled';
import { Integration } from './lib/integration';
import { KeybindManager } from './lib/keybind-manager';
import { getHostMeta } from '@shared/host/get-host-meta';
import { displayToast } from '@shared/dom/display-toast';
import { HostEvaluator } from './lib/host-evaluator';
import { TriggerParser } from './lib/parser/trigger-parser';
import { AutomaticParser } from './lib/parser/automatic-parser';

export class AJB extends Integration {
  private _lookupKeyManager = new KeybindManager(['lookupSelectionKey']);
  private _hostEvaluator = new HostEvaluator(window.location.href);

  constructor() {
    super();

    // The user can always lookup selected text per shortcut. Also, a toaster is always available.
    this.installDefaultListeners();

    // Evaluate host for valid events and behaviors
    this.evaluateHost();
  }

  private async evaluateHost(): Promise<void> {
    await this._hostEvaluator.load();

    if (!this._hostEvaluator.canBeTriggered) {
      this.installRejectionTriggers();
    }

    this.installParsers();
  }

  private installDefaultListeners(): void {
    this._lookupKeyManager.activate();
    this.on('lookupSelectionKey', () => this.lookupText(window.getSelection()?.toString()));

    this.listen('toast', displayToast);
  }

  private installRejectionTriggers(): void {
    // We only reject inputs on the main frame, as we only expect parsing on the main frame as well.
    if (!this.isMainFrame) {
      return;
    }

    console.log('Installing rejection triggers...');
    const reject = () => {
      displayToast('error', 'This page has been disabled for manual parsing.');
    };

    this.listen('parsePage', reject);
    this.listen('parseSelection', reject);
  }

  private installParsers(): void {
    for (const meta of this._hostEvaluator.relevantMeta) {
      if (!meta.auto) {
        if (!meta.disabled) {
          this.installParser(meta, TriggerParser);
        }

        continue;
      }

      this.installParser(meta, AutomaticParser);
    }
  }
}

new AJB();
