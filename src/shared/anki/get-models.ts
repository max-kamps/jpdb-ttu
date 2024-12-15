import { AnkiRequestOptions } from './api.types';
import { request } from './request';

export const getModels = (options?: AnkiRequestOptions): Promise<string[]> =>
  request('modelNames', {}, options);
