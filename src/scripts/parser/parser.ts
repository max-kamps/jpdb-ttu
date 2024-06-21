import { registerListener } from '@lib/messaging';
import { ParagraphResolver } from './paragraph-resolver';

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
    registerListener('parsePage', (selector?: string) => this.parsePage(selector));
    registerListener('parseSelection', () => this.parseSelection());
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

    // console.log(this.getParagraphs(document.body));

    // player-timedtext-text-container

    // console.log('test addedObserver for netflix');

    // const cb = (elements: Element[]) => {
    //   elements.forEach((element) => this.getParagraphs(element));
    // };

    // const cls = '.player-timedtext-text-container';

    // const existingElements = document.querySelectorAll(cls);
    // if (existingElements.length > 0) {
    //   cb([...existingElements]);
    // }

    // const newParagraphObserver = new MutationObserver((mutations, _observer) => {
    //   for (const mutation of mutations) {
    //     if (mutation.type !== 'childList') continue;
    //     const filteredNodes = [];
    //     for (const node of mutation.addedNodes) {
    //       // TODO support non-elements (like text nodes)
    //       if (node instanceof HTMLElement) {
    //         if (node.matches(cls)) {
    //           filteredNodes.push(node);
    //         }
    //         // TODO support non-html elements
    //         filteredNodes.push(...node.querySelectorAll(cls));
    //       }
    //     }
    //     if (filteredNodes.length) cb(filteredNodes);
    //   }
    // });

    // newParagraphObserver.observe(document.body, { childList: true, subtree: true });
  }

  private parseParagraphs(paragraphs: Paragraph[]) {
    const text = paragraphs
      .map((paragraph) => paragraph.map((fragment) => fragment.node.data).join(''))
      .join('');
    console.log(text);
  }
}
