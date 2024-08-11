import { ankiRequest } from './anki-request';
import { AnkiRequestOptions } from './anki.types';

export const getAnkiDecks = (options?: AnkiRequestOptions) =>
  ankiRequest<string[]>('deckNames', {}, options);
