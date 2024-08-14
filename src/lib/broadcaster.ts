import { Browser } from './browser';
import { CommunicationBus } from './communication-bus';

export class Broadcaster extends CommunicationBus<BroadcastEvents, BroadcastEvents> {
  //#region Singleton
  private static _instance: Broadcaster;
  public static getInstance(): Broadcaster {
    if (!Broadcaster._instance) {
      Broadcaster._instance = new Broadcaster();
    }

    return Broadcaster._instance;
  }
  //#endregion

  public async emit<TEvent extends keyof BroadcastEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<BroadcastEvents[TEvent]>]
  ): Promise<void> {
    const promises: Promise<any>[] = [];
    const browser = Browser.getInstance();

    // The browser does not send events to itself, so we need to emit them manually
    if (browser.isWorker()) {
      this._receiver.emit(event, ...args);
    }

    promises.push(browser.sendToBackground(event, ...args));

    for (const tab of await browser.getTabs({})) {
      promises.push(browser.sendToTab(event, tab.id, ...args));
    }

    await Promise.allSettled(promises);
  }
}
