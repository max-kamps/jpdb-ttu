import { getCallable } from '@lib/messaging';

export const requestParsePage = getCallable<[tabId: number], void>('requestParsePage');
