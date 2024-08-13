import { broadcaster } from '@lib/broadcaster';
import { configuration } from '@lib/configuration';
import { view } from '@lib/view';
import { eventBus } from './lib/event-bus';
import { backgroundComms } from './lib/background-comms';

export class AJB {
  private _keyMap: Record<string, Keybind> = {};

  constructor() {
    broadcaster.on('configuration-updated', () => this.buildKeyMap());
    eventBus.on('parseKey', () => console.log('parseKey'));
    eventBus.on('lookupSelectionKey', () => console.log('lookupSelectionKey'));
    backgroundComms.on('parsePage', () => console.log('parse'));
    backgroundComms.on('parseSelection', () => console.log('parseSelection'));

    (async () => {
      await this.buildKeyMap();
      await this.installGlobalListeners();
    })();
  }

  private async buildKeyMap(): Promise<void> {
    const keyMap: Record<string, Keybind> = {
      jpdbReviewNothing: await configuration.getOrDefault('jpdbReviewNothing'),
      jpdbReviewSomething: await configuration.getOrDefault('jpdbReviewSomething'),
      jpdbReviewHard: await configuration.getOrDefault('jpdbReviewHard'),
      jpdbReviewGood: await configuration.getOrDefault('jpdbReviewGood'),
      jpdbReviewEasy: await configuration.getOrDefault('jpdbReviewEasy'),
      jpdbReviewFail: await configuration.getOrDefault('jpdbReviewFail'),
      jpdbReviewPass: await configuration.getOrDefault('jpdbReviewPass'),

      parseKey: await configuration.getOrDefault('parseKey'),
      showPopupKey: await configuration.getOrDefault('showPopupKey'),
      showAdvancedDialogKey: await configuration.getOrDefault('showAdvancedDialogKey'),
      lookupSelectionKey: await configuration.getOrDefault('lookupSelectionKey'),
      addToMiningKey: await configuration.getOrDefault('addToMiningKey'),
      addToBlacklistKey: await configuration.getOrDefault('addToBlacklistKey'),
      addToNeverForgetKey: await configuration.getOrDefault('addToNeverForgetKey'),
    };

    const configuredKeys = Object.keys(keyMap)
      .filter((key) => keyMap[key]?.code)
      .reduce<Record<string, Keybind>>((acc, key) => {
        acc[key] = keyMap[key];

        return acc;
      }, {});

    this._keyMap = {
      ...configuredKeys,
      'close-all-dialogs': { key: 'Escape', code: 'Escape', modifiers: [] },
    };
    console.log('this._keyMap', this._keyMap);
  }

  private async installGlobalListeners() {
    const checkKeybind = (keybind: Keybind, event: KeyboardEvent | MouseEvent): boolean => {
      const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;

      return (
        code === keybind.code && keybind.modifiers.every((name) => event.getModifierState(name))
      );
    };

    const hotkeyListener = (event: KeyboardEvent | MouseEvent) => {
      const pressed = Object.keys(this._keyMap).find((key) =>
        checkKeybind(this._keyMap[key], event),
      );

      console.log('pressed', pressed);
      if (pressed) {
        eventBus.emit(pressed as keyof LocalEvents, event);
      }
    };

    window.addEventListener('keydown', hotkeyListener);
    window.addEventListener('mousedown', hotkeyListener);
  }
}

new AJB();
