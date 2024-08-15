import { AnkiRequestOptions, request } from './request';

export const getModels = async (options?: AnkiRequestOptions): Promise<string[]> => {
  return request('modelNames', {}, options);
};
