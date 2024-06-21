import { getParseSelector, parsePage, parseSelection } from '@lib/parser';
import { prepareParser } from '../lib/prepare-parser';

chrome.contextMenus.create({
  id: 'parse-selection',
  title: 'Parse selected text',
  contexts: ['selection'],
});
chrome.contextMenus.create({
  id: 'parse-page',
  title: 'Parse page',
  contexts: ['page'],
});

const listeners: string[] = ['parse-selection', 'parse-page'];

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId as string;

  if (!tab || !listeners.includes(id)) {
    return;
  }

  await prepareParser(tab.id);

  switch (id) {
    case 'parse-page':
      const selector = await getParseSelector(tab);

      await parsePage(tab, selector);

      break;
    case 'parse-selection':
      await parseSelection(tab);

      break;
  }
});
