import { sendToBackground } from '@shared/messages';
import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';

export class MiningActions extends IntegrationScript {
  private _keyManager: KeybindManager;
  private _wordstatesSuspended = false;
  private _currentContext?: HTMLElement;

  constructor() {
    super();

    this._keyManager = new KeybindManager([
      'addToMiningKey',
      'addToBlacklistKey',
      'addToNeverForgetKey',
    ]);

    this.on('addToMiningKey', () => this.addToDeck('mining'));
    this.on('addToBlacklistKey', () => this.addToDeck('blacklist'));
    this.on('addToNeverForgetKey', () => this.addToDeck('neverForget'));
  }

  public activate(context: HTMLElement): void {
    this._currentContext = context;
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._currentContext = undefined;
    this._keyManager.deactivate();
  }

  public async setDecks(decks: {
    mining?: boolean;
    blacklisted?: boolean;
    neverForget?: boolean;
  }): Promise<void> {
    const promises = ['mining', 'blacklisted', 'neverForget'].map(
      (key: 'mining' | 'blacklisted' | 'neverForget') => {
        if (decks[key]) {
          return this.addToDeck(key as 'mining' | 'blacklist' | 'neverForget');
        }

        if (decks[key] === false) {
          return this.removeFromDeck(key as 'mining' | 'blacklist' | 'neverForget');
        }

        return Promise.resolve();
      },
    );

    await Promise.all(promises);

    if (!this._wordstatesSuspended) {
      await this.updateWordStates();
    }
  }

  public suspendUpdateWordStates(): void {
    this._wordstatesSuspended = true;
  }

  public resumeUpdateWordStates(): void {
    this._wordstatesSuspended = false;

    void this.updateWordStates();
  }

  private async updateWordStates(): Promise<void> {
    const { vid, sid } = this._currentContext?.ajbContext?.token?.card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('updateCardState', vid, sid);
  }

  private async addToDeck(key: 'mining' | 'blacklist' | 'neverForget'): Promise<void> {
    const { vid, sid } = this._currentContext?.ajbContext?.token?.card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('addToDeck', vid, sid, key);
  }

  private async removeFromDeck(key: 'mining' | 'blacklist' | 'neverForget'): Promise<void> {
    const { vid, sid } = this._currentContext?.ajbContext?.token?.card || {};

    if (!vid || !sid) {
      return;
    }

    await sendToBackground('removeFromDeck', vid, sid, key);
  }
}
