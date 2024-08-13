import { browser } from './browser';

class Broadcaster {
  private _listeners: Partial<Record<keyof BroadcastEvents, Function[]>> = {};
  private _scope: 'background' | 'tab' | 'extension';

  constructor() {
    this._scope = browser.isWorker()
      ? 'background'
      : browser.isExtensionScreen()
      ? 'extension'
      : 'tab';

    browser.onBroadcast(
      (
        event: keyof BroadcastEvents,
        _,
        ...args: [...BroadcastEvents[keyof BroadcastEvents][0]]
      ) => {
        this.emitLocal(event, ...args);
      },
    );
  }

  public on<TEvent extends keyof BroadcastEvents>(
    event: TEvent,
    listener: (...args: [...BroadcastEvents[TEvent][0]]) => void,
  ): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(listener);
  }

  public off<TEvent extends keyof BroadcastEvents>(
    event: TEvent,
    listener: (...args: [...BroadcastEvents[TEvent][0]]) => void,
  ): void {
    if (!this._listeners[event]) {
      return;
    }
    this._listeners[event] = this._listeners[event].filter((l) => l !== listener);
  }

  public broadcast<TEvent extends keyof BroadcastEvents>(
    options: BroadcastEventOptions<TEvent>,
    ...args: [...BroadcastEvents[TEvent][0]]
  ): void {
    // Events are always emitted everywhere except for the current frame
    // For this reason we check if we want "all" or the current scope, which would include the current frame
    // In that case we emit the event locally. An exception is made for extension screens, those are inteded to be producers only
    if (
      (options.target === 'all' || options.target === this._scope) &&
      !browser.isExtensionScreen()
    ) {
      this.emitLocal(options.event, ...args);
    }

    void this.emitRemote(options, ...args);
  }

  private emitLocal<TEvent extends keyof BroadcastEvents>(
    event: TEvent,
    ...args: [...BroadcastEvents[TEvent][0]]
  ): void {
    if (!this._listeners[event]) {
      return;
    }

    this._listeners[event].forEach((listener) => listener(...args));
  }

  private async emitRemote<TEvent extends keyof BroadcastEvents>(
    options: BroadcastEventOptions<TEvent>,
    ...args: [...BroadcastEvents[TEvent][0]]
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    if (options.target === 'background' || options.target === 'all') {
      promises.push(browser.sendToBackground(options.event, true, ...args));
    }

    if (options.target === 'tab' || options.target === 'all') {
      for (const tab of await browser.getTabs({})) {
        promises.push(browser.sendToTab(tab.id, options.event, true, ...args));
      }
    }

    await Promise.allSettled(promises);
  }
}

export const broadcaster = new Broadcaster();
