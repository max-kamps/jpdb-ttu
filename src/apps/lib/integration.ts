import { HostMeta } from '@shared/host-meta';
import { IntegrationScript } from './integration-script';
import { BaseParser } from './parser/base.parser';

export abstract class Integration extends IntegrationScript {
  protected parsers: BaseParser[] = [];

  protected installParser(meta: HostMeta, parser: new (meta: HostMeta) => BaseParser): void {
    this.parsers.push(new parser(meta));
  }
}
