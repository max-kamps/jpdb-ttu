const pending: Array<{
  fn: () => Promise<unknown>;
  resolve: (data: unknown) => void;
  reject: (reason: any) => void;
  timeout?: number;
}> = [];

let isRunning: boolean = false;

const processQueue = async () => {
  if (isRunning || !pending.length) return;

  isRunning = true;

  while (pending.length) {
    const { fn, resolve, reject, timeout } = pending.shift()!;

    try {
      const data = await fn();

      resolve(data);
    } catch (error) {
      reject(error);
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

    processQueue();
  });
};
