import { registerListener } from '@lib/messaging/register-listener';

export const disableAutoParsing = () => {
  registerListener('is-parsing-disabled', () => true);
};
