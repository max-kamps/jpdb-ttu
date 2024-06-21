import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const sendParsePageRequest = getTabCallable<[selector?: string], void>('parse-page');
export const sendParseSelectionRequest = getTabCallable<[], void>('parse-selection');

export const getParseSelector = getTabCallable<[], string>('get-parse-selector', true);
export const isParsingDisabled = getTabCallable<[], boolean>('is-parsing-disabled', true);
