import { ankiRequest } from './anki-request';
import { AnkiRequestOptions } from './anki.types';

export const getAnkiFields = (modelName: string, options?: AnkiRequestOptions) =>
  ankiRequest<string[]>('modelFieldNames', { modelName }, options);
