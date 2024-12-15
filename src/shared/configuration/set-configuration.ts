import { ConfigurationSchema } from '@shared/configuration';
import { writeStorage } from '@shared/extension';

export const setConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
  value: ConfigurationSchema[K],
): Promise<void> => {
  await writeStorage(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
};
