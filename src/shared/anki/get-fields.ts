import { AnkiRequestOptions, request } from './request';

export const getFields = async (
  modelName: string,
  options?: AnkiRequestOptions,
): Promise<string[]> => {
  return request('modelFieldNames', { modelName }, options);
};
