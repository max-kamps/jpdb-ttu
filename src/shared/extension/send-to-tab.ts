function send<T>(
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

export const sendToTab = <TEvent extends keyof TabEvents>(
  event: TEvent,
  tabId: number,
  ...args: [...ArgumentsForEvent<TabEvents, TEvent>]
): Promise<ResultForEvent<TabEvents, TEvent>> => send(event, tabId, false, ...args);

export const broadcastToTab = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  tabId: number,
  ...args: [...ArgumentsForEvent<BroadcastEvents, TEvent>]
): Promise<ResultForEvent<BroadcastEvents, TEvent>> => send(event, tabId, true, ...args);
