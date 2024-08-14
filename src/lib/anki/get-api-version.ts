import { AnkiRequestOptions, request } from './request';

export const getApiVersion = async (options?: AnkiRequestOptions): Promise<number> => {
  return request('version', {}, options);
};
