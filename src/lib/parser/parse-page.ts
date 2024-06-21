import { getTabCallable } from '@lib/messaging';

export const parsePage = getTabCallable<[selector?: string], void>('parsePage');
