import { AddedObserver } from '@foreground/lib/added-observer';
import { parseElements } from '@foreground/lib/parser/parse-elements';

new AddedObserver(
  '.player-timedtext div',
  (elements: Element[]) => {
    parseElements(elements);
  },
  document.body,
  { childList: true, subtree: true },
);
