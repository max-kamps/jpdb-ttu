import { Broadcaster } from '@lib/broadcaster';
import { ParseInitiator } from './cls/parse-initiator';
import { TabComms } from './cls/tab-comms';

export class BackgroundWorker {
  private static _instance: BackgroundWorker;

  public static get instance(): BackgroundWorker {
    if (!BackgroundWorker._instance) {
      BackgroundWorker._instance = new BackgroundWorker();
    }

    return BackgroundWorker._instance;
  }

  private broadcaster = Broadcaster.getInstance();
  private tabComms = TabComms.getInstance();
  private _initiator = new ParseInitiator(this);

  private constructor() {
    console.log('BackgroundWorker constructor');

    this.broadcaster.on('configuration-updated', () => {
      console.log('BackgroundWorker configuration-updated');
    });
  }
}

BackgroundWorker.instance;
