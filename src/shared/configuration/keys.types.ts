import { DeckConfiguration, DiscoverWordConfiguration } from '@shared/anki';
import { FilterKeys } from '@shared/types';
import { ConfigurationSchema, Keybind } from './types';

export type ConfigurationNumberKeys = FilterKeys<ConfigurationSchema, number>[];
export type ConfigurationBooleanKeys = FilterKeys<ConfigurationSchema, boolean>[];
export type ConfigurationObjectKeys = FilterKeys<
  ConfigurationSchema,
  Keybind | DeckConfiguration | DiscoverWordConfiguration[]
>[];
