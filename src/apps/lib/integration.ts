import { displayToast } from '@shared/dom/display-toast';
import { IntegrationScript } from './integration-script';
import { AppCache } from './app-cache';

export abstract class Integration extends IntegrationScript {
  protected setParseBehavior(behavior: string | HTMLElement | Document): void {
    AppCache.instance.parseBehavior = behavior;
  }

  protected parsePage(): void {
    this.parseElement(AppCache.instance.parseBehavior as string);
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
  }
}
