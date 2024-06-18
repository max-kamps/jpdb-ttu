export function getCallable<TArgs extends any[], TOut>(
  key: string,
): (...args: TArgs) => Promise<TOut> {
  return async (...args: TArgs): Promise<TOut> => {
    const intermediate = (await chrome.runtime.sendMessage({ key, args })) as {
      success: boolean;
      result: TOut;
    };

    if (!intermediate?.success) {
      throw new Error(`Failed to execute callable '${key}'`);
    }

    return intermediate.result;
  };
}
