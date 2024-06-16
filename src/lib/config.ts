export const getConfigurationValue = async <TKey extends keyof Configuration>(
  key: TKey,
): Promise<Configuration[TKey] | null> => {
  return null as Configuration[TKey];
};
