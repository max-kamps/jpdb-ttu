import { onMessage } from '@shared/extension/on-message';

const remoteListeners: Partial<
  Record<
    string,
    ((sender: chrome.runtime.MessageSender, ...args: unknown[]) => void | Promise<void>)[]
  >
> = {};

onMessage<BackgroundEvents, keyof BackgroundEvents>((event, sender, ...args) => {
  if (!remoteListeners[event]) {
    return;
  }

  remoteListeners[event].forEach((listener) => void listener(sender, ...args));
});

export function onTabMessage<TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  listener: (
    sender: chrome.runtime.MessageSender,
    ...args: [...ArgumentsForEvent<BackgroundEvents, TEvent>]
  ) => PotentialPromise<ResultForEvent<BackgroundEvents, TEvent>>,
): void {
  if (!remoteListeners[event]) {
    remoteListeners[event] = [];
  }

  remoteListeners[event].push(listener);
}
