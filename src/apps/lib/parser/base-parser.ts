import { IntegrationScript } from '../integration-script';

export abstract class BaseParser extends IntegrationScript {
  protected root: HTMLElement = document.body;
  protected pendingBatches = new Map<Element, { abort: () => void }>();

  constructor(protected _meta: HostMeta) {
    super();

    console.log('Base parser constructor...', _meta);
    this.setup();
  }

  protected abstract setup(): void;

  protected parseSelection(): void {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);

    this.parseNode(range.commonAncestorContainer, (node) => range.intersectsNode(node));
  }

  protected parsePage(): void {
    this.parseNode(this.root);
  }

  protected parseNode(node: Node | Element, filter?: (node: Node | Element) => boolean): void {
    this.parseNodes([node], filter);
  }

  protected parseNodes(
    nodes: (Node | Element)[],
    filter?: (node: Node | Element) => boolean,
  ): void {
    // console.log('Parsing nodes...', nodes, filter);

    nodes.forEach((node) => {
      this.pendingBatches.set(node as Element, {
        abort: () => {
          // console.log('Aborting...');
        },
      });
    });
  }

  protected getAddedObserver(
    observeFrom: string | string[],
    notifyFor: string,
    config: MutationObserverInit,
    callback: (nodes: HTMLElement[]) => void,
  ): MutationObserver {
    const observeTargets = Array.isArray(observeFrom) ? observeFrom : [observeFrom];
    let root: HTMLElement;

    // console.log('Getting added observer...', observeTargets, notifyFor, config);
    while (observeTargets.length && !root) {
      // console.log('Getting root...', observeTargets[0]);
      root = document.querySelector(observeTargets.shift());
      // console.log('Root...', root);
    }

    const initialNodes = Array.from(root.querySelectorAll(notifyFor)) as HTMLElement[];

    if (initialNodes.length) {
      callback(initialNodes);
    }

    const observer = new MutationObserver((mutations) => {
      const nodes = mutations
        .filter((mutation) => mutation.type === 'childList')
        .map((mutation) => Array.from(mutation.addedNodes))
        .flat()
        .filter((node) => {
          if (node instanceof HTMLElement) {
            return node.matches(notifyFor as string);
          }

          return false;
        }) as HTMLElement[];

      if (nodes.length) {
        callback(nodes);
      }
    });

    observer.observe(root, config);

    return observer;
  }

  protected getVisibleObserver(
    onEnter: (elements: Element[]) => void,
    onExit: (elements: Element[]) => void,
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        const withItems = (intersecting: boolean, cb: (elements: Element[]) => void) => {
          const elements = entries
            .filter((entry) => entry.isIntersecting === intersecting)
            .map((entry) => entry.target as Element);

          if (elements.length) {
            cb(elements);
          }
        };

        withItems(false, onExit);
        withItems(true, onEnter);
      },
      {
        rootMargin: '50% 50% 50% 50%',
      },
    );
  }

  protected getParseVisibleObserver(
    filter: (node: HTMLElement | Text) => boolean = () => true,
  ): IntersectionObserver {
    // console.log('Getting visible parser...');
    return this.getVisibleObserver(
      (elements) => {
        // console.log('Entering...', elements);
        this.parseNodes(elements, filter);
      },
      (elements) => {
        // console.log('Exiting...', elements);
        elements.forEach((element) => {
          const batch = this.pendingBatches.get(element);

          if (batch) {
            batch.abort();
          }
        });
      },
    );
  }
}
