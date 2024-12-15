export const writeStorage = (key: string, value: string): Promise<void> =>
  chrome.storage.local.set({ [key]: value });
