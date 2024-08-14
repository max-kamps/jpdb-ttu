import { Browser } from '@lib/browser';
import { CommunicationBus } from '@lib/communication-bus';

export class TabComms extends CommunicationBus<TE, BackgroundEvents> {
  //#region Singleton
  private static _instance: TabComms;
  public static getInstance(): TabComms {
    if (!TabComms._instance) {
      TabComms._instance = new TabComms();
    }

    return TabComms._instance;
  }
  //#endregion

  public async emit<TEvent extends keyof TabEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<TE[TEvent]>]
  ): Promise<void> {
    const [tabId, ...rest] = args as [number, ...ArgumentsFor<TabEvents[TEvent]>];

    await Browser.getInstance().sendToTab(event, tabId, ...rest);
  }
}
