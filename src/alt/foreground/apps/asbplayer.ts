import { AddedObserver } from '@foreground/lib/added-observer';
import { VisibleParser } from '@foreground/lib/parsers/visible-parser';
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

//#region Testcode for (probaply) something like text hooker.
const visibleParser = new VisibleParser();

new AddedObserver(
  '.asbplayer-offscreen div',
  (elements: Element[]) => {
    elements.forEach((e) => visibleParser.observe(e));
  },
  document.body,
  { childList: true, subtree: true },
).onFirstMatch(() => addStyles());
//#endregion

//#region Actual code for parsing subtitles
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
//#endregion
