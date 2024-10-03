function send(event: string, isBroadcast: boolean, ...args: any[]): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage({ event, isBroadcast, args }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(response);
    });
  });
}

export const sendToBackground = async <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  ...args: [...BackgroundEvents[TEvent]]
): Promise<void> => send(event, false, ...args);

export const broadcastToBackground = async <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...BroadcastEvents[TEvent]]
): Promise<void> => send(event, true, ...args);
