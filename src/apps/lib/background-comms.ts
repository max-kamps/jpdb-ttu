import { browser } from '@lib/browser';

class BackgroundComms {
  private _listeners: Partial<Record<keyof TabEvents, Function[]>> = {};

  constructor() {
    browser.onMessage((event: keyof TabEvents, _, ...args) => {
      if (!this._listeners[event]) {
        return;
      }

      this._listeners[event].forEach((listener) => listener(...args));
    });
  }

  public on<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: (...args: [...TabEvents[TEvent][0]]) => TabEvents[TEvent][1],
  ): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  }
}

export const backgroundComms = new BackgroundComms();
