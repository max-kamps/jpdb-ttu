import { registerListener } from '@lib/messaging/register-listener';
import { ParagraphResolver } from './paragraph-resolver';
import { ParagraphParser } from './paragraph-parser';

// normales parse:
// parsed document body und parsed alles was in den paragraphs ist

// integration parse
// parsed initial alles was in den paragraphs ist
// parsed dann alles was durch den addedObserver kommt

// ideal:
// der initiale schritt wird durch ein flag unterbunden,
// bis das content script entscheiden kann was tatsächlich geparsed werden muss

// zu prüfen:
// visibleObserver (e.g. anacreon)

// weiterer flow hier:
// nach dem finden der nodes werden diese nodes
// in batches unterteilt
// diese batches werden dann als text zusammen gefasst
// die gehen an jpdb
// jpdb gibt tokes zurück
// irgendwo gibt es eine promise referenz
// die dann resolved somehow
// das ruft dann wrap auf, was das ganze in html verpackt

export class Parser {
  public install() {
    registerListener('parse-page', (selector?: string) => this.parsePage(selector));
    registerListener('parse-selection', () => this.parseSelection());
  }

  private parseSelection() {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const paragraphs = new ParagraphResolver(range.commonAncestorContainer, (node) => {
      return range.intersectsNode(node);
    }).resolve();

    this.parseParagraphs(paragraphs);
  }

  private parsePage(selector?: string) {
    const rootNode = selector ? document.querySelector(selector) : document.body;
    const paragraphs = new ParagraphResolver(rootNode).resolve();

    this.parseParagraphs(paragraphs);
  }

  private parseParagraphs(paragraphs: Paragraph[]) {
    if (!paragraphs.length) {
      return;
    }

    new ParagraphParser(paragraphs).parse();
  }
}
