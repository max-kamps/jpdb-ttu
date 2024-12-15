import { AutomaticParser } from '../automatic.parser';

export class BunproParser extends AutomaticParser {
  protected addedObserverCallback(nodes: HTMLElement[]): void {
    nodes.forEach((node) => {
      const childDiv = node.querySelector('div.text-center')!;

      if (childDiv?.children.length) {
        this._visibleObserver?.observe(childDiv);
      }
    });
  }
}
