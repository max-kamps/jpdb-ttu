import { parseElements } from '../parser/parse-elements';
import { ParsedParagraphsHandler } from '../parser/parsed-paragraphs-handler';

/**
 * Default parser for parsing text from a page or selection.
 */
export class DefaultParser {
  public static readonly instance = new DefaultParser();

  public selector?: string;

  private constructor() {}

  /**
   * Parses the current selection.
   * @returns {void}
   */
  public parseSelection(): void {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);

    parseElements(range.commonAncestorContainer, (node) => {
      return range.intersectsNode(node);
    });
  }

  /**
   * Parses the current page.
   * @param {string} [selector] - The selector to use for parsing. If not provided, the entire page is parsed.
   * @returns {void}
   */
  public parsePage(): void {
    const rootNode = this.selector ? document.querySelector(this.selector) : document.body;

    parseElements(rootNode);
  }

  // TODO: Remove from this context!
  public onParagraphParsed(
    sequence: number,
    sourceIndex: number,
    text: string,
    tokens: TokenObject[],
  ) {
    ParsedParagraphsHandler.instance.parsedParagraph(sequence, sourceIndex, text, tokens);
  }
}
