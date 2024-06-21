import { registerListener } from '@lib/messaging';
import { getParseSelector, parsePage, parseSelection } from '@lib/parser';
import { prepareParser } from '../lib/prepare-parser';

registerListener('requestParsePage', async (tabId: number): Promise<void> => {
  const tab = await chrome.tabs.get(tabId);

  const parseFilter = await getParseSelector(tab);

  await prepareParser(tabId);
  await parsePage(tab, parseFilter);
});

registerListener('requestParseSelection', async (tabId: number): Promise<void> => {
  const tab = await chrome.tabs.get(tabId);

  await prepareParser(tabId);
  await parseSelection(tab);
});
