import { addContextMenu } from '@lib/extension/add-context-menu';
import { openNewTab } from '@lib/extension/open-new-tab';
import { onTabMessage } from './on-tab-message';

function lookupText(text: string): void {
  if (!text?.length) {
    console.error('No text selected');

    return;
  }

  const urlEncoded = encodeURIComponent(text);
  const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

  openNewTab(url);
}

export async function installLookupController(): Promise<void> {
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
