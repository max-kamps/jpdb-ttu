import { BackgroundEvents } from './background';
import { BroadcastEvents } from './broadcast';
import { LocalEvents } from './local';
import { TabEvents } from './tab';

export type AnyEvent = LocalEvents | TabEvents | BroadcastEvents | BackgroundEvents;
