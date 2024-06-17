export function getCallable<TArgs extends any[], TOut>(
  key: string,
): (...args: TArgs) => Promise<TOut> {
  return async (...args: TArgs): Promise<TOut> => {
    const { result, success } = (await chrome.runtime.sendMessage({ key, args })) as {
      success: boolean;
      result: TOut;
    };

    if (!success) {
      throw new Error(`Failed to execute callable '${key}'`);
    }

    return result;
  };
}
