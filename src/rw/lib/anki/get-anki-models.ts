import { ankiRequest } from './anki-request';
import { AnkiRequestOptions } from './anki.types';

export const getAnkiModels = (options?: AnkiRequestOptions) =>
  ankiRequest<string[]>('modelNames', {}, options);
