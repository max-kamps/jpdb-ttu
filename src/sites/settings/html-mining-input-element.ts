import { getAnkiDecks, getAnkiModels } from '@lib/anki';
import { getAnkiFields } from '@lib/anki/get-anki-fields';
import { createElement } from '@lib/renderer';

const observedAttributes = ['value', 'name', 'fetch-url'] as const;
type ObservedAttributes = (typeof observedAttributes)[number];

export class HTMLMiningInputElement extends HTMLElement {
  static observedAttributes = observedAttributes;

  protected _decks: string[] = [];
  protected _models: string[] = [];
  protected _fields: string[] = [];

  protected _shadow: ShadowRoot;
  protected _input: HTMLInputElement;
  protected _selects = {
    deckInput: createElement('select'),
    modelInput: createElement('select'),
    wordInput: createElement('select'),
    readingInput: createElement('select'),
  };
  protected _fieldSelects = [this._selects.wordInput, this._selects.readingInput];
  protected _proxyInput = createElement('input', {
    attributes: {
      type: 'checkbox',
    },
  });

  public get value(): DeckConfiguration {
    return JSON.parse(this.getAttribute('value'));
  }
  public set value(value: DeckConfiguration) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name');
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  public set fetchUrl(value: string) {
    this.setAttribute('fetch-url', value);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    console.log('Custom element added to page.');

    this.installStyles();

    this.createInputElements();
    this.registerSelectElementListeners();

    this.createDOM();
  }

  attributeChangedCallback(name: ObservedAttributes, oldValue: unknown, newValue: unknown) {
    const pascalCaseName = name.replace(/(^\w|-\w)/g, (a) => a.replace(/-/, '').toUpperCase());
    const functionName = `on${pascalCaseName}Changed`;
    const changeHandler = this[functionName as keyof this] as
      | ((oldValue: unknown, newValue: unknown) => void | Promise<void>)
      | undefined;

    if (changeHandler) {
      changeHandler.apply(this, [oldValue, newValue]);
    }
  }

  protected installStyles() {
    ['styles/theme', 'styles/common', 'sites/settings/settings'].forEach((style) => {
      this._shadow.appendChild(
        createElement('link', {
          attributes: {
            rel: 'stylesheet',
            href: chrome.runtime.getURL(`${style}.css`),
          },
        }),
      );
    });
  }

  protected createInputElements() {
    this._input = createElement('input', {
      attributes: {
        // @TODO: Change to hidden
        type: 'text',
        name: this.name,
      },
    });

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value);

      this.dispatchEvent(new Event('change'));
    });

    this._proxyInput.addEventListener('change', () => this.buildDeck());
  }

  protected registerSelectElementListeners() {
    Object.values(this._selects).forEach((select) => {
      select.addEventListener('change', () => {
        this.buildDeck();
      });
    });

    this._selects.modelInput.addEventListener('change', async () => {
      await this.updateFields(this.getAttribute('fetch-url'), this.value.model);

      this.buildDeck();
    });
  }

  protected createDOM() {
    this._shadow.appendChild(this._input);

    const container = createElement('div', {
      class: ['mining-input', 'border'],
      children: [
        this.buildHeaderBlock(),
        {
          tag: 'div',
          class: ['form-box-parent'],
          children: [
            this.buildColumn([
              this.createSelectBlock('Deck', this._selects.deckInput),
              this.createSelectBlock('Word Field', this._selects.wordInput),
            ]),
            this.buildColumn([
              this.createSelectBlock('Model', this._selects.modelInput),
              this.createSelectBlock('Reading Field', this._selects.readingInput),
            ]),
          ],
        },
      ],
    });

    this._shadow.appendChild(container);
  }

  protected buildHeaderBlock() {
    return createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '2rem',
      },
      children: [
        { tag: 'p', style: { flex: '1', opacity: '0.8' }, children: [{ tag: 'slot' }] },
        this.createProxyBlock(),
      ],
    });
  }

  protected buildColumn(inputs: HTMLElement[]) {
    return createElement('div', {
      class: ['form-box'],
      children: inputs
        .map((input, index) => {
          const result = [input];

          if (index < inputs.length - 1) {
            result.push(createElement('div', { style: { height: '1rem' } }));
          }

          return result;
        })
        .flat(),
    });
  }

  protected createSelectBlock(label: string, input: HTMLSelectElement) {
    return createElement('div', {
      children: [
        {
          tag: 'label',
          attributes: { for: input.id },
          innerText: label,
        },
        input,
      ],
    });
  }

  protected createProxyBlock() {
    return createElement('div', {
      style: { flex: '1' },
      children: [
        {
          tag: 'div',
          class: ['checkbox'],
          children: [
            this._proxyInput,
            {
              tag: 'label',
              attributes: { for: this._proxyInput.id },
              innerText: 'Use proxy for mining into this deck',
            },
          ],
        },
      ],
    });
  }

  protected onValueChanged(_: string, newValue: string) {
    if (this._input && this._input.value !== newValue) {
      this._input.value = newValue;

      this.dispatchEvent(new Event('change'));
    }
  }

  protected async onFetchUrlChanged(_: string, ankiConnectUrl: string) {
    if (!ankiConnectUrl) {
      return;
    }

    await this.updateDecks(ankiConnectUrl);
    await this.updateModels(ankiConnectUrl);
    await this.updateFields(ankiConnectUrl, this.value.model);

    this.unpackDeck();
    this.buildDeck();
  }

  protected async updateDecks(ankiConnectUrl: string) {
    this._decks = await getAnkiDecks({ ankiConnectUrl });

    this._decks.unshift('');
    this._selects.deckInput.replaceChildren(
      ...this._decks.map((deck) => createElement('option', { innerText: deck })),
    );
  }

  protected async updateModels(ankiConnectUrl: string) {
    this._models = await getAnkiModels({ ankiConnectUrl });

    this._selects.modelInput.replaceChildren(
      ...this._models.map((model) => createElement('option', { innerText: model })),
    );
  }

  protected async updateFields(ankiConnectUrl: string, model: string) {
    this._fields = model ? await getAnkiFields(model, { ankiConnectUrl }) : [];

    ['wordInput', 'readingInput'].forEach((key: keyof typeof this._selects) => {
      const select = this._selects[key];
      const includeEmpty = key === 'readingInput';
      const fields = [includeEmpty ? [''] : [], this._fields].flat();

      select.replaceChildren(
        ...fields.map((field) =>
          createElement('option', { attributes: { value: field }, innerText: field }),
        ),
      );
    });
  }

  protected buildDeck() {
    this.value = {
      deck: this._selects.deckInput.value,
      model: this._selects.modelInput.value,
      wordField: this._selects.wordInput.value,
      readingField: this._selects.readingInput.value,
      proxy: this._proxyInput.checked,
      templateTargets: [],
    };
  }

  protected unpackDeck() {
    const propagate = (key: keyof typeof this._selects, haystack: string[], needle: string) => {
      this._selects[key].value = haystack.includes(needle) ? needle : '';
    };

    propagate('deckInput', this._decks, this.value.deck);
    propagate('modelInput', this._models, this.value.model);
    propagate('wordInput', this._fields, this.value.wordField);
    propagate('readingInput', this._fields, this.value.readingField);

    this._proxyInput.checked = this.value.proxy;
  }
}
