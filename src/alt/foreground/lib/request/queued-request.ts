export class QueuedRequest<T> implements Promise<T> {
  protected static _waitigPromises = new Set<QueuedRequest<unknown>>();
  protected static _sequence = 0;

  protected _resolve: (value: T) => void;
  protected _reject: (reason: unknown) => void;

  protected _running = false;
  protected _done = false;
  protected _promise: Promise<T>;

  public get [Symbol.toStringTag](): string {
    return 'AbortableRequest';
  }

  public readonly sequence = ++QueuedRequest._sequence;
  public readonly then: Promise<T>['then'];
  public readonly catch: Promise<T>['catch'];
  public readonly finally: Promise<T>['finally'];

  constructor(protected _promiseFactory: (sequence: number) => Promise<T>) {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);

    QueuedRequest._waitigPromises.add(this);
    QueuedRequest.runNext();
  }

  protected run(): void {
    this._running = true;
    this._promiseFactory(this.sequence)
      .then((v) => {
        this._resolve(v);

        QueuedRequest.afterRun(this);
      })
      .catch((reason: unknown) => {
        this._reject(reason);

        QueuedRequest.afterRun(this);
      });
  }

  protected static afterRun(instance: QueuedRequest<unknown>): void {
    instance._running = false;
    instance._done = true;

    QueuedRequest._waitigPromises.delete(instance);
    QueuedRequest.runNext();
  }

  protected static runNext(): void {
    const next = QueuedRequest._waitigPromises.values().next().value;

    if (next && !next._running) {
      next.run();
    }
  }
}
