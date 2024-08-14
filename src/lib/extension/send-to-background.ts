export const sendToBackground = async <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  ...args: [...ArgumentsFor<BackgroundEvents[TEvent]>]
): Promise<ReturnType<BackgroundEvents[TEvent]>> => {
  return new Promise<ReturnType<BackgroundEvents[TEvent]>>((resolve, reject) => {
    chrome.runtime.sendMessage({ event, args }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(response);
    });
  });
};
