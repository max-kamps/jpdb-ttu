export class Browser {
  public static openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  }

  public static getTabs(
    queryInfo: Parameters<typeof chrome.tabs.query>[0],
  ): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs);
      });
    });
  }

  public static styleUrl(url: string): string {
    return chrome.runtime.getURL(`${url}.css`);
  }

  public static async readStorage(key: string, defaultValue?: string): Promise<string> {
    const result = await chrome.storage.local.get(key);

    return ((result?.[key] ?? defaultValue) as string) ?? undefined;
  }

  public static async writeStorage(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }
}
