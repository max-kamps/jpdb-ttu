import { registerListener } from '@lib/messaging/register-listener';
import { parseElements } from './parse-elements';
import { ParsedParagraphsHandler } from './parsed-paragraphs-handler';

export class DOMParser {
  public install() {
    registerListener('parse-page', (selector?: string) => this.parsePage(selector));
    registerListener('parse-selection', () => this.parseSelection());
    registerListener('paragraph-parsed', this.paragraphParsed.bind(this));
  }

  private parseSelection() {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);

    parseElements(range.commonAncestorContainer, (node) => {
      return range.intersectsNode(node);
    });
  }

  private parsePage(selector?: string) {
    const rootNode = selector ? document.querySelector(selector) : document.body;

    parseElements(rootNode);
  }

  private paragraphParsed(
    sequence: number,
    sourceIndex: number,
    text: string,
    tokens: TokenObject[],
  ) {
    ParsedParagraphsHandler.instance.parsedParagraph(sequence, sourceIndex, text, tokens);
  }
}
