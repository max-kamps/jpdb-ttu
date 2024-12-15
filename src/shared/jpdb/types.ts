type JPDBMeaning = {
  glosses: string[];
  partOfSpeech: string[];
};

type JPDBRuby = {
  text: string;
  start: number;
  end: number;
  length: number;
};

type JPDBFuriganaEntry = string | [spelling: string, reading: string];
type JPDBFurigana = JPDBFuriganaEntry[] | null;

export type JPDBParseResult = {
  tokens: JPDBRawToken[][];
  vocabulary: JPDBRawVocabulary[];
};

export type JPDBCardState = 'notInDeck' | 'blacklisted' | 'suspended' | 'redundant' | 'neverForget';
export type JPDBRawVocabulary = [
  vid: number,
  sid: number,
  rid: number,
  spelling: string,
  reading: string,
  frequency_rank: number,
  part_of_speech: string[],
  meanings_chunks: string[][],
  meanings_part_of_speech: string[][],
  card_state: JPDBCardState[],
  pitch_accent: string[] | null,
];
export type JPDBCard = {
  vid: number;
  sid: number;
  rid: number;
  spelling: string;
  reading: string;
  frequencyRank: number;
  partOfSpeech: string[];
  meanings: JPDBMeaning[];
  cardState: JPDBCardState[];
  pitchAccent: string[];
  wordWithReading: string | null;
};
export type JPDBRawToken = [
  vocabularyIndex: number,
  position: number,
  length: number,
  furigana: JPDBFurigana,
];

export type JPDBToken = {
  card: JPDBCard;
  start: number;
  end: number;
  length: number;
  rubies: JPDBRuby[];
};
