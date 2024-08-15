import { onMessage } from '@shared/extension/on-message';

const remoteListeners: Partial<Record<keyof BackgroundEvents, Function[]>> = {};

onMessage<keyof BackgroundEvents>((event, sender, ...args) => {
  if (!remoteListeners[event]) {
    return;
  }

  remoteListeners[event].forEach((listener) => listener(sender, ...args));
});

export function onTabMessage<TEvent extends keyof BackgroundEvents>(
  event: TEvent,
  listener: (
    sender: chrome.runtime.MessageSender,
    ...args: [...Parameters<BackgroundEvents[TEvent]>]
  ) => ReturnType<BackgroundEvents[TEvent]>,
): void {
  if (!remoteListeners[event]) {
    remoteListeners[event] = [];
  }

  remoteListeners[event].push(listener as Function);
}
