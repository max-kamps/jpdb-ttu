import { BackgroundWorker } from '../background-worker';
import { openNewTab } from '@lib/extension/open-new-tab';
import { addContextMenu } from '@lib/extension/add-context-menu';
import { sendToTab } from '@lib/extension/send-to-tab';

export class ParseInitiator {
  constructor(private _worker: BackgroundWorker) {
    this.installContextMenu();
  }

  private installContextMenu(): void {
    addContextMenu(
      {
        id: 'parse-selection',
        title: 'Parse selected text',
        contexts: ['selection'],
      },
      (_, { id: tabId }) => sendToTab('parseSelection', tabId),
    );

    addContextMenu(
      {
        id: 'parse-page',
        title: 'Parse page',
        contexts: ['page'],
      },
      (_, { id: tabId }) => sendToTab('parsePage', tabId),
    );

    addContextMenu(
      {
        id: 'lookup-selection',
        title: 'Lookup selected text',
        contexts: ['selection'],
      },
      (info) => {
        const urlEncoded = encodeURIComponent(info.selectionText);
        const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

        openNewTab(url);
      },
    );
  }
}
