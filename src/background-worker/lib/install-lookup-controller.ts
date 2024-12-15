import { addContextMenu, openNewTab } from '@shared/extension';
import { receiveTabMessage } from '@shared/messages';

function lookupText(text: string | undefined): void {
  if (!text?.length) {
    return;
  }

  const urlEncoded = encodeURIComponent(text);
  const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

  void openNewTab(url);
}

export function installLookupController(): void {
  receiveTabMessage('lookupText', (_, text) => lookupText(text));

  addContextMenu(
    {
      id: 'lookup-selection',
      title: 'Lookup selected text',
      contexts: ['selection'],
    },
    (info) => lookupText(info.selectionText),
  );
}
