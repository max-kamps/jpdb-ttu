function send<TEvent extends keyof BackgroundEvents | keyof BroadcastEvents, TResult = void>(
  event: TEvent,
  isBroadcast: boolean,
  ...args: unknown[]
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    chrome.runtime.sendMessage({ event, isBroadcast, args }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(response as TResult);
    });
  });
}

export const sendToBackground = <TEvent extends keyof BackgroundEvents, TResult = void>(
  event: TEvent,
  ...args: [...BackgroundEvents[TEvent]]
): Promise<TResult> => send(event, false, ...args);

export const broadcastToBackground = <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...BroadcastEvents[TEvent]]
): Promise<void> => send(event, true, ...args);
