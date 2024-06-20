import { registerListener } from '@lib/messaging';
import { parsePage } from '@lib/parser/parse-page';

registerListener('requestParsePage', async (tabId: number): Promise<void> => {
  const tab = await chrome.tabs.get(tabId);

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles/word.css'],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['scripts/install-parser.js'],
  });

  await parsePage(tab);
});
