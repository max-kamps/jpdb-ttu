const handlers = new Map<
  string,
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>
>();
let hasInstalled = false;

function install(): void {
  if (hasInstalled) {
    return;
  }

  hasInstalled = true;

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const id = info.menuItemId as string;
    const handler = handlers.get(id);

    if (!tab || !handler) {
      return;
    }

    void handler(info, tab);
  });
}

export const addContextMenu = (
  options: chrome.contextMenus.CreateProperties,
  handler: (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>,
): void => {
  const { id } = options;

  if (!id || handlers.has(id)) {
    return;
  }

  chrome.contextMenus.create(options);
  handlers.set(id, handler);

  install();
};
