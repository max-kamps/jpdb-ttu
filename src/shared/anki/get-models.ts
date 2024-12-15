import { AnkiRequestOptions, request } from './request';

export const getModels = (options?: AnkiRequestOptions): Promise<string[]> =>
  request('modelNames', {}, options);
