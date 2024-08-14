import { Broadcaster } from '@lib/broadcaster';
import { EventBus } from '../lib/event-bus';
import { BackgroundComms } from './lib/background-comms';
import { KeybindManager } from './lib/keybind-manager';

export class AJB {
  private static _instance: AJB;

  public static get instance(): AJB {
    if (!this._instance) {
      this._instance = new AJB();
    }

    return this._instance;
  }

  public readonly events = new EventBus<LocalEvents>();
  public readonly backgroundComms = new BackgroundComms();
  public readonly broadcaster = new Broadcaster();
  public readonly keyBindManager = new KeybindManager(this.events, this.broadcaster);

  private constructor() {
    this.events.on('parseKey', (e: KeyboardEvent | MouseEvent) => console.log('parsePage', e));
    this.events.on('lookupSelectionKey', (e: KeyboardEvent | MouseEvent) =>
      console.log('lookupSelectionKey', e),
    );

    this.broadcaster.on('configuration-updated', () => console.log('configuration-updated'));

    this.backgroundComms.on('parsePage', () => console.log('parse'));
    this.backgroundComms.on('parseSelection', () => console.log('parseSelection'));
  }
}

export default AJB.instance;
