import { registerListener } from '@lib/messaging/register-listener';

export const setParseSelector = (selector: string) => {
  registerListener('getParseSelector', () => selector);
};
