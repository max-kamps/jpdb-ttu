import { onBroadcast } from '@shared/broadcaster/on-broadcast';
import { installJpdbCardActions } from './lib/install-jpdb-card-actions';
import { installLookupController } from './lib/install-lookup-controller';
import { installParseInitiator } from './lib/install-parse-initiator';
import { installParser } from './lib/install-parser';

export class BackgroundWorker {
  constructor() {
    console.log('BackgroundWorker constructor');

    installParseInitiator();
    installLookupController();
    installJpdbCardActions();
    installParser();

    onBroadcast('configurationUpdated', () => {
      console.log('BackgroundWorker configuration-updated');
    });

    onBroadcast('cardStateUpdated', () => {
      console.log('BackgroundWorker card-state-updated');
    });
  }
}

new BackgroundWorker();
