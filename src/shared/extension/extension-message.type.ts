export interface ExtensionMessage<TEvent extends string, TEventArgs extends unknown[]> {
  event: TEvent;
  isBroadcast: boolean;
  args: TEventArgs;
}
