declare type JPDBCardState =
  | 'notInDeck'
  | 'blacklisted'
  | 'suspended'
  | 'redundant'
  | 'neverForget';

declare type Vocabulary = [
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

declare type Meaning = {
  glosses: string[];
  partOfSpeech: string[];
};

declare type Card = {
  vid: number;
  sid: number;
  rid: number;
  spelling: string;
  reading: string;
  frequencyRank: number;
  partOfSpeech: string[];
  meanings: Meaning[];
  cardState: JPDBCardState[];
  pitchAccent: string[];
  wordWithReading: string | null;
};

declare type Furi = string | [spelling: string, reading: string];
declare type Furigana = Furi[] | null;
declare type RawToken = [
  vocabularyIndex: number,
  position: number,
  length: number,
  furigana: Furigana,
];

declare type Ruby = {
  text: string;
  start: number;
  end: number;
  length: number;
};
declare type Token = {
  card: Card;
  start: number;
  end: number;
  length: number;
  rubies: Ruby[];
};
