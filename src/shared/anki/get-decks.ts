import { AnkiRequestOptions } from './api.types';
import { request } from './request';

export const getDecks = (options?: AnkiRequestOptions): Promise<string[]> =>
  request('deckNames', {}, options);
