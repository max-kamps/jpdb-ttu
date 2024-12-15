export interface ExtensionMessage<Collection extends EventTypes, Key extends keyof Collection> {
  event: Key;
  isBroadcast: boolean;
  args: ArgumentsForEvent<Collection, Key>;
}
