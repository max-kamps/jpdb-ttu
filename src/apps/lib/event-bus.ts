class EventBus {
  private listeners: Partial<Record<keyof LocalEvents, Function[]>> = {};

  public on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: (...args: [...LocalEvents[TEvent][0]]) => LocalEvents[TEvent][1],
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
  }

  public off<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: (...args: [...LocalEvents[TEvent][0]]) => LocalEvents[TEvent][1],
  ): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  public emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...LocalEvents[TEvent][0]]
  ): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach((listener) => listener(...args));
  }
}

export const eventBus = new EventBus();
