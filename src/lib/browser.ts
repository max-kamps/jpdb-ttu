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

  public isWorker(): boolean {
    return !!chrome.contextMenus;
  }

  public isExtensionScreen(): boolean {
    return window.location.protocol === 'chrome-extension:';
  }

  public async sendToBackground<TEvent extends keyof BackgroundEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<BackgroundEvents[TEvent]>]
  ): Promise<ReturnType<BackgroundEvents[TEvent]>> {
    return new Promise<ReturnType<BackgroundEvents[TEvent]>>((resolve, reject) => {
      chrome.runtime.sendMessage({ event, args }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }

        resolve(response);
      });
    });
  }

  public async sendToTab<TEvent extends keyof TabEvents>(
    event: TEvent,
    tabId: number,
    ...args: [...ArgumentsFor<TabEvents[TEvent]>]
  ): Promise<ReturnType<TabEvents[TEvent]>> {
    return new Promise<ReturnType<TabEvents[TEvent]>>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { event, args }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }

        resolve(response);
      });
    });
  }

  public onMessage<TEvent>(
    handler: (
      event: TEvent,
      sender: chrome.runtime.MessageSender,
      ...args: any[]
    ) => void | Promise<void>,
  ): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse): boolean => {
      const { event, args } = request;

      const handlerResult = handler(event as TEvent, sender, ...args);
      const promise =
        handlerResult instanceof Promise ? handlerResult : Promise.resolve(handlerResult);

      promise
        .then((result) => {
          sendResponse({ success: true, result });
        })
        .catch((error) => {
          sendResponse({ success: false, error });
        });

      return true;
    });
  }

  private installContextMenuHandler(): void {
    if (this.isWorker()) {
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
