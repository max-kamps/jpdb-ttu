export const sendToTab = <TEvent extends keyof TabEvents>(
  event: TEvent,
  tabId: number,
  ...args: [...ArgumentsFor<TabEvents[TEvent]>]
): Promise<ReturnType<TabEvents[TEvent]>> => {
  return new Promise<ReturnType<TabEvents[TEvent]>>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { event, args }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(response);
    });
  });
};
