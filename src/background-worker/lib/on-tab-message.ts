import { onMessage } from '@shared/extension/on-message';

const remoteListeners: Partial<
  Record<
    keyof BackgroundEvents,
    ((
      sender: chrome.runtime.MessageSender,
      ...args: [...BackgroundEvents[keyof BackgroundEvents]]
    ) => void | Promise<void>)[]
  >
> = {};

onMessage<keyof BackgroundEvents, [...BackgroundEvents[keyof BackgroundEvents]]>(
  (event, sender, ...args) => {
    if (!remoteListeners[event]) {
      return;
    }

    remoteListeners[event].forEach((listener) => void listener(sender, ...args));
  },
);

export function onTabMessage<TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  listener: (
    sender: chrome.runtime.MessageSender,
    ...args: [...BackgroundEvents[TEvent]]
  ) => void | Promise<void>,
): void {
  if (!remoteListeners[event]) {
    remoteListeners[event] = [];
  }

  remoteListeners[event].push(listener);
}
