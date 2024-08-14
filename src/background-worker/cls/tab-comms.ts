import { browser } from '@lib/browser';
import { CommunicationBus } from '@lib/communication-bus';

export class TabComms extends CommunicationBus<TE, BackgroundEvents> {
  public async emit<TEvent extends keyof TabEvents>(
    event: TEvent,
    ...args: [...ArgumentsFor<TE[TEvent]>]
  ): Promise<void> {
    const [tabId, ...rest] = args as [number, ...ArgumentsFor<TabEvents[TEvent]>];

    await browser.sendToTab(event, tabId, ...rest);
  }
}
