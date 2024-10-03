const pending: Array<{
  fn: () => Promise<unknown>;
  resolve: (data: unknown) => void;
  reject: (reason: any) => void;
}> = [];

let isRunning: boolean = false;

const processQueue = async () => {
  if (isRunning || !pending.length) return;

  isRunning = true;

  while (pending.length) {
    const { fn, resolve, reject } = pending.shift()!;

    try {
      const data = await fn();

      resolve(data);
    } catch (error) {
      reject(error);
    }
  }

  isRunning = false;
};

export const queueRequest = <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    pending.push({ fn, resolve, reject });

    processQueue();
  });
};
