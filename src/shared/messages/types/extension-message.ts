import { GetFunction } from './get-function';
import { Transmittable } from './transmittable';

export interface ExtensionMessage<
  TEventBase extends Transmittable,
  TEvent extends keyof TEventBase,
> {
  event: TEvent;
  isBroadcast: boolean;
  args: Parameters<GetFunction<TEventBase, TEvent>>;
}
