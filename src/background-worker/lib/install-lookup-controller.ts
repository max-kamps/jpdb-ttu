import { addContextMenu } from '@shared/extension/add-context-menu';
import { openNewTab } from '@shared/extension/open-new-tab';
import { onTabMessage } from './on-tab-message';

function lookupText(text: string | undefined): void {
  if (!text?.length) {
    return;
  }

  const urlEncoded = encodeURIComponent(text);
  const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

  void openNewTab(url);
}

export function installLookupController(): void {
  onTabMessage('lookupText', (_, text) => lookupText(text));

  addContextMenu(
    {
      id: 'lookup-selection',
      title: 'Lookup selected text',
      contexts: ['selection'],
    },
    (info) => lookupText(info.selectionText),
  );
}
