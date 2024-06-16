import { registerListener } from '@lib/messaging';

registerListener('lsr', async (key: string, defaultValue?: string): Promise<string> => {
  const result = await chrome.storage.local.get(key);

  return ((result?.[key] ?? defaultValue) as string) ?? undefined;
});

registerListener('lsw', async (key: string, value: string): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
});
