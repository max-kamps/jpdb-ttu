import { browser } from './browser';
import { EventBus } from './event-bus';

export abstract class CommunicationBus<TSending, TReceiving> {
  protected _receiver = new EventBus<TReceiving>();

  constructor() {
    browser.onMessage(
      (event: keyof TReceiving, _, ...args: [...ArgumentsFor<TReceiving[keyof TReceiving]>]) => {
        this._receiver.emit(event, ...args);
      },
    );
  }

  public on<TEvent extends keyof TReceiving>(event: TEvent, listener: TReceiving[TEvent]): void {
    this._receiver.on(event, listener);
  }

  public off<TEvent extends keyof TReceiving>(event: TEvent, listener: TReceiving[TEvent]): void {
    this._receiver.off(event, listener);
  }

  public abstract emit<TEvent extends keyof TSending>(
    event: TEvent,
    ...args: [...ArgumentsFor<TSending[TEvent]>]
  ): Promise<void>;
}
