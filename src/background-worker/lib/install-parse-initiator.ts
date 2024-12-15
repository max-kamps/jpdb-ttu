import { addContextMenu } from '@shared/extension';
import { sendToTab } from '@shared/messages';

export function installParseInitiator(): void {
  addContextMenu(
    {
      id: 'parse-selection',
      title: 'Parse selected text',
      contexts: ['selection'],
    },
    (_, { id: tabId }) => sendToTab('parseSelection', tabId!),
  );

  addContextMenu(
    {
      id: 'parse-page',
      title: 'Parse page',
      contexts: ['page'],
    },
    (_, { id: tabId }) => sendToTab('parsePage', tabId!),
  );
}
