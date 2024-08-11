import { createElement } from '@lib/renderer/create-element';

export class ParsedParagraphsHandler {
  public static readonly instance = new ParsedParagraphsHandler();

  private _sequences = new Map<number, IdentifyableParagraph[]>();
  private _sequenceLengths = new Map<number, number>();
  private constructor() {}

  public parsedParagraph(
    sequence: number,
    sourceIndex: number,
    text: string,
    tokens: TokenObject[],
  ) {
    this.injectHtml(sequence, sourceIndex, text, tokens);
  }

  public addSequence(sequence: number, paragraphs: IdentifyableParagraph[]) {
    this._sequences.set(sequence, paragraphs);
    this._sequenceLengths.set(sequence, paragraphs.length);
  }

  public removeSequence(sequence: number) {
    this._sequences.delete(sequence);
    this._sequenceLengths.delete(sequence);
  }

  private injectHtml(sequence: number, sourceIndex: number, text: string, tokens: TokenObject[]) {
    const paragraphs = this._sequences.get(sequence);

    this._sequenceLengths.set(sequence, this._sequenceLengths.get(sequence) - 1);

    if (this._sequenceLengths.get(sequence) === 0) {
      this._sequences.delete(sequence);
      this._sequenceLengths.delete(sequence);
    }

    const { paragraph: sourceParagraphs } = paragraphs[sourceIndex];

    // The current token to process
    let currentToken: TokenObject = tokens.pop();

    while (sourceParagraphs.length) {
      const sourceParagraph = sourceParagraphs.pop();
      let { node, hasRuby } = sourceParagraph;

      if (!sourceParagraph) {
        continue;
      }

      while (currentToken?.length) {
        const startPosition = currentToken.position;
        const endPosition = currentToken.position + currentToken.length;

        // If we are out of bounds, we skip to the next paragraph
        if (startPosition < sourceParagraph.start) {
          break;
        }

        if (currentToken.length > node.data.length) {
          // This is mostly caused by a misparse where jpdb connects words that are not connected in the source text
          // It may also happen if the source text is not correctly split into paragraphs
          // We could probaply fix this by splitting the elements accordingly, but this would either break the original text or require a lot of additional logic
          currentToken = tokens.pop();

          continue;
        }

        if (hasRuby && this.hasRubyParent(node)) {
          node.parentElement.classList.add('jpdb-word', 'new');
        } else {
          const newStart = startPosition - sourceParagraph.start;
          const newEnd = endPosition - sourceParagraph.start;
          const spanContents = node.data.slice(newStart, newEnd);

          const newStartNode = document.createTextNode(node.data.slice(0, newStart));
          const insertedNode = this.getProperElement(spanContents, currentToken);
          const newEndNode = document.createTextNode(node.data.slice(newEnd));

          node.replaceWith(newStartNode, insertedNode, newEndNode);

          node = newStartNode;
        }

        // next token
        currentToken = tokens.pop();
      }
    }
  }

  private hasRubyParent(node: Node): boolean {
    if (node.parentElement.tagName === 'RUBY') {
      return true;
    }

    if (node.parentElement === document.body) {
      return false;
    }

    return this.hasRubyParent(node.parentElement);
  }

  private getProperElement(text: string, token: TokenObject): HTMLElement {
    const cls = ['jpdb-word', 'new'];

    if (!token.furigana) {
      return createElement('span', { class: cls, innerText: text });
    }

    // If a word contains kana inbetween kanji, we need to split the word into multiple ruby parts
    let hadKana = false;
    let multiple = false;

    token.furigana.forEach((current) => {
      if (current.kanji && hadKana) {
        multiple = true;

        return;
      }

      if (!current.kanji) {
        hadKana = true;
      }
    });

    if (multiple) {
      return createElement('span', {
        class: cls,
        innerHTML: token.furigana
          .map((item) => {
            if (item.kanji) {
              return `<ruby>${item.kanji}<rt>${item.kana}</rt></ruby>`;
            }

            return item.kana;
          })
          .join(''),
      });
    }

    return createElement('ruby', {
      class: cls,
      innerHTML: token.furigana
        .map((item) => {
          return item.kanji ? `${item.kanji}<rt>${item.kana}</rt>` : item.kana;
        })
        .join(''),
    });
  }
}
