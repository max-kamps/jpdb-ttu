import { AnkiRequestOptions, request } from './request';

export const getDecks = (options?: AnkiRequestOptions): Promise<string[]> =>
  request('deckNames', {}, options);
