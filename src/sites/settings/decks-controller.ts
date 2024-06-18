import { DEFAULT_CONFIGURATION, getConfigurationValue } from '@lib/configuration';
import { appendElement, findElement } from '@lib/renderer';
import { DeckInput } from './deck-input';
import { getAnkiDecks, getAnkiModels } from '@lib/anki';

export class DecksController {
  private _container = findElement<'div'>('#decks');

  private _ankiUrl: string;
  private _installed: boolean;

  private _decks = new Map<string, DeckInput>();
  private _readonlyDecks = new Set<DeckInput>();

  private _ankiDecks: string[] = [];
  private _ankiModels: string[] = [];

  constructor() {
    this._installed = false;
  }

  public async ankiReached(ankiUrl: string): Promise<void> {
    this._ankiUrl = ankiUrl;

    await this._installDecks();
  }

  private async _installDecks(): Promise<void> {
    if (this._installed) {
      return;
    }

    this._ankiDecks = await getAnkiDecks({ ankiConnectUrl: this._ankiUrl });
    this._ankiModels = await getAnkiModels({ ankiConnectUrl: this._ankiUrl });

    await this._installMiningDeck();
    await this._installBlacklistDeck();
    await this._installNeverForgetDeck();

    appendElement(this._container, {
      tag: 'h5',
      innerText: 'Lookups',
    });

    await this._installReadonlyDecks();

    this._installed = true;
  }

  private async _installMiningDeck(): Promise<void> {
    await this._installDeck('miningConfig', 'Mining Deck');
  }

  private async _installBlacklistDeck(): Promise<void> {
    await this._installDeck('blacklistConfig', 'Blacklist Deck', true);
  }

  private async _installNeverForgetDeck(): Promise<void> {
    await this._installDeck('neverForgetConfig', 'Never Forget Deck', true);
  }

  private async _installReadonlyDecks(): Promise<void> {
    const decks = await getConfigurationValue(
      'readonlyConfigs',
      DEFAULT_CONFIGURATION.readonlyConfigs,
    );
    const inputs = decks.map(
      (deck, index) => new DeckInput(deck, `readonly-${index}`, this._ankiDecks, [], this._ankiUrl),
    );

    inputs.forEach((input) => {
      this._readonlyDecks.add(input);
      input.render();
    });
  }

  private async _installDeck(
    config: 'miningConfig' | 'blacklistConfig' | 'neverForgetConfig',
    name: string,
    allowEmpty: boolean = false,
  ): Promise<void> {
    const deck = await getConfigurationValue(config, DEFAULT_CONFIGURATION[config]);
    const deckInput = new DeckInput(
      deck,
      name,
      allowEmpty ? ['', ...this._ankiDecks] : this._ankiDecks,
      allowEmpty ? ['', ...this._ankiModels] : this._ankiModels,
      this._ankiUrl,
    );

    this._decks.set(config, deckInput);

    deckInput.render();
  }
}
