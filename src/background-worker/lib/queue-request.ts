const pending: {
  fn: () => Promise<unknown>;
  resolve: (data: unknown) => void;
  reject: (reason: Error) => void;
  timeout?: number;
}[] = [];

let isRunning = false;

const processQueue = async (): Promise<void> => {
  if (isRunning || !pending.length) {
    return;
  }

  isRunning = true;

  while (pending.length) {
    const { fn, resolve, reject, timeout } = pending.shift()!;

    try {
      const data = await fn();

      resolve(data);
    } catch (error) {
      reject(error as Error);
    }

    if (timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  isRunning = false;
};

export const queueRequest = <T>(fn: () => Promise<T>, timeout?: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    pending.push({ fn, resolve, reject, timeout });

    void processQueue();
  });
};
