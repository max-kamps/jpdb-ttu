import { getCallable } from '@lib/messaging/get-callable';

export const requestParsePage = getCallable<[tabId: number], void>('requestParsePage');
