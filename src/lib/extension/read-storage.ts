export const readStorage = async (key: string, defaultValue?: string): Promise<string> => {
  const result = await chrome.storage.local.get(key);

  return ((result?.[key] ?? defaultValue) as string) ?? undefined;
};
