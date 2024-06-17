import {
  DEFAULT_CONFIGURATION,
  getConfigurationValue,
  setConfigurationValue,
} from '@lib/configuration';
import { findElement, withElement, withElements } from '@lib/renderer';

// We keep track of the last saved configuration and the local changes. With this information, we can enable or disable the save button.
const lastSavedConfiguration = new Map<keyof Configuration, Configuration[keyof Configuration]>();
const localChanges = new Set<keyof Configuration>();

// The save button is disabled by default. It will be enabled when there are local changes.
const saveButton = findElement<'button'>('#save-all-settings');

// When the save button is clicked, we iterate over the local changes and save them. We also update the last saved configuration.
saveButton.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();

  saveButton.disabled = true;

  localChanges.forEach(async (key) => {
    const el = findElement<'input' | 'textarea'>(`[name="${key}"]`);
    const value = el.type === 'checkbox' ? (el as HTMLInputElement).checked : el.value;

    await setConfigurationValue(key, value);

    lastSavedConfiguration.set(key, value);
    localChanges.delete(key);
  });
});

// We iterate over all the input and textarea elements in the settings page. We set the value of each element to the last saved configuration. We also keep track of the local changes.
withElements('input, textarea', async (el: HTMLInputElement | HTMLTextAreaElement) => {
  const name = el.name as keyof Configuration;

  // Special case for the save button.
  if (!name) {
    return;
  }

  const savedConfiguration = await getConfigurationValue(name, DEFAULT_CONFIGURATION[name]);

  lastSavedConfiguration.set(name, savedConfiguration);

  // We set the value of the element to the saved configuration. This is basically our way to load the configuration.
  if (el.type === 'checkbox') {
    (el as HTMLInputElement).checked = savedConfiguration as boolean;
  } else {
    el.value = savedConfiguration as string;
  }

  // We keep track of the local changes. We enable the save button if there are local changes.
  el.onchange = () => {
    const lastSaved = lastSavedConfiguration.get(name);
    const current = el.type === 'checkbox' ? (el as HTMLInputElement).checked : el.value;

    if (lastSaved === current) {
      localChanges.delete(name);
    } else {
      localChanges.add(name);
    }

    saveButton.disabled = localChanges.size === 0;
  };
});
