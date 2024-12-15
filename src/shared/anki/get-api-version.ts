import { AnkiRequestOptions } from './api.types';
import { request } from './request';

export const getApiVersion = (options?: AnkiRequestOptions): Promise<number> =>
  request('version', {}, options);
