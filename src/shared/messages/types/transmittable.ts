import { BackgroundEvents } from './background';
import { BroadcastEvents } from './broadcast';
import { TabEvents } from './tab';

export type Transmittable = TabEvents | BroadcastEvents | BackgroundEvents;
