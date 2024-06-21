import { registerListener } from '@lib/messaging/register-listener';

export const setParseSelector = (selector: string) => {
  registerListener('get-parse-selector', () => selector);
};
