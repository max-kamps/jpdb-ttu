import { parsePage, parseSelection } from '@lib/parser';
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

const listeners = {
  'parse-selection': parseSelection,
  'parse-page': parsePage,
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId as keyof typeof listeners;

  if (!tab || !listeners[id]) {
    return;
  }

  await prepareParser(tab.id);
  await listeners[id](tab);
});
