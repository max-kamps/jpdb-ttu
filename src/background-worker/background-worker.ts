import { onBroadcast } from '@shared/broadcaster/on-broadcast';
import { installParseInitiator } from './lib/install-parse-initiator';
import { installLookupController } from './lib/install-lookup-controller';
import { installParser } from './lib/install-parser';

export class BackgroundWorker {
  constructor() {
    console.log('BackgroundWorker constructor');

    installParseInitiator();
    installLookupController();
    installParser();

    onBroadcast('configurationUpdated', () => {
      console.log('BackgroundWorker configuration-updated');
    });
  }
}

new BackgroundWorker();
