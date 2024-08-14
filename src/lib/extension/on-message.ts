export const onMessage = <TEvent>(
  handler: (
    event: TEvent,
    sender: chrome.runtime.MessageSender,
    ...args: any[]
  ) => void | Promise<void>,
): void => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse): boolean => {
    const { event, args } = request;

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
  });
};
