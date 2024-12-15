import { installJpdbCardActions } from './lib/install-jpdb-card-actions';
import { installLookupController } from './lib/install-lookup-controller';
import { installParseInitiator } from './lib/install-parse-initiator';
import { installParser } from './lib/parser/install-parser';

export class BackgroundWorker {
  constructor() {
    installParseInitiator();
    installParser();

    void installLookupController();
    void installJpdbCardActions();
  }
}

new BackgroundWorker();
