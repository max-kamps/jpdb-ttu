import { ParagraphParseInitializer } from '../parser/paragraph-parse-initializer';
import { parseElements } from '../parser/parse-elements';

/**
 * Parser that parses elements when they become visible in the viewport.
 * Cancels parsing when elements are no longer visible.
 */
export class VisibleParser {
  protected _observer: IntersectionObserver;
  protected _parsers = new Map<Element, ParagraphParseInitializer>();

  constructor() {
    this._observer = new IntersectionObserver(
      (entries, _observer) => {
        const exited = entries
          .filter((entry) => !entry.isIntersecting)
          .map((entry) => entry.target);

        const entered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target);

        exited.length && this._onExit(exited);
        entered.length && this._onEnter(entered);
      },
      {
        rootMargin: '50% 50% 50% 50%',
      },
    );
  }

  public observe(element: Element): void {
    this._observer.observe(element);
  }

  protected _onEnter(elements: Element[]): void {
    elements.forEach(async (element) => {
      const cb = () => {
        this._parsers.delete(element);
        this._observer.unobserve(element);
      };
      const parser = parseElements(elements, cb, cb);

      if (!parser) {
        this._observer.unobserve(element);

        return;
      }

      this._parsers.set(element, parser);
    });
  }

  protected _onExit(elements: Element[]): void {
    elements.forEach((element) => {
      this._parsers.get(element)?.cancel();
    });
  }
}
