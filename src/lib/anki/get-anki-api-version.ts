import { ankiRequest } from './anki-request';
import { AnkiRequestOptions } from './anki.types';

export const getAnkiApiVersion = (options?: AnkiRequestOptions) =>
  ankiRequest('version', {}, options);
