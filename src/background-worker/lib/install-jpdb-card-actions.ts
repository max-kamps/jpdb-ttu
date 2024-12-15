import { broadcast } from '@shared/broadcaster/broadcast';
import { getConfiguration } from '@shared/configuration/get-configuration';
import { sendToTab } from '@shared/extension/send-to-tab';
import { getCardState } from '@shared/jpdb/get-card-state';
import { onTabMessage } from './on-tab-message';

async function getDeck(
  sender: chrome.runtime.MessageSender,
  key: 'mining' | 'blacklist' | 'neverForget',
): Promise<string | false> {
  const deck = await getConfiguration(
    `jpdb${key[0].toUpperCase()}${key.slice(1)}Deck` as
      | 'jpdbMiningDeck'
      | 'jpdbBlacklistDeck'
      | 'jpdbNeverForgetDeck',
  );

  if (!deck) {
    await sendToTab('toast', sender.tab!.id!, 'error', `No deck selected for ${key}`);

    return false;
  }

  return deck;
}

async function manageDeck(
  sender: chrome.runtime.MessageSender,
  vid: number,
  sid: number,
  deck: 'mining' | 'blacklist' | 'neverForget',
  action: 'add' | 'remove',
): Promise<void> {
  // TODO: Ignore events when user is not logged in
  const deckName = await getDeck(sender, deck);

  if (!deckName) {
    return;
  }

  if (action === 'add') {
    // TODO: Implement
    // eslint-disable-next-line no-console
    console.log(`Adding ${vid}:${sid} to ${deckName}...`);
  } else {
    // TODO: Implement
    // eslint-disable-next-line no-console
    console.log(`Removing ${vid}:${sid} from ${deckName}...`);
  }
}

export const installJpdbCardActions = (): void => {
  onTabMessage('updateCardState', async (_, vid: number, sid: number) => {
    const newCardState = await getCardState(vid, sid);

    await broadcast('cardStateUpdated', vid, sid, newCardState);
  });

  onTabMessage(
    'addToDeck',
    async (
      sender: chrome.runtime.MessageSender,
      vid: number,
      sid: number,
      // TODO: Add more context!
      deck: 'mining' | 'blacklist' | 'neverForget',
    ) => {
      await manageDeck(sender, vid, sid, deck, 'add');
    },
  );

  onTabMessage(
    'removeFromDeck',
    async (
      sender: chrome.runtime.MessageSender,
      vid: number,
      sid: number,
      // TODO: Add more context!
      deck: 'mining' | 'blacklist' | 'neverForget',
    ) => {
      await manageDeck(sender, vid, sid, deck, 'remove');
    },
  );
};
