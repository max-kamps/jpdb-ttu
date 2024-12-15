import { getTabs } from '@shared/extension';
import { BroadcastEventArgs, BroadcastEvents } from '../types/broadcast';
import { broadcastToBackground } from './send-to-background';
import { broadcastToTab } from './send-to-tab';

/**
 * Broadcasts a message to all tabs and the background script.
 *
 * @param {keyof BroadcastEvents} event The message type to broadcast.
 * @param {BroadcastEventArgs} args The arguments to pass to the message.
 */
export const broadcast = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: BroadcastEventArgs<TEvent>
): void => {
  broadcastToBackground(event, ...args);

  void getTabs({}).then((tabs) =>
    tabs.forEach((tab) => {
      if (tab.id) {
        broadcastToTab(event, tab.id, ...args);
      }
    }),
  );
};
