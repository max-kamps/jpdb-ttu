import { ExtensionMessage } from './extension-message.type';

export const onMessage = <TEvent extends string>(
  handler: (
    event: TEvent,
    sender: chrome.runtime.MessageSender,
    ...args: any[]
  ) => void | Promise<void>,
  filter: (message: ExtensionMessage<TEvent>, sender: chrome.runtime.MessageSender) => boolean = ({
    isBroadcast,
  }) => !isBroadcast,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: ExtensionMessage<TEvent>, sender, sendResponse): boolean => {
      const { event, args } = request;

      if (filter && !filter(request, sender)) {
        return false;
      }

      const handlerResult = handler(event, sender, ...args);
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
