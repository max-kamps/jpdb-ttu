import { ParagraphParser } from './paragraph-parser';
import { ParagraphResolver } from './paragraph-resolver';

export class VisibleParser {
  protected _observer: IntersectionObserver;
  protected _parsers = new Map<Element, ParagraphParser>();

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
      const paragraphs = new ParagraphResolver(element).resolve();

      if (!paragraphs.length) {
        this._observer.unobserve(element);

        return;
      }

      const cb = () => {
        this._parsers.delete(element);
        this._observer.unobserve(element);
      };
      const parser = new ParagraphParser(paragraphs, cb, cb);

      this._parsers.set(element, parser);

      const text = await parser.parse();

      if (text) {
        console.log(text);
      }
    });
    const paragraphs = elements.flatMap((element) => new ParagraphResolver(element).resolve());

    if (!paragraphs.length) {
      return;
    }
  }

  protected _onExit(elements: Element[]): void {
    elements.forEach((element) => {
      this._parsers.get(element)?.cancel();
    });
  }
}
