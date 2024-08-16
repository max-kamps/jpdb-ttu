import { BaseParser } from './base.parser';

export class AutomaticParser extends BaseParser {
  protected _visibleObserver: IntersectionObserver | undefined;
  protected _addedObserver: MutationObserver | undefined;

  protected setup(): void {
    if (this._meta.parseVisibleObserver) {
      this.setupVisibleObserver();
    }

    if (this._meta.addedObserver) {
      this.setupAddedObserver();
    }

    if (this._meta.parse) {
      this.root = document.querySelector<HTMLElement>(this._meta.parse);

      this.parsePage();
    }
  }

  protected setupVisibleObserver(): void {
    let filter: (node: HTMLElement | Text) => boolean;

    if (typeof this._meta.parseVisibleObserver === 'object') {
      const { include, exclude } = this._meta.parseVisibleObserver;

      filter = (node) => {
        if (node instanceof Text) {
          return true;
        }

        if (include && !node.matches(include)) {
          return false;
        }

        if (exclude && node.matches(exclude)) {
          return false;
        }

        return true;
      };
    }

    this._visibleObserver = this.getParseVisibleObserver(filter);
  }

  protected setupAddedObserver(): void {
    this._addedObserver = this.getAddedObserver(
      this._meta.addedObserver!.observeFrom,
      this._meta.addedObserver!.notifyFor,
      this._meta.addedObserver!.config,
      (nodes) => this.addedObserverCallback(nodes),
    );
  }

  protected addedObserverCallback(nodes: HTMLElement[]): void {
    if (!this._visibleObserver) {
      // default parsing here!
      return;
    }

    nodes.forEach((node) => this._visibleObserver.observe(node));
  }
}
