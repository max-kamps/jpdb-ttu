function send(event: string, tabId: number, isBroadcast: boolean, ...args: any[]): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { event, isBroadcast, args }, (response) => {
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
  ...args: [...TabEvents[TEvent]]
): Promise<void> => send(event, tabId, false, ...args);

export const broadcastToTab = async <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  tabId: number,
  ...args: [...BroadcastEvents[TEvent]]
): Promise<void> => send(event, tabId, true, ...args);
