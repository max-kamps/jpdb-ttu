import { onBroadcast } from '@lib/broadcaster/on-broadcast';
import { installParseInitiator } from './lib/install-parse-initiator';
import { installLookupController } from './lib/install-lookup-controller';

export class BackgroundWorker {
  constructor() {
    console.log('BackgroundWorker constructor');

    installParseInitiator();
    installLookupController();

    onBroadcast('configurationUpdated', () => {
      console.log('BackgroundWorker configuration-updated');
    });
  }
}

new BackgroundWorker();
