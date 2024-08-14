export class EventBus<TEventMap> {
  protected listeners: Partial<Record<keyof TEventMap, Function[]>> = {};

  public on<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener as Function);
  }

  public off<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent]): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  public emit<TEvent extends keyof TEventMap>(
    event: TEvent,
    ...args: [...ArgumentsFor<TEventMap[TEvent]>]
  ): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach((listener) => listener(...args));
  }
}

type OnlyFn<T extends object> = {
  [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K] extends (
    ...args: any
  ) => any
    ? T[K]
    : never;
};

type Test = OnlyFn<LocalEvents>;

type a = LocalEvents;
type b = 'jpdbReviewSomething';
type c = a[b];
type d = Parameters<c>;
type e = ArgumentsFor<c>;
