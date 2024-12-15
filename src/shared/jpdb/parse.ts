import { FieldList, PositionLengthEncoding, TokenList } from './jpdb-api.types';
import { JPDBRequestOptions, request } from './request';

export const parse = async (
  paragraphs: string[],
  options?: JPDBRequestOptions,
): Promise<{ tokens: RawToken[][]; vocabulary: Vocabulary[] }> => {
  const result = await request<
    { tokens: RawToken[][]; vocabulary: Vocabulary[] },
    {
      position_length_encoding: PositionLengthEncoding;
      token_fields: TokenList;
      vocabulary_fields: FieldList;
      text: string[];
    }
  >(
    'parse',
    {
      text: paragraphs,
      position_length_encoding: 'utf16',
      token_fields: ['vocabulary_index', 'position', 'length', 'furigana'],
      vocabulary_fields: [
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
      ],
    },
    options,
  );

  return result;
};
