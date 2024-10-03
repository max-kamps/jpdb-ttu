export interface ExtensionMessage<TEvent extends string> {
  event: TEvent;
  isBroadcast: boolean;
  args: any[];
}
