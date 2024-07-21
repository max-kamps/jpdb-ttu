import { AddedObserver } from '@foreground/lib/added-observer';
import { VisibleParser } from '@foreground/lib/parser/visible-parser';
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

const visibleParser = new VisibleParser();

new AddedObserver(
  '.asbplayer-offscreen div',
  (elements: Element[]) => {
    // console.log(elements);
    elements.forEach((e) => visibleParser.observe(e));
    // const paragraphs = elements.flatMap((element) => new ParagraphResolver(element).resolve());

    // if (!paragraphs.length) {
    //   return;
    // }

    // new ParagraphParser(paragraphs).parse();
  },
  document.body,
  { childList: true, subtree: true },
).onFirstMatch(() => addStyles());

// new ObservableParser(
//   '.asbplayer-offscreen',
//   (elements: Node[]) => {
//     const paragraphs = elements.flatMap((element) => new ParagraphResolver(element).resolve());

//     if (!paragraphs.length) {
//       return;
//     }

//     new ParagraphParser(paragraphs).parse();
//   },
//   document.body,
//   { childList: true, subtree: true },
// ).onFirstMatch(() => addStyles());
