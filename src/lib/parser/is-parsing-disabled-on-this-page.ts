import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const isParsingDisabledOnThisPage = getTabCallable<[], boolean>(
  'isParsingDisabledOnThisPage',
  true,
);
