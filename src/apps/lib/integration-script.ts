import { displayToast } from '@shared/dom/display-toast';
import { onMessage } from '@shared/extension/on-message';
import { sendToBackground } from '@shared/extension/send-to-background';
import { AppCache } from './app-cache';

onMessage<keyof TabEvents>((event, _, ...args) => {
  if (!AppCache.instance.remoteListeners[event]) {
    return;
  }

  AppCache.instance.remoteListeners[event].forEach((listener) => listener(...args));
});

export abstract class IntegrationScript {
  protected isMainFrame = window === window.top;

  protected on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: LocalEvents[TEvent],
  ): void {
    if (!AppCache.instance.localListeners[event]) {
      AppCache.instance.localListeners[event] = [];
    }

    AppCache.instance.localListeners[event].push(listener as Function);
  }

  protected emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<LocalEvents[TEvent]>]
  ): void {
    if (!AppCache.instance.localListeners[event]) {
      return;
    }

    AppCache.instance.localListeners[event].forEach((listener) => listener(...args));
  }

  protected listen<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: TabEvents[TEvent],
  ): void {
    if (!AppCache.instance.remoteListeners[event]) {
      AppCache.instance.remoteListeners[event] = [];
    }

    AppCache.instance.remoteListeners[event].push(listener as Function);
  }

  protected lookupText(text: string): void {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    sendToBackground('lookupText', text);
  }
}
