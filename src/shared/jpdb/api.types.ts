import { Empty } from '@shared/types';
import { JPDBCardState, JPDBParseResult } from './types';

type JPDBFieldNames =
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
type JPDBTokenNames = 'vocabulary_index' | 'position' | 'length' | 'furigana';
type JPDBVidSidTuple = [vid: number, sid: number][];
type JPDBFieldList = JPDBFieldNames[];
type JPDBTokenList = JPDBTokenNames[];

type JPDBPositionLengthEncoding = 'utf16';

type JPDBParseRequest = {
  text: string[];
  position_length_encoding: JPDBPositionLengthEncoding;
  token_fields: JPDBTokenList;
  vocabulary_fields: JPDBFieldList;
};

type JPDBLookupVocabularyRequest = {
  list: JPDBVidSidTuple;
  fields: JPDBFieldList;
};
type JPDBLookupVocabularyResult = {
  vocabulary_info: [[JPDBCardState]];
};

export type JPDBRequestOptions = {
  apiToken?: string;
};

export type JPDBErrorResponse = {
  error_message: string;
};
export type JPDBEndpoints = {
  ping: [Empty, void];
  parse: [JPDBParseRequest, JPDBParseResult];
  'lookup-vocabulary': [JPDBLookupVocabularyRequest, JPDBLookupVocabularyResult];
};
