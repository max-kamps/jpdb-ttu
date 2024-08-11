import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const getParseSelector = getTabCallable<[], string>('getParseSelector', true);
