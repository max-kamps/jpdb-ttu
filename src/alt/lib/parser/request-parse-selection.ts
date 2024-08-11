import { getCallable } from '@lib/messaging/get-callable';

export const requestParseSelection = getCallable<[tabId: number], void>('requestParseSelection');
