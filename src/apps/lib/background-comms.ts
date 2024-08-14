import { Browser } from '@lib/browser';
import { CommunicationBus } from '@lib/communication-bus';

export class BackgroundComms extends CommunicationBus<BackgroundEvents, TabEvents> {
  //#region Singleton
  private static _instance: BackgroundComms;
  public static getInstance(): BackgroundComms {
    if (!BackgroundComms._instance) {
      BackgroundComms._instance = new BackgroundComms();
    }

    return BackgroundComms._instance;
  }
  //#endregion

  public async emit<TEvent extends keyof BackgroundEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<BackgroundEvents[TEvent]>]
  ): Promise<void> {
    await Browser.getInstance().sendToBackground(event, ...args);
  }
}
