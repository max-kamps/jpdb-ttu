import { ParseInitiator } from './lib/parse-initiator';
import { onBroadcast } from '@lib/broadcaster/on-broadcast';

export class BackgroundWorker {
  private static _instance: BackgroundWorker;

  public static get instance(): BackgroundWorker {
    if (!BackgroundWorker._instance) {
      BackgroundWorker._instance = new BackgroundWorker();
    }

    return BackgroundWorker._instance;
  }

  private _initiator = new ParseInitiator(this);

  private constructor() {
    console.log('BackgroundWorker constructor');

    onBroadcast('configuration-updated', () => {
      console.log('BackgroundWorker configuration-updated');
    });
  }
}

BackgroundWorker.instance;
