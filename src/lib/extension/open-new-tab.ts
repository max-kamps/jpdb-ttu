export const openNewTab = (url: string): void => {
  chrome.tabs.create({ url });
};
