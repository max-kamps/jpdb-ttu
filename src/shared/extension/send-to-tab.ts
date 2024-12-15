function send<T = void>(
  event: string,
  tabId: number,
  isBroadcast: boolean,
  ...args: unknown[]
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { event, isBroadcast, args }, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(response);
    });
  });
}

export const sendToTab = <TEvent extends keyof TabEvents, TResult>(
  event: TEvent,
  tabId: number,
  ...args: [...TabEvents[TEvent]]
): Promise<TResult> => send(event, tabId, false, ...args);

export const broadcastToTab = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  tabId: number,
  ...args: [...BroadcastEvents[TEvent]]
): Promise<void> => send(event, tabId, true, ...args);
