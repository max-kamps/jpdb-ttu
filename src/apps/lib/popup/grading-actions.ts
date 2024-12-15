import { getConfiguration, ConfigurationSchema, Keybind } from '@shared/configuration';
import { onBroadcastMessage } from '@shared/messages';
import { FilterKeys } from '@shared/types';
import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';
import { MiningActions } from './mining-actions';

export class GradingActions extends IntegrationScript {
  private _keyManager: KeybindManager;
  private _currentContext?: HTMLElement;

  constructor(private _miningActions: MiningActions) {
    super();

    this._keyManager = new KeybindManager([]);

    this.installEvents();

    onBroadcastMessage('configurationUpdated', () => this.updateGradingKeys());
    void this.updateGradingKeys();
  }

  public activate(context: HTMLElement): void {
    this._currentContext = context;
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._currentContext = undefined;
    this._keyManager.deactivate();
  }

  private installEvents(): void {
    this.on('jpdbReviewNothing', () => this.reviewCard('nothing'));
    this.on('jpdbReviewSomething', () => this.reviewCard('something'));
    this.on('jpdbReviewHard', () => this.reviewCard('hard'));
    this.on('jpdbReviewGood', () => this.reviewCard('good'));
    this.on('jpdbReviewEasy', () => this.reviewCard('easy'));
    this.on('jpdbReviewFail', () => this.reviewCard('fail'));
    this.on('jpdbReviewPass', () => this.reviewCard('pass'));

    this.on('jpdbRotateForward', () => this.rotateFlag(true));
    this.on('jpdbRotateBackward', () => this.rotateFlag(false));
  }

  private async updateGradingKeys(): Promise<void> {
    const isAnkiEnabled = await getConfiguration('enableAnkiIntegration');
    const useTwoButtonGradingSystem = await getConfiguration('jpdbUseTwoGrades');
    const useFlagRotation = await getConfiguration('jpdbRotateFlags');

    const fiveGradeKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbReviewNothing',
      'jpdbReviewSomething',
      'jpdbReviewHard',
      'jpdbReviewGood',
      'jpdbReviewEasy',
    ];
    const twoGradeKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbReviewFail',
      'jpdbReviewPass',
    ];
    const flagKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbRotateForward',
      'jpdbRotateBackward',
    ];

    if (isAnkiEnabled) {
      return this._keyManager.removeKeys([...fiveGradeKeys, ...twoGradeKeys]);
    }

    if (useFlagRotation) {
      this._keyManager.addKeys(flagKeys, true);
    } else {
      this._keyManager.removeKeys(flagKeys, true);
    }

    if (useTwoButtonGradingSystem) {
      this._keyManager.removeKeys(fiveGradeKeys, true);
      await this._keyManager.addKeys(twoGradeKeys);

      return;
    }

    this._keyManager.addKeys(fiveGradeKeys, true);
    await this._keyManager.removeKeys(twoGradeKeys);
  }

  private reviewCard(
    _grade: 'nothing' | 'something' | 'hard' | 'good' | 'easy' | 'fail' | 'pass',
  ): void {
    // console.log('grading crad', grade, this._currentContext?.ajbContext?.token);
  }

  private async rotateFlag(forward: boolean): Promise<void> {
    const { token } = this._currentContext?.ajbContext ?? {};

    if (!token) {
      return;
    }

    const state = token.card.cardState ?? [];

    const nf = state.includes('neverForget');
    const bl = state.includes('blacklisted');

    this._miningActions.suspendUpdateWordStates();

    if (forward) {
      if (!nf && !bl) {
        await this._miningActions.setDecks({ neverForget: true });
      }

      if (nf && !bl) {
        await this._miningActions.setDecks({ neverForget: false, blacklisted: true });
      }

      if (!nf && bl) {
        await this._miningActions.setDecks({ blacklisted: false });
      }

      this._miningActions.resumeUpdateWordStates();

      return;
    }

    if (!nf && !bl) {
      await this._miningActions.setDecks({ blacklisted: true });
    }

    if (nf && !bl) {
      await this._miningActions.setDecks({ neverForget: false });
    }

    if (!nf && bl) {
      await this._miningActions.setDecks({ blacklisted: false, neverForget: true });
    }

    this._miningActions.resumeUpdateWordStates();
  }
}
