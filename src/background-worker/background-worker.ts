import { browser } from '@lib/browser';
import { ParseInitiator } from './cls/parse-initiator';

export class BackgroundWorker {
  private _initiator = new ParseInitiator(this);
}

new BackgroundWorker();
