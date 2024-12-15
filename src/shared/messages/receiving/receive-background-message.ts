import { PotentialPromise } from '@shared/types';
import { ExtensionMessage } from '../types/extension-message';
import { TabEventArgs, TabEventFunction, TabEventResult, TabEvents } from '../types/tab';

/**
 * Message handler to receive messages from the background script.
 *
 * @param {keyof TabEvents} event The message type to handle
 * @param {TabEventFunction} handler The handler for the message
 */
export const receiveBackgroundMessage = <TEvent extends keyof TabEvents>(
  event: TEvent,
  handler: TabEventFunction<TEvent>,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: ExtensionMessage<TabEvents, TEvent>, _, sendResponse): boolean => {
      const args = request.args as TabEventArgs<TEvent>;

      if (request.event !== event) {
        return false;
      }

      const handlerResult: PotentialPromise<TabEventResult<TEvent>> = handler(...args);
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
