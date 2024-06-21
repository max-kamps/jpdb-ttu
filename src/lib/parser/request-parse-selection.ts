import { getCallable } from '@lib/messaging';

export const requestParseSelection = getCallable<[tabId: number], void>('requestParseSelection');
