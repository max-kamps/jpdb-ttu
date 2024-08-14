import { Browser } from '@lib/browser';
import { BackgroundWorker } from '../background-worker';
import { TabComms } from './tab-comms';

export class ParseInitiator {
  constructor(private _worker: BackgroundWorker) {
    this.installContextMenu();
  }

  private installContextMenu(): void {
    const browser = Browser.getInstance();

    browser.installContextMenu(
      {
        id: 'parse-selection',
        title: 'Parse selected text',
        contexts: ['selection'],
      },
      (_, { id: tabId }) => TabComms.getInstance().emit('parseSelection', tabId),
    );

    browser.installContextMenu(
      {
        id: 'parse-page',
        title: 'Parse page',
        contexts: ['page'],
      },
      (_, { id: tabId }) => TabComms.getInstance().emit('parsePage', tabId),
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
