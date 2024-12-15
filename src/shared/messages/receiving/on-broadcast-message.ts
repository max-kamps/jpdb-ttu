import { BroadcastEventArgs, BroadcastEventFunction, BroadcastEvents } from '../types/broadcast';
import { ExtensionMessage } from '../types/extension-message';

/**
 * Message handler to receive broadcasted messages.
 */
export const onBroadcastMessage = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  handler: BroadcastEventFunction<TEvent>,
): void => {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage<BroadcastEvents, TEvent>): boolean => {
      if (message.event !== event) {
        return false;
      }

      void handler(...(message.args as BroadcastEventArgs<TEvent>));

      return true;
    },
  );
};
