export const injectStyle = async (tab: chrome.tabs.Tab, style: string) => {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: [`styles/${style}.css`],
  });
};
