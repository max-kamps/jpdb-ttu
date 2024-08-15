export const writeStorage = async (key: string, value: string): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
};
