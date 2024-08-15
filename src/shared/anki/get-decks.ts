import { AnkiRequestOptions, request } from './request';

export const getDecks = async (options?: AnkiRequestOptions): Promise<string[]> => {
  return request('deckNames', {}, options);
};
