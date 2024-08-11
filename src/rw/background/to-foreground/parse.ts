import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const sendParsePageRequest = getTabCallable<[], void>('parse-page');
export const sendParseSelectionRequest = getTabCallable<[], void>('parse-selection');

export const paragraphParsed = getTabCallable<
  [sequence: number, sourceIndex: number, text: string, tokens: TokenObject[]],
  void
>('paragraph-parsed');
