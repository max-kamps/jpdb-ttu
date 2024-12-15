import { PotentialPromise } from '@shared/types';
import {
  BackgroundEventArgs,
  BackgroundEventFunction,
  BackgroundEventResult,
  BackgroundEvents,
} from '../types/background';
import { ExtensionMessage } from '../types/extension-message';

/**
 * Message handler to receive messages from a tab (foreground script).
 *
 * @param {keyof BackgroundEvents} event The message type to handle
 * @param {BackgroundEventFunction} handler The handler for the message
 */
export const receiveTabMessage = <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  handler: BackgroundEventFunction<TEvent>,
): void => {
  chrome.runtime.onMessage.addListener(
    (
      request: ExtensionMessage<BackgroundEvents, TEvent>,
      sender: chrome.runtime.MessageSender,
      sendResponse,
    ): boolean => {
      const args = request.args as BackgroundEventArgs<TEvent>;

      if (request.event !== event) {
        return false;
      }

      const handlerResult: PotentialPromise<BackgroundEventResult<TEvent>> = handler(
        sender,
        ...args,
      );
      const promise = Promise.resolve(handlerResult);

      promise
        .then((result) => {
          sendResponse({ success: true, result });
        })
        .catch((error: Error) => {
          sendResponse({ success: false, error });
        });

      return true;
    },
  );
};
