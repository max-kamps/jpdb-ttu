import { getCallable } from '@lib/messaging/get-callable';

export const disableOnThisPage = getCallable<[], void>('disable-on-this-page');
