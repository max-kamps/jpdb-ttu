import { broadcaster } from '@lib/broadcaster';
import { ParseInitiator } from './cls/parse-initiator';
import '@lib/broadcaster';

export class BackgroundWorker {
  private _initiator = new ParseInitiator(this);

  constructor() {
    broadcaster.on('configuration-updated', () => {
      console.log('BackgroundWorker configuration-updated');
    });
  }
}

new BackgroundWorker();
