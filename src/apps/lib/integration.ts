import { displayToast } from '@shared/dom/display-toast';
import { IntegrationScript } from './integration-script';

export abstract class Integration extends IntegrationScript {
  protected static _parseBehavior: string | HTMLElement | Document = document;

  protected setParseBehavior(behavior: string | HTMLElement | Document): void {
    Integration._parseBehavior = behavior;
  }

  protected parsePage(): void {
    this.parseElement(Integration._parseBehavior as string);
  }

  protected parseSelection(): void {}

  protected parseElement(element: string | HTMLElement | Document): void {
    if (typeof element === 'string') {
      element = document.querySelector<HTMLElement>(element);
    }

    if (!element) {
      displayToast('error', 'No element to parse!');

      return;
    }

    console.log('Parsing element:', element);
  }
}
