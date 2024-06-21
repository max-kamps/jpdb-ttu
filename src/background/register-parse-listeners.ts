import { registerListener } from '@lib/messaging/register-listener';
import { parsePage } from './lib/parse/parse-page';
import { parseSelection } from './lib/parse/parse-selection';

registerListener('request-parse-page', async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);

  await parsePage(tab);
});

registerListener('request-parse-selection', async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);

  await parseSelection(tab);
});
