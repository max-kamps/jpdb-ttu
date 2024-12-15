export type VidSidTuple = [vid: number, sid: number][];
export type FieldList = FieldNames[];
export type TokenList = TokenNames[];
export type FieldNames =
  | 'vid'
  | 'sid'
  | 'rid'
  | 'spelling'
  | 'reading'
  | 'frequency_rank'
  | 'part_of_speech'
  | 'meanings_chunks'
  | 'meanings_part_of_speech'
  | 'card_state'
  | 'pitch_accent';
export type TokenNames = 'vocabulary_index' | 'position' | 'length' | 'furigana';

export type PositionLengthEncoding = 'utf16';
