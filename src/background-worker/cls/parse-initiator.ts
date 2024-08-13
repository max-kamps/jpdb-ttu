import { browser } from '@lib/browser';
import { BackgroundWorker } from '../background-worker';

export class ParseInitiator {
  constructor(private _worker: BackgroundWorker) {
    this.installContextMenu();
  }

  private installContextMenu(): void {
    browser.installContextMenu(
      {
        id: 'parse-selection',
        title: 'Parse selected text',
        contexts: ['selection'],
      },
      (_, { id: tabId }) => browser.sendToTab(tabId, 'parseSelection', false),
    );

    browser.installContextMenu(
      {
        id: 'parse-page',
        title: 'Parse page',
        contexts: ['page'],
      },
      (_, { id: tabId }) => browser.sendToTab(tabId, 'parsePage', false),
    );

    browser.installContextMenu(
      {
        id: 'lookup-selection',
        title: 'Lookup selected text',
        contexts: ['selection'],
      },
      (info) => {
        const urlEncoded = encodeURIComponent(info.selectionText);
        const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

        browser.openNewTab(url);
      },
    );
  }
}
