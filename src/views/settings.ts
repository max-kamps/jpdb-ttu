import { getApiVersion } from '@shared/anki';
import {
  getConfiguration,
  setConfiguration,
  ConfigurationSchema,
  Keybind,
} from '@shared/configuration';
import { displayToast, findElement, findElements, withElement, withElements } from '@shared/dom';
import { ping } from '@shared/jpdb';
import { broadcast } from '@shared/messages';
import { HTMLKeybindInputElement } from './elements/html-keybind-input-element';
import { HTMLMiningInputElement } from './elements/html-mining-input-element';

class SettingsController {
  private _lastSavedConfiguration = new Map<
    keyof ConfigurationSchema,
    ConfigurationSchema[keyof ConfigurationSchema]
  >();
  private _currentConfiguration = new Map<
    keyof ConfigurationSchema,
    ConfigurationSchema[keyof ConfigurationSchema]
  >();
  private _localChanges = new Set<keyof ConfigurationSchema>();
  private _invalidFields = new Set<keyof ConfigurationSchema>();

  private _saveButton = findElement<'button'>('#save-all-settings');

  constructor() {
    customElements.define('mining-input', HTMLMiningInputElement);
    customElements.define('keybind-input', HTMLKeybindInputElement);

    void (async (): Promise<void> => {
      await this._setupSimpleInputs();
      await this._setupSelectFields();

      this._setupJPDBInteraction();
      // this._setupAnkiInteraction();

      await this._testJPDB();
      // await this._testAnki();
      // await this._testAnkiProxy();

      this._setupSaveButton();

      this._setupCollapsibleTriggers();
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
    getTargetProperty: (type: string) => keyof HTMLInputElement = (): keyof HTMLInputElement =>
      'value',
  ): Promise<void> {
    await Promise.all(
      withElements(selector, async (inputElement: HTMLInputElement) => {
        const name = inputElement.name as keyof ConfigurationSchema;

        if (filter.includes(name) || inputElement.type === 'hidden') {
          return;
        }

        const targetProperty: keyof HTMLInputElement = getTargetProperty(inputElement.type);
        const value = this._lastSavedConfiguration
          .set(name, await getConfiguration(name, true))
          .get(name) as Exclude<ConfigurationSchema[keyof ConfigurationSchema], Keybind>;

        this._currentConfiguration.set(name, value);

        (inputElement[targetProperty] as ConfigurationSchema[keyof ConfigurationSchema]) = value;

        // We keep track of the local changes. We enable the save button if there are local changes.
        inputElement.addEventListener('change', () => {
          const lastSaved = this._lastSavedConfiguration.get(name);
          const current = inputElement[targetProperty] as Exclude<
            ConfigurationSchema[keyof ConfigurationSchema],
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
    this._saveButton.onclick = async (event: Event): Promise<void> => {
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

        await setConfiguration(key, value);

        this._lastSavedConfiguration.set(key, value);
        this._localChanges.delete(key);
      }

      displayToast('success', 'Settings saved successfully');

      broadcast('configurationUpdated');
    };
  }

  private _updateSaveButton(): void {
    // Invalid fields are not considered changed fields.
    const localChanges = Array.from(this._localChanges).filter(
      (key) => !this._invalidFields.has(key),
    );
    // We allow the ankiProxyUrl to be invalid, otherwise one would have to start the proxy every time the settings are opened.
    const invalidFields = Array.from(this._invalidFields).filter((key) => key !== 'ankiProxyUrl');

    this._saveButton.disabled = localChanges.length === 0 || invalidFields.length > 0;
  }

  private _setupJPDBInteraction(): void {
    this._setupInteraction(
      'input[name="jpdbApiToken"]',
      '#apiTokenButton',
      (): Promise<void> => this._testJPDB(),
    );
  }

  private _setupAnkiInteraction(): void {
    // TODO: Check what this commented code does
    // this._view.withElement('input[name="enableAnkiIntegration"]', (inputElement: HTMLInputElement) => {
    //   this._collapsible('anki-endpoints', inputElement.checked);

    //   inputElement.addEventListener('change', () => {
    //     this._collapsible('anki-endpoints', inputElement.checked);
    //   });
    // });

    this._setupInteraction(
      'input[name="ankiUrl"]',
      '#ankiUrlButton',
      (): Promise<void> => this._testAnki(),
    );
    this._setupInteraction(
      'input[name="ankiProxyUrl"]',
      '#ankiProxyUrlButton',
      (): Promise<void> => this._testAnkiProxy(),
    );
  }

  private _setupInteraction(
    inputSelector: string,
    buttonSelector: string,
    testFunction: () => void | Promise<void>,
  ): void {
    withElement(inputSelector, (inputElement: HTMLInputElement) => {
      inputElement.addEventListener('change', (): void => void testFunction());
    });

    withElement(buttonSelector, (buttonElement: HTMLButtonElement) => {
      buttonElement.addEventListener('click', (): void => void testFunction());
    });
  }

  private async _testJPDB(): Promise<void> {
    await this._testEndpoint(
      '#apiTokenButton',
      '[name="jpdbApiToken"]',
      (apiToken) => ping({ apiToken }),
      false,
    );
  }

  private async _testAnki(): Promise<void> {
    await this._testEndpoint(
      '#ankiUrlButton',
      '[name="ankiUrl"]',
      (ankiConnectUrl) => getApiVersion({ ankiConnectUrl }),
      false,
      (ankiConnectUrl: string): void => {
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
      (ankiConnectUrl) => getApiVersion({ ankiConnectUrl }),
      true,
    );
  }

  private async _testEndpoint<T>(
    buttonSelector: string,
    inputSelector: string,
    testFunction: (value: string) => Promise<T>,
    allowEmpty: boolean,
    afterSuccess?: (value: string) => void | Promise<void>,
    afterFail?: () => void,
  ): Promise<void> {
    const button = findElement<'button'>(buttonSelector);
    const input = findElement<'input'>(inputSelector);

    if (allowEmpty && !input.value) {
      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof ConfigurationSchema);

      this._updateSaveButton();

      return;
    }

    try {
      await testFunction(input.value);

      button.classList.remove('v1');
      input.classList.remove('v1');

      this._invalidFields.delete(input.name as keyof ConfigurationSchema);

      await afterSuccess?.(input.value);
    } catch (_error) {
      button.classList.add('v1');
      input.classList.add('v1');

      this._invalidFields.add(input.name as keyof ConfigurationSchema);

      afterFail?.();
    }

    this._updateSaveButton();
  }

  private _animateMiningSection(show: boolean): void {
    const miningElement = findElement<'div'>('#requires-anki');

    if (show) {
      miningElement.removeAttribute('hidden');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- We need to trigger a reflow
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

  //#region Collapsible
  private _collapsible(collapsible: HTMLElement, show: boolean): void {
    const targetHeight = Number(collapsible.getAttribute('data-height') ?? 1000);
    const skipAnimation = collapsible.hasAttribute('skip-animation');

    if (skipAnimation) {
      if (show) {
        collapsible.removeAttribute('hidden');
        collapsible.style.maxHeight = 'unset';

        return;
      }

      collapsible.setAttribute('hidden', '');
      collapsible.style.maxHeight = '0';

      return;
    }

    if (show) {
      collapsible.removeAttribute('hidden');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- We need to trigger a reflow
      collapsible.offsetHeight;

      collapsible.classList.add('is-open');
      collapsible.style.maxHeight = `${targetHeight}px`;

      setTimeout(() => {
        collapsible.classList.add('rem-height');
        collapsible.style.maxHeight = 'unset';
      }, 300);
    } else {
      collapsible.classList.remove('rem-height');
      collapsible.style.maxHeight = `${targetHeight}px`;

      setTimeout(() => {
        collapsible.classList.remove('is-open');
        collapsible.style.maxHeight = '0';

        setTimeout(() => {
          collapsible.setAttribute('hidden', '');
        }, 300);
      }, 50);
    }
  }

  private _setupCollapsibleTriggers(): void {
    const enablers = findElements<'input'>('[enables]');
    const disablers = findElements<'input'>('[disables]');

    enablers.forEach((enabler) => {
      enabler.addEventListener('change', () => {
        const targets = findElements<'div'>(enabler.getAttribute('enables')!);

        targets.forEach((target) => {
          this._collapsible(target, enabler.checked);
        });
      });

      enabler.dispatchEvent(new Event('change'));
    });

    disablers.forEach((disabler) => {
      disabler.addEventListener('change', () => {
        const targets = findElements<'div'>(disabler.getAttribute('disables')!);

        targets.forEach((target) => {
          this._collapsible(target, !disabler.checked);
        });
      });

      disabler.dispatchEvent(new Event('change'));
    });
  }
  //#endregion
}

new SettingsController();
