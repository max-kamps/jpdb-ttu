export const parse = async (tabId: number, text?: string) => {
  const tab = await chrome.tabs.get(tabId);

  if (!tab) {
    return;
  }

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles/word.css'],
    origin: 'AUTHOR',
  });

  const { result: customWordCSS } = await chrome.storage.local.get('customWordCSS');

  if (customWordCSS?.length) {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: customWordCSS,
      origin: 'AUTHOR',
    });
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['integrations/parse_selection.js'],
  });
};
