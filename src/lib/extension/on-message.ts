import { ExtensionMessage } from './extension-message.type';

export const onMessage = <TEvent>(
  handler: (
    event: TEvent,
    sender: chrome.runtime.MessageSender,
    ...args: any[]
  ) => void | Promise<void>,
  filter: (message: ExtensionMessage, sender: chrome.runtime.MessageSender) => boolean = ({
    isBroadcast,
  }) => !isBroadcast,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: ExtensionMessage, sender, sendResponse): boolean => {
      const { event, args } = request;

      if (filter && !filter(request, sender)) {
        return false;
      }

      const handlerResult = handler(event as TEvent, sender, ...args);
      const promise =
        handlerResult instanceof Promise ? handlerResult : Promise.resolve(handlerResult);

      promise
        .then((result) => {
          sendResponse({ success: true, result });
        })
        .catch((error) => {
          sendResponse({ success: false, error });
        });

      return true;
    },
  );
};
