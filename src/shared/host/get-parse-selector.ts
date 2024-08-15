import { getHostMeta } from './get-host-meta';

export const getParseSelector = async (host: string): Promise<string | undefined> => {
  const meta = await getHostMeta(host);

  return meta?.parse;
};
