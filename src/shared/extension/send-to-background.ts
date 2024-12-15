function send<T>(event: string, isBroadcast: boolean, ...args: unknown[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    chrome.runtime.sendMessage({ event, isBroadcast, args }, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError as Error);
      }

      resolve(response);
    });
  });
}

export const sendToBackground = <TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  ...args: [...ArgumentsForEvent<BackgroundEvents, TEvent>]
): Promise<ResultForEvent<BackgroundEvents, TEvent>> => send(event, false, ...args);

export const broadcastToBackground = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...ArgumentsForEvent<BroadcastEvents, TEvent>]
): Promise<ResultForEvent<BroadcastEvents, TEvent>> => send(event, true, ...args);
