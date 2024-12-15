import { ExtensionMessage } from './extension-message.type';

export const onMessage = <TEvent extends string, TEventArgs extends unknown[]>(
  handler: (
    event: TEvent,
    sender: chrome.runtime.MessageSender,
    ...args: TEventArgs
  ) => void | Promise<void>,
  filter: (
    message: ExtensionMessage<TEvent, TEventArgs>,
    sender: chrome.runtime.MessageSender,
  ) => boolean = ({ isBroadcast }): boolean => !isBroadcast,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: ExtensionMessage<TEvent, TEventArgs>, sender, sendResponse): boolean => {
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
        .catch((error: Error) => {
          sendResponse({ success: false, error });
        });

      return true;
    },
  );
};
