import { parse } from '@lib/parser/parse';

const contextId = chrome.contextMenus.create({
  id: 'parse',
  title: 'Parse selected text',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === contextId && tab) {
    await parse(tab.id, info.selectionText);
  }
});
