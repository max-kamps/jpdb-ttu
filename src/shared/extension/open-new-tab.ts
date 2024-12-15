export const openNewTab = (url: string): Promise<chrome.tabs.Tab> => chrome.tabs.create({ url });
