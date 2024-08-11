import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const parsePage = getTabCallable<[selector?: string], void>('parsePage');
