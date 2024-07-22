import { parsePage } from '../lib/parse/parse-page';
import { parseSelection } from '../lib/parse/parse-selection';

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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId as string;

  if (!tab) {
    return;
  }

  switch (id) {
    case 'parse-page':
      await parsePage(tab);

      break;
    case 'parse-selection':
      await parseSelection(tab);

      break;
  }
});
