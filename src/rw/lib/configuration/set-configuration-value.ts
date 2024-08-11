const writeStorage = async (key: string, value: string): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
};

export const setConfigurationValue = async <K extends keyof Configuration>(
  key: K,
  value: Configuration[K],
): Promise<void> => {
  await writeStorage(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};
