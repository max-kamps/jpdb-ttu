import { jpdbRequest } from './jpdb-request';
import { JPDBRequestOptions } from './jpdb.types';

export const pingJPDB = async (options?: JPDBRequestOptions): Promise<boolean> => {
  await jpdbRequest('ping', undefined, options);

  return true;
};
