import { AnkiRequestOptions, request } from './request';

export const getApiVersion = (options?: AnkiRequestOptions): Promise<number> =>
  request('version', {}, options);
