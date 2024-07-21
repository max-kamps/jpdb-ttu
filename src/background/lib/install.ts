import { getTabCallable } from '@lib/messaging/get-tab-callable';

const isInstalledRemote = getTabCallable<[script: string], boolean>('has-installed-script', true);
const isInstalled = async (tab: chrome.tabs.Tab, script: string) => {
  const isInstalled = await isInstalledRemote(tab, script);

  return Boolean(isInstalled);
};

export const install = async (tab: chrome.tabs.Tab, script: string) => {
  if (await isInstalled(tab, script)) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [`foreground/scripts/install-${script}.js`],
  });
};
