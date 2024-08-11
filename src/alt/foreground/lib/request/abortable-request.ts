import { abortRequest } from '@foreground/to-background/abort-request';
import { QueuedRequest } from './queued-request';

export class AbortableRequest<T> extends QueuedRequest<T> {
  protected _aborted = false;

  protected run(): void {
    if (this._aborted) {
      return this._reject(new Error('Aborted'));
    }

    super.run();
  }

  public abort(): void {
    if (this._done) {
      return;
    }

    this._aborted = true;

    if (!this._running) {
      abortRequest(this.sequence);

      this._resolve(undefined);
    }

    AbortableRequest._waitigPromises.delete(this);
  }
}
