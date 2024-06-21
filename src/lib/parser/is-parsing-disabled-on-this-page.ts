import { getTabCallable } from '@lib/messaging';

export const isParsingDisabledOnThisPage = getTabCallable<[], boolean>(
  'isParsingDisabledOnThisPage',
  true,
);
