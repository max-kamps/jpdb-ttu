import {
  DEFAULT_CONFIGURATION,
  getConfigurationValue,
  setConfigurationValue,
} from '@lib/configuration';
import {
  destroyElement,
  findElement,
  findElements,
  withElement,
  withElements,
} from '@lib/renderer';
import { keybindToString } from './keybind-to-string';
import { displayToast } from '@lib/toast';
import { registerListener } from '@lib/messaging';
import { getAnkiApiVersion, getAnkiDecks, getAnkiModels } from '@lib/anki';
import { pingJPDB } from '@lib/jpdb';
import { getAnkiFields } from '@lib/anki/get-anki-fields';
import { DecksController } from './decks-controller';

type Decks = 'miningDeck' | 'neverForgetDeck' | 'blacklistDeck';
type Models = 'miningModel' | 'neverForgetModel' | 'blacklistModel';

class SettingsController {
  private _lastSavedConfiguration = new Map<
    keyof Configuration,
    Configuration[keyof Configuration]
  >();
  private _currentConfiguration = new Map<
    keyof Configuration,
    Configuration[keyof Configuration]
  >();
  // private _localSelectFields = new Map<Decks | Models, string>();
  private _localChanges = new Set<keyof Configuration>();
  private _invalidFields = new Set<keyof Configuration>();

  private _decks = new Set<string>();
  private _models = new Map<string, string[]>();

  private _saveButton = findElement<'button'>('#save-all-settings');
  private _keybindInput = findElement<'input'>('#showPopupKey');
  private _keybindButton = findElement<'button'>('#showPopupKeyButton');

  private _decksController = new DecksController();

  constructor() {
    registerListener('toast', displayToast);

    (async () => {
      await this._setupSimpleInputs();
      await this._setupSelectFields();
      // await this._setupFieldLoaders();

      this._setupJPDBInteraction();
      this._setupAnkiInteraction();

      await this._testJPDB();
      await this._testAnki();
      await this._testAnkiProxy();

      this._setupSaveButton();
    })();
  }

  /**
   * Load the configuration from the storage and populate the settings page with the values.
   * Also, install listeners to keep track of the local changes.
   */
  private async _setupSimpleInputs(): Promise<void> {
    await this._setupFields('input, textarea', ['', 'showPopupKey'], (type) =>
      type === 'checkbox' ? 'checked' : 'value',
    );
  }

  private async _setupSelectFields(): Promise<void> {
    await this._setupFields('select[type="deck"], select[type="model"]', undefined, undefined);
  }

  private async _setupFields(
    selector: string,
    filter: string[] = [],
    getTargetProperty: (type: string) => keyof HTMLInputElement = () => 'value',
  ): Promise<void> {
    await Promise.all(
      withElements(selector, async (inputElement: HTMLInputElement) => {
        const name = inputElement.name as keyof Configuration;

        if (filter.includes(name)) {
          return;
        }

        const targetProperty: keyof HTMLInputElement = getTargetProperty(inputElement.type);
        const value = this._lastSavedConfiguration
          .set(name, await getConfigurationValue(name, DEFAULT_CONFIGURATION[name]))
          .get(name) as Exclude<Configuration[keyof Configuration], Keybind>;

        this._currentConfiguration.set(name, value);

        (inputElement[targetProperty] as Configuration[keyof Configuration]) = value as Exclude<
          Configuration[keyof Configuration],
          Keybind
        >;

        // We keep track of the local changes. We enable the save button if there are local changes.
        inputElement.addEventListener('change', () => {
          const lastSaved = this._lastSavedConfiguration.get(name);
          const current = inputElement[targetProperty] as Exclude<
            Configuration[keyof Configuration],
            Keybind
          >;

          if (lastSaved === current) {
            this._localChanges.delete(name);
          } else {
            this._localChanges.add(name);
          }

          this._currentConfiguration.set(name, current);

          this._updateSaveButton();
        });
      }),
    );
  }

  // private _setupFieldLoaders(): void {
  //   withElements('select[type="model"]', (inputElement: HTMLSelectElement) => {
  //     inputElement.addEventListener('change', async () => {
  //       const target = inputElement.getAttribute('for');
  //       const targetFields = findElements<'select'>(`select[for="${target}"][type="field"]`);
  //       const ankiConnectUrl = this._currentConfiguration.get('ankiUrl') as string;
  //       const model = inputElement.value;

  //       const fields: string[] = [];

  //       if (model) {
  //         const knownFields = this._models.get(model);

  //         fields.push(
  //           ...(knownFields.length > 0
  //             ? knownFields
  //             : await getAnkiFields(model, { ankiConnectUrl })),
  //         );

  //         this._models.set(model, fields);
  //       }

  //       targetFields.forEach((targetField) => {
  //         withElements(targetField, 'option', (e) => e.remove());

  //         fields.forEach((field) => {
  //           const option = document.createElement('option');
  //           option.value = field;
  //           option.text = field;

  //           targetField.appendChild(option);
  //         });

  //         targetField.value = this._currentConfiguration.get(targetField.name as Models) as string;
  //         targetField.dispatchEvent(new Event('change'));
  //       });
  //     });
  //   });
  // }

