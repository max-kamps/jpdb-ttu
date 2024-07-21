import { jpdbRequest } from './jpdb-request';
import { JPDBRequestOptions } from './jpdb.types';

const TOKEN_FIELDS = ['vocabulary_index', 'position', 'length', 'furigana'];
const VOCAB_FIELDS = [
  'vid',
  'sid',
  'rid',
  'spelling',
  'reading',
  'frequency_rank',
  'part_of_speech',
  'meanings_chunks',
  'meanings_part_of_speech',
  'card_state',
  'pitch_accent',
];

type Token = [vocabIndex: number, position: number, length: number, furi: unknown[] | null];
type ParagraphsTokens = Token[];

type Vocab = unknown[];

export const parseJPDBText = async (
  paragraphs: string[],
  options?: JPDBRequestOptions,
): Promise<{ vocabulary: Vocab[]; tokens: ParagraphsTokens[] }> => {
  return await jpdbRequest(
    'parse',
    {
      text: paragraphs,
      position_length_encoding: 'utf16',
      token_fields: TOKEN_FIELDS,
      vocabulary_fields: VOCAB_FIELDS,
    },
    options,
  );
};
