import { getParseSelector } from '@lib/parser/get-parse-selector';
import { prepareParser } from '../lib/prepare-parser';
import { registerListener } from '@lib/messaging/register-listener';
import { parsePage } from '@lib/parser/parse-page';
import { parseSelection } from '@lib/parser/parse-selection';

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
