import { AnkiRequestOptions } from './api.types';
import { request } from './request';

export const getFields = (modelName: string, options?: AnkiRequestOptions): Promise<string[]> =>
  request('modelFieldNames', { modelName }, options);
