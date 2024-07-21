import { paragraphParsed } from '@background/to-foreground/parse';
import { parseJPDBText } from '@lib/jpdb/parse-jpdb-text';

export class ParagraphParser {
  private _batchSize = 50;
  // private _batchSize = 100;
  private _batches: IdentifyableTextBatch[] = [];

  constructor(
    private _abortedState: AbortedState,
    private _sourceTab: number,
    private _sequence: number,
    private _paragraphs: IdentifyableText[],
  ) {}

  async parse() {
    this.createBatches();

    while (!this._abortedState.aborted && this._batches.length) {
      await this.parseBatch(this._batches.shift());
    }
  }

  private createBatches() {
    let currentBatch: IdentifyableTextBatch = [];
    let currentBatchTextSize = 0;

    this._paragraphs.forEach((item: IdentifyableText, sourceIndex: number) => {
      const itemTextLength = item.text.length;
      const resultBatchTextLength = currentBatchTextSize + itemTextLength;

      if (resultBatchTextLength > this._batchSize) {
        this._batches.push(currentBatch);

        currentBatch = [];
        currentBatchTextSize = 0;
      }

      currentBatch.push({ sourceIndex, text: item });

      currentBatchTextSize += itemTextLength;
    });

    if (currentBatch.length) {
      this._batches.push(currentBatch);
    }
  }

  private async parseBatch(batch: IdentifyableTextBatch) {
    const textBatch = batch.map(({ text }) => text.text);
    const { vocabulary, tokens } = await parseJPDBText(textBatch);
    let i: number = 0;

    // The returned vocabulary array contains all words from the current batch
    // The returned token arrays can be mapped to the original request by index

    while (!this._abortedState.aborted && textBatch.length) {
      const text = textBatch.shift();
      const relevantTokens = tokens[i];
      const translatedTokens = relevantTokens.map((token: Token) => this.tokenToObject(token));

      await paragraphParsed(
        this._sourceTab,
        this._sequence,
        batch[i].sourceIndex,
        text,
        translatedTokens,
      );

      i++;
    }

    // TODO: Handle vocabulary

    // registerListener('parse-paragraphsss', async (sequence: number, paragraphs: string[]) => {
    //   const result: { paragraph: string; vocab: unknown[]; tokens: unknown[] }[] = Array(
    //     paragraphs.length,
    //   );
    //   const batches: [originalIndex: number, text: string][][] = [];
    //   let currentBatch: [originalIndex: number, text: string][] = [];
    //   let currentBatchLength = 0;
    //   paragraphs.forEach((paragraph, i) => {
    //     console.log('Parsing paragraph', paragraph);
    //     const textLength = paragraph.length;

    //     if (currentBatchLength + textLength > 1000) {
    //       batches.push(currentBatch);
    //       currentBatch = [];
    //       currentBatchLength = 0;
    //     }

    //     currentBatch.push([i, paragraph]);
    //     currentBatchLength += textLength;
    //   });

    //   if (currentBatch.length) {
    //     batches.push(currentBatch);
    //   }

    //   while (batches.length) {
    //     const batch = batches.shift();
    //     const textBatch = batch.map(([, text]) => text);

    //     const jpdbResponse = await parseJPDBText(textBatch);

    //     console.log('Parsed batch', jpdbResponse);

    //     batch.forEach(([paragraphIndex, text], i) => {
    //       const tokens = jpdbResponse.tokens[i];
    //       const vocab = tokens.map((token) => jpdbResponse.vocabulary[token[0]]);

    //       result[paragraphIndex] = {
    //         paragraph: text,
    //         vocab,
    //         tokens,
    //       };
    //     });
    //   }

    //   return result;
    // });
  }

  private tokenToObject(token: Token): TokenObject {
    return {
      vocabIndex: token[0],
      position: token[1],
      length: token[2],
      furigana: token[3] ? this.parseFurigana(token[3]) : null,
    };
  }

  private parseFurigana(furigana: RawFurigana): Furigana {
    return furigana.map((item) => {
      if (typeof item === 'string') {
        return { kana: item };
      }

      return { kanji: item[0], kana: item[1] };
    });
  }
}
