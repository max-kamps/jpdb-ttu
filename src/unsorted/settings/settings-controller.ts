import { readLocalStorage } from 'src/unsorted/messaging';
import { Observable, Subject } from 'rxjs';
import { DEFAULT_OPTIONS } from './default-options';

export class SettingsController {
  private static instance: SettingsController;

  public static getInstance(): SettingsController {
    if (!SettingsController.instance) {
      SettingsController.instance = new SettingsController();
    }

    return SettingsController.instance;
  }

  private _unsavedChanges: string[] = [];
  private _unsavedChangesChangedEvent = new Subject<void>();

  public get hasUnsavedChanges(): boolean {
    return this._unsavedChanges.length > 0;
  }

  public get unsavedChangesChanged$(): Observable<void> {
    return this._unsavedChangesChangedEvent.asObservable();
  }

  private constructor() {}

  public checkForChanges(name: string, value: string | boolean | number): void {
    readLocalStorage(name).then(({ result: storedValue }) => {
      if (storedValue !== value && !this._unsavedChanges.includes(name)) {
        this._unsavedChanges.push(name);
      } else {
        this._unsavedChanges = this._unsavedChanges.filter((change) => change !== name);
      }

      this._unsavedChangesChangedEvent.next();
    });
  }

  public async getValueFor(name: keyof Configuration): Promise<string | boolean | number> {
    return await readLocalStorage(name, DEFAULT_OPTIONS[name].toString()).then(
      ({ result }) => result,
    );
  }
}
