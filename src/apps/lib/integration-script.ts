import { onMessage } from '@lib/extension/on-message';

const remoteListeners: Partial<Record<keyof TabEvents, Function[]>> = {};

onMessage<keyof TabEvents>((event, _, ...args) => {
  if (!remoteListeners[event]) {
    return;
  }

  remoteListeners[event].forEach((listener) => listener(...args));
});

export abstract class IntegrationScript {
  protected static _localListeners: Partial<Record<keyof LocalEvents, Function[]>> = {};

  protected on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: LocalEvents[TEvent],
  ): void {
    if (!IntegrationScript._localListeners[event]) {
      IntegrationScript._localListeners[event] = [];
    }

    IntegrationScript._localListeners[event].push(listener as Function);
  }

  protected emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<LocalEvents[TEvent]>]
  ): void {
    if (!IntegrationScript._localListeners[event]) {
      return;
    }

    IntegrationScript._localListeners[event].forEach((listener) => listener(...args));
  }

  protected listen<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: TabEvents[TEvent],
  ): void {
    if (!remoteListeners[event]) {
      remoteListeners[event] = [];
    }

    remoteListeners[event].push(listener as Function);
  }
}
