import { getHostMeta } from './get-host-meta';

export const isDisabled = async (host: string): Promise<boolean> => {
  const meta = await getHostMeta(host);

  console.log('checking if disabled', host, meta);
  return meta?.disabled || false;
};
