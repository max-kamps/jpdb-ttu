import { getHostMeta } from '@shared/host/get-host-meta';

export class HostEvaluator {
  private _targetedTriggerMeta: HostMeta;
  private _targetedAutomaticMeta: HostMeta[];

  private _defaultTriggerMeta: HostMeta;
  private _defaultAutomaticMeta: HostMeta[];

  public get relevantMeta(): HostMeta[] {
    const result: HostMeta[] = [];

    if (this._targetedTriggerMeta) {
      result.push(this._targetedTriggerMeta);
    }

    if (this._targetedAutomaticMeta.length) {
      result.push(...this._targetedAutomaticMeta);
    }

    if (!result.length) {
      result.push(this._defaultTriggerMeta);
    }

    result.push(...this._defaultAutomaticMeta);

    return result;
  }

  public get triggerMeta(): HostMeta {
    return this._targetedTriggerMeta || this._defaultTriggerMeta;
  }

  constructor(private _host: string) {}

  public get canBeTriggered(): boolean {
    if (this._targetedTriggerMeta?.disabled || this._targetedAutomaticMeta.length) {
      return false;
    }

    return true;
  }

  public async load(): Promise<void> {
    this._targetedTriggerMeta = await getHostMeta(
      this._host,
      ({ auto, host }) => !auto && host !== '<all_urls>',
    );
    this._targetedAutomaticMeta = await getHostMeta(
      this._host,
      ({ auto, host }) => auto && host !== '<all_urls>',
      true,
    );

    this._defaultTriggerMeta = await getHostMeta(
      this._host,
      ({ auto, host }) => auto === false && host === '<all_urls>',
    );
    this._defaultAutomaticMeta = await getHostMeta(
      this._host,
      ({ auto, host }) => auto && host === '<all_urls>',
      true,
    );
  }
}
