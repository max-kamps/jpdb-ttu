import { getAnkiFields } from '@lib/anki/get-anki-fields';
import { appendElement, createElement, findElement } from '@lib/renderer';

export class DeckInput {
  private _container = findElement<'div'>('#decks');

  private _input: HTMLInputElement;
  private _name: string;

  private _deckOptions: HTMLOptionElement[] = [];
  private _modelOptions: HTMLOptionElement[] = [];

  private _fields: string[] = [];

  private _selectFields = new Map<keyof DeckConfiguration, HTMLSelectElement>();

  public get deck(): DeckConfiguration {
    return this._deck;
  }

  constructor(
    private _deck: DeckConfiguration,
    private _inputName: string,
    private _decks: string[],
    private _models: string[],
    private _ankiUrl: string,
  ) {
    this._name = _inputName.toLowerCase().replace(/ /g, '-');

    this._deckOptions = this._decks.map((deck) =>
      createElement('option', { attributes: { value: deck }, innerText: deck }),
    );

    this._modelOptions = this._models.map((model) =>
      createElement('option', { attributes: { value: model }, innerText: model }),
    );
  }

  public render(): HTMLInputElement {
    this._input = appendElement(this._container, {
      tag: 'input',
      attributes: { type: 'text', name: this._name, value: JSON.stringify(this.deck) },
    });

    appendElement(this._container, {
      tag: 'div',
      class: ['form-box-parent', 'border'],
      children: [
        {
          tag: 'div',
          class: ['form-box'],
          children: [
            this._buildInput('deck', 'deck', this._inputName, this._deckOptions),
            this._buildInput('model', 'model', 'Model', this._modelOptions),
            {
              tag: 'div',
              children: [
                {
                  tag: 'div',
                  class: ['checkbox'],
                  children: [
                    {
                      tag: 'input',
                      attributes: {
                        type: 'checkbox',
                        id: `${this._name}-proxy`,
                        name: 'proxy',
                      },
                    },
                    {
                      tag: 'label',
                      attributes: { for: `${this._name}-proxy` },
                      innerText: 'Use proxy for mining into this deck',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          tag: 'div',
          class: ['form-box'],
          children: [
            this._buildInput('wordField', 'field', 'Word Field'),
            this._buildInput('readingField', 'field', 'Reading Field'),
          ],
        },
      ],
    });

    this._installListeners();

    return this._input;
  }

  private _installListeners() {
    const deckField = this._selectFields.get('deck')!;
    const modelField = this._selectFields.get('model')!;
    const wordField = this._selectFields.get('wordField')!;
    const readingField = this._selectFields.get('readingField')!;
    const proxyField = findElement<'input'>(this._container, `#${this._name}-proxy`);

    const updateDeckPeers = () => {
      this._setDisabledState(!deckField.value, [proxyField, modelField]);

      updateModelPeers();
    };
    const updateModelPeers = () => {
      this._setDisabledState(!modelField.value, [wordField, readingField]);
    };

    this._input.addEventListener('change', () => {
      this._deck = JSON.parse(this._input.value);

      this._refresh();
    });

    proxyField.addEventListener('change', () => {
      this._deck.proxy = proxyField.checked;
      this._input.value = JSON.stringify(this._deck);
    });

    this._selectFields.forEach((select, key) => {
      select.addEventListener('change', () => {
        Object.assign(this._deck, { [key]: select.value });

        this._input.value = JSON.stringify(this._deck);
      });
    });

    deckField.addEventListener('change', () => {
      updateDeckPeers();
    });

    modelField.addEventListener('change', async () => {
      updateModelPeers();

      await this._loadFields();
    });

    updateDeckPeers();
    updateModelPeers();
  }

  private async _loadFields() {
    const model = this._deck.model;

    if (!model) {
      return;
    }

    const fields = await getAnkiFields(model, { ankiConnectUrl: this._ankiUrl });
    const wordField = this._selectFields.get('wordField')!;
    const readingField = this._selectFields.get('readingField')!;

    this._fields = fields;

    wordField.replaceChildren(...this._getFieldOptions());
    readingField.replaceChildren(...this._getFieldOptions(true));

    if (!this._fields.includes(this._deck.wordField)) {
      this._deck.wordField = '';

      wordField.dispatchEvent(new Event('change'));
    }

    if (!this._fields.includes(this._deck.readingField)) {
      this._deck.readingField = '';

      readingField.dispatchEvent(new Event('change'));
    }

    this._refresh();
  }

  private _getFieldOptions(includeEmpty: boolean = false): HTMLOptionElement[] {
    const options = this._fields.map((field) =>
      createElement('option', { attributes: { value: field }, innerText: field }),
    );

    if (includeEmpty) {
      options.unshift(createElement('option', { attributes: { value: '' }, innerText: '' }));
    }

    return options;
  }

  private _setDisabledState(state: boolean, fields: Array<HTMLInputElement | HTMLSelectElement>) {
    fields.forEach((field) => {
      const previousState = field.disabled;

      field.disabled = state;

      if (state) {
        field.value = '';

        if (field.type === 'checkbox') {
          (field as HTMLInputElement).checked = false;
        }
      }

      if (previousState !== state) {
        field.dispatchEvent(new Event('change'));
      }
    });
  }

  private _refresh() {
    this._selectFields.forEach((select, key) => {
      select.value = this.deck[key as keyof DeckConfiguration] as string;
    });
  }

  private _buildInput(
    prop: keyof DeckConfiguration,
    type: 'deck' | 'model' | 'field',
    label: string,
    options?: HTMLOptionElement[],
  ) {
    const select = createElement({
      tag: 'select',
      attributes: {
        id: `${this._name}-${prop}`,
        name: prop,
        type,
      },
      children: options,
    });

    select.value = this.deck[prop] as string;

    this._selectFields.set(prop, select);

    return createElement('div', {
      children: [
        { tag: 'label', attributes: { for: `${this._name}-${prop}` }, innerText: label },
        select,
      ],
    });
  }
}
