class Browser {
  private _contextHandlers = new Map<
    string,
    (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>
  >();

  constructor() {
    this.installContextMenuHandler();
  }

  public openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
  }

  public getTabs(queryInfo: Parameters<typeof chrome.tabs.query>[0]): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs);
      });
    });
  }

  public openNewTab(url: string): void {
    chrome.tabs.create({ url });
  }

  public styleUrl(url: string): string {
    return chrome.runtime.getURL(`${url}.css`);
  }

  public installContextMenu(
    options: chrome.contextMenus.CreateProperties,
    handler: (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>,
  ): void {
    chrome.contextMenus.create(options);

    this._contextHandlers.set(options.id, handler);
  }

  public async readStorage(key: string, defaultValue?: string): Promise<string> {
    const result = await chrome.storage.local.get(key);

    return ((result?.[key] ?? defaultValue) as string) ?? undefined;
  }

  public async writeStorage(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  private installContextMenuHandler(): void {
    if (chrome.contextMenus) {
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        const id = info.menuItemId as string;

        if (!tab || !this._contextHandlers.has(id)) {
          return;
        }

        this._contextHandlers.get(id)(info, tab);
      });
    }
  }
}

export const browser = new Browser();
