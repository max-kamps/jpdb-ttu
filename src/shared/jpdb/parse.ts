import { JPDBRequestOptions } from './api.types';
import { request } from './request';
import { JPDBParseResult } from './types';

export const parse = async (
  paragraphs: string[],
  options?: JPDBRequestOptions,
): Promise<JPDBParseResult> => {
  const result = await request(
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
