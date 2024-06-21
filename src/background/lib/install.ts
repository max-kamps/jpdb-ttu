export const install = async (tab: chrome.tabs.Tab, script: string) => {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [`foreground/scripts/install-${script}.js`],
  });
};
