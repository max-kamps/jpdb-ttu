import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';
import { GradingActions } from './grading-actions';
import { MiningActions } from './mining-actions';

export class PopupManager extends IntegrationScript {
  private static _instance: PopupManager;

  public static get instance() {
    if (!this._instance) {
      this._instance = new PopupManager();
    }

    return this._instance;
  }

  private _keyManager: KeybindManager;
  private _miningActions: MiningActions;
  private _gradingActions: GradingActions;

  private _currentContext?: HTMLElement;

  private constructor() {
    super();

    this._keyManager = new KeybindManager(['showPopupKey', 'showAdvancedDialogKey']);
    this._miningActions = new MiningActions();
    this._gradingActions = new GradingActions(this._miningActions);

    this.on('showPopupKey', () => this.showPopup());
    this.on('showAdvancedDialogKey', () => this.showAdvancedDialog());
  }

  public enter(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this._currentContext === target) {
      return;
    }

    if (!target?.ajbContext) {
      return;
    }

    this._currentContext = target;

    this._keyManager.activate();
    this._miningActions.activate(this._currentContext);
    this._gradingActions.activate(this._currentContext);
  }

  public leave(): void {
    this._currentContext = undefined;

    this._keyManager.deactivate();
    this._miningActions.deactivate();
    this._gradingActions.deactivate();

    // TODO: Hide Popup
    // TODO: Start timeout to hide popup
  }

  private showPopup(): void {
    console.log('showing popup');
  }

  private showAdvancedDialog(): void {
    console.log('showing advanced dialog');
  }
}
