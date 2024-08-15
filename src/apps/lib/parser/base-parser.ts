import { IntegrationScript } from '../integration-script';

export abstract class BaseParser extends IntegrationScript {
  protected root: HTMLElement = document.body;

  constructor(protected _meta: HostMeta) {
    super();

    this.setup();
  }

  protected abstract setup(): void;
}
