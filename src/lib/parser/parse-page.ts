import { getTabCallable } from '@lib/messaging';

export const parsePage = getTabCallable<[], void>('parsePage');
