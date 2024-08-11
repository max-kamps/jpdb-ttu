import { getSequenceCallable } from '@lib/messaging/get-sequence-callable';

export const abortRequest = getSequenceCallable<[], void>('abort-request');
