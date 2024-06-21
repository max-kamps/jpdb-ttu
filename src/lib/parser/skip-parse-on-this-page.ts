import { registerListener } from '@lib/messaging/register-listener';

export const skipParseOnThisPage = () => {
  registerListener('isParsingDisabledOnThisPage', () => true);
};
