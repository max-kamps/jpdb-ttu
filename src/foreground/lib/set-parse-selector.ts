import { registerListener } from '@lib/messaging';

export const setParseSelector = (selector: string) => {
  registerListener('getParseSelector', () => selector);
};
