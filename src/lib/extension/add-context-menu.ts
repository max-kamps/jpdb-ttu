const handlers = new Map<
  string,
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>
>();
let hasInstalled: boolean = false;

function install(): void {
  if (hasInstalled) {
    return;
  }

  hasInstalled = true;

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const id = info.menuItemId as string;

    if (!tab || !handlers.has(id)) {
      return;
    }

    handlers.get(id)(info, tab);
  });
}

export const addContextMenu = (
  options: chrome.contextMenus.CreateProperties,
  handler: (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>,
): void => {
  chrome.contextMenus.create(options);
  handlers.set(options.id, handler);

  install();
};
