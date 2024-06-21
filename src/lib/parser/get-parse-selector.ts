import { getTabCallable } from '@lib/messaging';

export const getParseSelector = getTabCallable<[], string>('getParseSelector', true);
