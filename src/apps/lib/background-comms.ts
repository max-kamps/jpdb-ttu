import { browser } from '@lib/browser';
import { CommunicationBus } from '@lib/communication-bus';

export class BackgroundComms extends CommunicationBus<BackgroundEvents, TabEvents> {
  public async emit<TEvent extends keyof BackgroundEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<BackgroundEvents[TEvent]>]
  ): Promise<void> {
    await browser.sendToBackground(event, ...args);
  }
}
