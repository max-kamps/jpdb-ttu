import { getCallable } from '@lib/messaging';

const loadCfg = getCallable<[key: string, defaultValue?: string], string>('lsr');

export const getConfigurationValue = async <K extends keyof Configuration>(
  key: K,
  defaultValue?: Configuration[K],
): Promise<Configuration[K]> => {
  const value: string = await loadCfg(key, defaultValue?.toString());

  if (typeof defaultValue === 'number') {
    return parseInt(value, 10) as Configuration[K];
  }

  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as Configuration[K];
  }

  return value as Configuration[K];
};
