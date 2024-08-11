import { getSequenceCallable } from '@lib/messaging/get-sequence-callable';

export const parseParagraphs = getSequenceCallable<[paragraphs: IdentifyableText[]], void>(
  'parse-paragraphs',
);
