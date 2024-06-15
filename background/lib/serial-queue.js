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

  queue(func) {
    return new Promise((resolve, reject) => {
      this.pending.push({ func, resolve, reject });

      this.run();
    });
  }

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
