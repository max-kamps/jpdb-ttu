import { JPDBCard, JPDBRawToken, JPDBRawVocabulary, JPDBToken, parse } from '@shared/jpdb';
import { Batch } from './parser.types';

export class Parser {
  constructor(private batch: Batch) {}

  public async parse(): Promise<void> {
    const paragraphs = this.batch.strings;
    const { tokens, vocabulary } = await parse(paragraphs);

    const cards = this.vocabToCard(vocabulary);
    const parsedTokens = this.parseTokens(tokens, cards);

    for (const [i, handle] of this.batch.handles.entries()) {
      handle.resolve(parsedTokens[i]);
    }
  }

  private vocabToCard(vocabulary: JPDBRawVocabulary[]): JPDBCard[] {
    return vocabulary.map((vocab) => {
      const [
        vid,
        sid,
        rid,
        spelling,
        reading,
        frequencyRank,
        partOfSpeech,
        meaningsChunks,
        meaningsPartOfSpeech,
        cardState,
        pitchAccent,
      ] = vocab;

      return {
        vid,
        sid,
        rid,
        spelling,
        reading,
        frequencyRank,
        partOfSpeech,
        meanings: meaningsChunks.map((glosses, i) => ({
          glosses,
          partOfSpeech: meaningsPartOfSpeech[i],
        })),
        cardState: cardState?.length ? cardState : ['notInDeck'],
        pitchAccent: pitchAccent ?? [],
        wordWithReading: null,
      };
    });
  }

  private parseTokens(tokens: JPDBRawToken[][], cards: JPDBCard[]): JPDBToken[][] {
    return tokens.map((innerTokens) =>
      innerTokens.map((token) => {
        const [vocabularyIndex, position, length, furigana] = token;
        const card = cards[vocabularyIndex];

        let offset = position;

        const rubies =
          furigana === null
            ? []
            : furigana.flatMap((part) => {
                if (typeof part === 'string') {
                  offset += part.length;

                  return [];
                }

                const [base, ruby] = part;
                const start = offset;
                const length = base.length;
                const end = (offset = start + length);

                return { text: ruby, start, end, length };
              });

        const result = {
          card,
          start: position,
          end: position + length,
          length: length,
          rubies,
        };

        this.assignWordWithReading(result);

        return result;
      }),
    );
  }

  private assignWordWithReading(token: JPDBToken): void {
    const { card, rubies: ruby, start: offset } = token;
    const { spelling: kanji } = card;

    if (!ruby.length) {
      return;
    }

    const word = kanji.split('');

    for (let i = ruby.length - 1; i >= 0; i--) {
      const { text, start, length } = ruby[i];

      word.splice(start - offset + length, 0, `[${text}]`);
    }

    card.wordWithReading = word.join('');
  }
}
