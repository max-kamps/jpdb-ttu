export class AddedObserver {
  protected _onFirstMatchCallback?: (nodes: Element[]) => void;
  protected _hasMatched = false;

  constructor(
    protected _selector: string,
    protected _callback: (elements: Element[]) => void,
    protected _observableTarget: Node,
    protected _observerOptions?: MutationObserverInit,
  ) {
    this.install();
  }

  public onFirstMatch(callback: (nodes: Node[]) => void): void {
    this._onFirstMatchCallback = callback;
  }

  protected matchFound(elements: Element[]): void {
    if (this._hasMatched) {
      return;
    }

    this._hasMatched = true;
    this._onFirstMatchCallback?.(elements);
  }

  protected install(): void {
    const existingElements = document.querySelectorAll(this._selector);

    if (existingElements.length > 0) {
      this.matchFound([...existingElements]);
      this._callback([...existingElements]);
    }

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') {
          continue;
        }

        const filteredNodes = [];

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.matches(this._selector)) {
              filteredNodes.push(node);
            }

            filteredNodes.push(...node.querySelectorAll(this._selector));
          }
        }

        if (filteredNodes.length) {
          this.matchFound(filteredNodes);
          this._callback(filteredNodes);
        }
      }
    });

    observer.observe(this._observableTarget, this._observerOptions);
  }
}
