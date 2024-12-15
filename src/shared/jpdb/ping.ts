import { JPDBRequestOptions } from './api.types';
import { request } from './request';

export const ping = async (options?: JPDBRequestOptions): Promise<boolean> => {
  await request('ping', undefined, options);

  return true;
};
