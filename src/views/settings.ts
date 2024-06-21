import {
  DEFAULT_CONFIGURATION,
  getConfigurationValue,
  setConfigurationValue,
} from '@lib/configuration';
import { findElement, withElement, withElements } from '@lib/renderer';
import { displayToast } from '@lib/toast';
import { registerListener } from '@lib/messaging';
import { getAnkiApiVersion } from '@lib/anki';
import { pingJPDB } from '@lib/jpdb';
import { HTMLMiningInputElement } from './elements/html-mining-input-element';
import { HTMLKeybindInputElement } from './elements/html-keybind-input-element';

class SettingsController {
  private _lastSavedConfiguration = new Map<
    keyof Configuration,
    Configuration[keyof Configuration]
  >();
  private _currentConfiguration = new Map<
    keyof Configuration,
    Configuration[keyof Configuration]
  >();
  private _localChanges = new Set<keyof Configuration>();
  private _invalidFields = new Set<keyof Configuration>();

  private _saveButton = findElement<'button'>('#save-all-settings');

  constructor() {
    registerListener('toast', displayToast);

    customElements.define('mining-input', HTMLMiningInputElement);
    customElements.define('keybind-input', HTMLKeybindInputElement);

    (async () => {
      await this._setupSimpleInputs();
      await this._setupSelectFields();

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
    await this._setupFields('input, textarea, mining-input, keybind-input', [''], (type) =>
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

        if (filter.includes(name) || inputElement.type === 'hidden') {
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

  /**
   * Setup the save button. When clicked, it will save the local changes to the storage.
   */
  private _setupSaveButton(): void {
    this._saveButton.onclick = async (event: Event) => {
      event.stopPropagation();
      event.preventDefault();

      // We only save the fields that are not invalid.
      // The save button would not activate if there are invalid fields except for the ankiProxyUrl.
      const itemsToSave = Array.from(this._localChanges).filter(
        (key) => !this._invalidFields.has(key),
      );

      if (itemsToSave.length === 0) {
        return;
      }

      this._saveButton.disabled = true;

      for (const key of itemsToSave) {
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
    // Invalid fields are not considered changed fields.
    const localChanges = Array.from(this._localChanges).filter(
      (key) => !this._invalidFields.has(key),
    );
    // We allow the ankiProxyUrl to be invalid, otherwise one would have to start the proxy every time the settings are opened.
    const invalidFields = Array.from(this._invalidFields).filter((key) => key !== 'ankiProxyUrl');

    console.log(localChanges, invalidFields);
    this._saveButton.disabled = localChanges.length === 0 || invalidFields.length > 0;
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
        withElements('mining-input', (element: HTMLMiningInputElement) => {
          element.fetchUrl = ankiConnectUrl;
        });

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