  /**
   * Setup the save button. When clicked, it will save the local changes to the storage.
   */
  private _setupSaveButton(): void {
    this._saveButton.onclick = async (event: Event) => {
      event.stopPropagation();
      event.preventDefault();

      this._saveButton.disabled = true;

      for (const key of this._localChanges) {
        const inputElement = findElement<'input'>(`[name="${key}"]`);
        const value = inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;

        await setConfigurationValue(key, value);

        this._lastSavedConfiguration.set(key, value);
        this._localChanges.delete(key);
      }

      displayToast('success', 'Settings saved successfully');
    };
  }

  private _updateSaveButton(): void {
    this._saveButton.disabled = this._localChanges.size === 0 || this._invalidFields.size > 0;
  }

  private _setupJPDBInteraction(): void {
    this._setupInteraction('input[name="apiToken"]', '#apiTokenButton', this._testJPDB.bind(this));
  }

  private _setupAnkiInteraction(): void {
    this._setupInteraction('input[name="ankiUrl"]', '#ankiUrlButton', this._testAnki.bind(this));
    this._setupInteraction(
      'input[name="ankiProxyUrl"]',
      '#ankiProxyUrlButton',
      this._testAnkiProxy.bind(this),
    );
  }

  private _setupInteraction(
    inputSelector: string,
    buttonSelector: string,
    testFunction: () => void,
  ): void {
    withElement(inputSelector, (inputElement: HTMLInputElement) => {
      inputElement.addEventListener('change', testFunction);
    });

    withElement(buttonSelector, (buttonElement: HTMLButtonElement) => {
      buttonElement.addEventListener('click', testFunction);
    });
  }

  private async _testJPDB(): Promise<void> {
    await this._testEndpoint(
      '#apiTokenButton',
      '[name="apiToken"]',
      (apiToken) => pingJPDB({ apiToken }),
      false,
    );
  }

  private async _testAnki(): Promise<void> {
    await this._testEndpoint(
      '#ankiUrlButton',
      '[name="ankiUrl"]',
      (ankiConnectUrl) => getAnkiApiVersion({ ankiConnectUrl }),
      false,
      async (ankiConnectUrl: string) => {
        try {
          await this._decksController.ankiReached(ankiConnectUrl);
        } catch (error) {
          console.log(error);
        }

        this._animateMiningSection(true);
      },
      () => this._animateMiningSection(false),
    );
  }

  private async _testAnkiProxy(): Promise<void> {
    await this._testEndpoint(
      '#ankiProxyUrlButton',
      '[name="ankiProxyUrl"]',
      (ankiConnectUrl) => getAnkiApiVersion({ ankiConnectUrl }),
      true,
    );
  }

  private async _testEndpoint(
    buttonSelector: string,
    inputSelector: string,
    testFunction: (value: string) => Promise<any>,
    allowEmpty: boolean,
    afterSuccess?: (value: string) => Promise<void>,
    afterFail?: () => void,
  ): Promise<void> {
    const button = findElement<'button'>(buttonSelector);
    const input = findElement<'input'>(inputSelector);

    if (allowEmpty && !input.value) {
      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof Configuration);

      this._updateSaveButton();
      return;
    }

    try {
      await testFunction(input.value);

      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof Configuration);

      await afterSuccess?.(input.value);
    } catch (error) {
      button.classList.add('v1');
      input.classList.add('v1');

      this._invalidFields.add(input.name as keyof Configuration);

      afterFail?.();
    }

    this._updateSaveButton();
  }

  private async _loadAnkiDecks(ankiConnectUrl: string): Promise<void> {
    // this._decks = new Set(await getAnkiDecks({ ankiConnectUrl }));
    // withElements('select[type="deck"]', (selectElement: HTMLSelectElement) => {
    //   for (const name of this._decks.values()) {
    //     const option = document.createElement('option');
    //     option.value = name;
    //     option.text = name;
    //     selectElement.appendChild(option);
    //   }
    //   selectElement.value = this._currentConfiguration.get(selectElement.name as Decks) as string;
    //   selectElement.dispatchEvent(new Event('change'));
    // });
  }

  private async _loadNoteTypes(ankiConnectUrl: string): Promise<void> {
    // const noteTypes = await getAnkiNoteTypes({ ankiConnectUrl });
    // this._models = new Map(noteTypes.map((name) => [name, []]));
    // withElements('select[type="model"]', (selectElement: HTMLSelectElement) => {
    //   for (const name of noteTypes) {
    //     const option = document.createElement('option');
    //     option.value = name;
    //     option.text = name;
    //     selectElement.appendChild(option);
    //   }
    //   selectElement.value = this._currentConfiguration.get(selectElement.name as Models) as string;
    //   selectElement.dispatchEvent(new Event('change'));
    // });
  }

  private _animateMiningSection(show: boolean): void {
    const miningElement = findElement<'div'>('#requires-anki');

    if (show) {
      miningElement.removeAttribute('hidden');
      miningElement.offsetHeight;

      miningElement.classList.add('is-open');

      setTimeout(() => {
        miningElement.classList.add('rem-height');
      }, 300);
    } else {
      miningElement.classList.remove('rem-height');

      setTimeout(() => {
        miningElement.classList.remove('is-open');

        setTimeout(() => {
          miningElement.setAttribute('hidden', '');
        }, 300);
      }, 50);
    }
  }
}

new SettingsController();
