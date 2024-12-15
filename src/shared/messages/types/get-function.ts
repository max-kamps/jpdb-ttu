import { AnyEvent } from './any-event';
import { BroadcastEvents } from './broadcast';
import { LocalEvents } from './local';
import { TabEvents } from './tab';

/**
 * NOTE:
 * TSError 2334 - Type 'TEvent' does not satisfy the constraint 'keyof TEventBase'.
 * This is a false positive, as the constraint is satisfied by the type definition.
 */

/**
 * Returns the related function for a given event in the event collection.
 */
export type GetFunction<
  TEventBase extends AnyEvent,
  TEvent extends keyof TEventBase = keyof TEventBase,
> = TEventBase extends LocalEvents
  ? // @ts-expect-error: 2334
    LocalEventFunction<TEvent>
  : TEventBase extends TabEvents
    ? // @ts-expect-error: 2334
      TabEventFunction<TEvent>
    : TEventBase extends BroadcastEvents
      ? // @ts-expect-error: 2334
        BroadcastEventFunction<TEvent>
      : // @ts-expect-error: 2334
        BackgroundEventFunction<TEvent>;
