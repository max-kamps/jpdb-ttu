import { ObservableParser } from '@foreground/lib/parser/observable-parser';
import { ParagraphParser } from '@foreground/lib/parser/paragraph-parser';
import { ParagraphResolver } from '@foreground/lib/parser/paragraph-resolver';
import { appendElement } from '@lib/renderer/append-element';

const addStyles = () => {
  // ensure jpdb-popup is displayed on top of subtitles
  appendElement<HTMLHeadElement, 'style'>(document.head, {
    tag: 'style',
    innerHTML: `
.asbplayer-subtitles-container-bottom {
  z-index: 2147483646
}
`,
  });
};

new ObservableParser(
  '.asbplayer-offscreen',
  (elements: Node[]) => {
    const paragraphs = elements.flatMap((element) => new ParagraphResolver(element).resolve());

    if (!paragraphs.length) {
      return;
    }

    new ParagraphParser(paragraphs).parse();
  },
  document.body,
  { childList: true, subtree: true },
).onFirstMatch(() => addStyles());
