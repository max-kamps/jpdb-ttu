import { registerListener } from '@lib/messaging';

export const skipParseOnThisPage = () => {
  registerListener('isParsingDisabledOnThisPage', () => true);
};
