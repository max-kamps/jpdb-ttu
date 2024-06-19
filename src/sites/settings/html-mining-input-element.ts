import { getAnkiDecks, getAnkiModels } from '@lib/anki';
import { getAnkiFields } from '@lib/anki/get-anki-fields';
import { createElement } from '@lib/renderer';
import { displayToast } from '@lib/toast';

const observedAttributes = ['value', 'name', 'fetch-url', 'title'] as const;
type ObservedAttributes = (typeof observedAttributes)[number];

const TemplateTargetTranslations: Record<AnkiFieldTemplateName, string> = {
  empty: '[Empty]',
  spelling: 'Word',
  reading: 'Word with Reading',
  hiragana: 'Word in Hiragana',
  meaning: 'Definition',
  sentence: 'Sentence',
  sentenceSanitized: 'Sanitized Sentence',
  isKanji: 'Is Kanji?',
  frequency: 'Frquecy',
  frequencyStylized: 'Frequency Stylized',
  'sound:silence': '[sound:_silence.wav]',
};

export class HTMLMiningInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;
  public static copiedDeckConfiguration: Pick<DeckConfiguration, 'model' | 'templateTargets'>;

  protected _decks: string[] = [];
  protected _models: string[] = [];
  protected _fields: string[] = [];

  protected _shadow: ShadowRoot;
  protected _input: HTMLInputElement;
  protected _templateContainer = createElement('div', { id: 'template-list' });
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

  protected _templateTargets: TemplateTarget[] = [];

  protected get _availableFields(): string[] {
    return this._fields.filter(
      (field) =>
        !this._fieldSelects.some((select) => select.value === field) &&
        !this._templateTargets.some((target) => target.field === field),
    );
  }

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

  public set title(value: string) {
    this.setAttribute('title', value);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });

    this.installStyles();

    this.buildInputElements();
    this.registerSelectElementListeners();

    this.buildDOM();
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

  protected registerSelectElementListeners() {
    Object.values(this._selects).forEach((select) => {
      select.addEventListener('change', () => {
        this.packDeck();
      });
    });

    this._selects.modelInput.addEventListener('change', async () => {
      await this.updateFields(this.getAttribute('fetch-url'), this.value.model);

      this.validateTemplatesThenPackDeck();
    });
  }

  protected buildInputElements() {
    this._input = createElement('input', {
      attributes: {
        type: 'hidden',
        name: this.name,
      },
    });

    this._input.addEventListener('change', () => {
      this.value = JSON.parse(this._input.value);

      this.dispatchEvent(new Event('change'));
    });

    this._proxyInput.addEventListener('change', () => this.packDeck());
  }

  protected buildDOM() {
    this._shadow.appendChild(this._input);

    const container = createElement('div', {
      class: ['mining-input'],
      children: [
        this.buildHeaderBlock(),
        {
          tag: 'div',
          class: ['form-box-parent'],
          children: [
            this.buildColumn([
              this.buildSelectBlock('Deck', this._selects.deckInput),
              this.buildSelectBlock('Word Field', this._selects.wordInput),
            ]),
            this.buildColumn([
              this.buildSelectBlock('Model', this._selects.modelInput),
              this.buildSelectBlock('Reading Field', this._selects.readingInput),
            ]),
          ],
        },
        this.buildTemplateBlock(),
      ],
    });

    this._shadow.appendChild(this.buildAccordionBlock(container));
  }

  protected buildAccordionBlock(contents: HTMLElement) {
    return createElement('details', {
      class: ['accordion'],
      children: [{ tag: 'summary', innerText: this.getAttribute('title') }, contents],
    });
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
        this.buildProxyBlock(),
      ],
    });
  }

  protected buildColumn(inputs: HTMLElement[]) {
    return createElement('div', {
      class: ['form-box'],
      children: inputs
        .map((input) => [input, createElement('div', { style: { height: '1rem' } })])
        .flat(),
    });
  }

  protected buildSelectBlock(label: string, input: HTMLSelectElement) {
    return createElement('div', {
      children: [
        {
          tag: 'label',
          attributes: { for: input.id },
          innerText: label,
        },
        { tag: 'div', class: ['select'], children: [input] },
      ],
    });
  }

  protected buildProxyBlock() {
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

  protected buildTemplateBlock() {
    return createElement('div', {
      children: [
        { tag: 'p', innerText: 'Template Fields' },
        this._templateContainer,
        this.buildTemplateList(),
        this.buildTemplateControls(),
      ],
    });
  }

  protected buildTemplateList() {
    if (!this.value) {
      return this._templateContainer;
    }

    const childs = this._templateTargets.map((target, index) => {
      const fieldSelect = createElement('select', {
        attributes: { name: 'field' },
        children: [...new Set(['', ...this._availableFields, target.field])].map((field) => {
          return createElement('option', { innerText: field, attributes: { value: field } });
        }),
      });
      const templateSelect = createElement('select', {
        attributes: { name: 'template' },
        children: Object.keys(TemplateTargetTranslations).map(
          (template: keyof typeof TemplateTargetTranslations) => {
            return createElement('option', {
              innerText: TemplateTargetTranslations[template],
              attributes: { value: template },
            });
          },
        ),
      });

      [fieldSelect, templateSelect].forEach((select) => {
        select.value = target[select.name as keyof TemplateTarget];
        select.addEventListener('change', () => {
          target[select.name as keyof TemplateTarget] = select.value as any;

          this.validateTemplatesThenPackDeck();
        });
      });

      const removeButton = createElement('input', {
        class: ['outline', 'v1'],
        attributes: { type: 'button', value: '-' },
        handler: () => {
          this._templateTargets.splice(index, 1);

          this.validateTemplatesThenPackDeck();
          this.buildTemplateList();
        },
      });

      return createElement('div', {
        children: [fieldSelect, templateSelect, removeButton],
      });
    });

    this._templateContainer.replaceChildren(...childs);

    return this._templateContainer;
  }

  protected buildTemplateControls() {
    return createElement('div', {
      class: ['controls-list'],
      children: [
        {
          tag: 'input',
          class: 'outline',
          attributes: { type: 'button', value: 'Add' },
          handler: () => this.addTemplate(),
        },
        {
          tag: 'input',
          class: ['outline', 'v1'],
          attributes: { type: 'button', value: 'Clear' },
          handler: () => this.clearTemplates(),
        },
        {
          tag: 'input',
          class: ['outline', 'v3'],
          attributes: { type: 'button', value: 'Copy' },
          handler: () => this.copyTemplate(),
        },
        {
          tag: 'input',
          class: ['outline', 'v4'],
          attributes: { type: 'button', value: 'Paste' },
          handler: () => this.pasteTemplate(),
        },
      ],
    });
  }

  protected addTemplate() {
    const newTemplate: TemplateTarget = { template: 'empty', field: '' };

    this._templateTargets.push(newTemplate);

    this.buildTemplateList();
  }

  protected clearTemplates() {
    this._templateTargets = [];

    this.buildTemplateList();
    this.packDeck();
  }

  protected copyTemplate() {
    HTMLMiningInputElement.copiedDeckConfiguration = {
      model: this._selects.modelInput.value,
      templateTargets: this._templateTargets,
    };

    displayToast('success', 'Template copied');
  }

  protected pasteTemplate() {
    if (!HTMLMiningInputElement.copiedDeckConfiguration?.model?.length) {
      displayToast('error', 'No template copied');

      return;
    }

    if (this._selects.modelInput.value !== HTMLMiningInputElement.copiedDeckConfiguration.model) {
      displayToast('error', 'Models do not match');

      return;
    }

    if (HTMLMiningInputElement.copiedDeckConfiguration) {
      this._templateTargets = HTMLMiningInputElement.copiedDeckConfiguration.templateTargets;

      this.buildTemplateList();
      this.packDeck();
    }
  }

  protected validateTemplatesThenPackDeck() {
    this._templateTargets = this._templateTargets.filter(
      (target) => target.field && this._fields.includes(target.field) && target.template,
    );

    this.buildTemplateList();
    this.packDeck();
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
    this.packDeck();
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

  protected packDeck() {
    this.value = {
      deck: this._selects.deckInput.value,
      model: this._selects.modelInput.value,
      wordField: this._selects.wordInput.value,
      readingField: this._selects.readingInput.value,
      proxy: this._proxyInput.checked,
      templateTargets: this._templateTargets,
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
    this._templateTargets = this.value.templateTargets;

    this.buildTemplateList();
  }
}
