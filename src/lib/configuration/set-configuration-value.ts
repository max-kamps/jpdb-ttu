import { getCallable } from '@lib/messaging/get-callable';

const loadCfg = getCallable<[key: string, value: string], string>('lsw');

export const setConfigurationValue = async <K extends keyof Configuration>(
  key: K,
  value: Configuration[K],
): Promise<void> => {
  await loadCfg(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};
