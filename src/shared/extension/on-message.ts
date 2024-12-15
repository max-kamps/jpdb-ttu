import { ExtensionMessage } from './extension-message.type';

export const onMessage = <Collection extends EventTypes, Key extends keyof Collection>(
  handler: (
    event: Key,
    sender: chrome.runtime.MessageSender,
    // @ts-expect-error: This always resolves an array type
    ...args: [...ArgumentsForEvent<Collection, Key>]
  ) => void | Promise<void>,
  filter: (
    message: ExtensionMessage<Collection, Key>,
    sender: chrome.runtime.MessageSender,
  ) => boolean = ({ isBroadcast }): boolean => !isBroadcast,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: ExtensionMessage<Collection, Key>, sender, sendResponse): boolean => {
      const { event, args } = request;

      if (filter && !filter(request, sender)) {
        return false;
      }

      // @ts-expect-error: Tuples...
      const handlerResult = handler(event, sender, ...args);
      const promise =
        handlerResult instanceof Promise ? handlerResult : Promise.resolve(handlerResult);

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
