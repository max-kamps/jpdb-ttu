import { getConfiguration } from '@shared/configuration';
import { getCardState } from '@shared/jpdb';
import { broadcast, sendToTab, receiveTabMessage } from '@shared/messages';

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
  receiveTabMessage('updateCardState', async (_, vid: number, sid: number) => {
    const newCardState = await getCardState(vid, sid);

    broadcast('cardStateUpdated', vid, sid, newCardState);
  });

  receiveTabMessage(
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

  receiveTabMessage(
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
