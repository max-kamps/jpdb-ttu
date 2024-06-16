/**
 * Queue for requests which may require a short timeout after execution.
 * Also all requests are executed sequentially.
 */
class SerialQueue {
  TIMEOUT = 200;

  constructor() {
    this.pending = [];
    this.running = false;
  }

  /**
   * Queue a function to be executed.
   *
   * @public
   * @param {<T>() => T} func
   * @returns {Promise<T>}
   */
  queue(func) {
    return new Promise((resolve, reject) => {
      this.pending.push({ func, resolve, reject });

      this.run();
    });
  }

  /**
   * Runs the next item in the queue. Recursively calls itself until the queue is empty.
   *
   * @private
   * @returns {void}
   */
  run() {
    if (this.running || this.pending.length === 0) {
      return;
    }

    const { func, resolve, reject } = this.pending.shift();

    this.running = true;

    func()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running = false;

        setTimeout(() => {
          this.run();
        }, this.TIMEOUT);
      });
  }
}

export let serialQueue = new SerialQueue();
