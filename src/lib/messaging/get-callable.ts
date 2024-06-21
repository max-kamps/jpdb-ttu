export function getCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: false,
): (...args: TArgs) => Promise<TOut>;
export function getCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent: true,
): (...args: TArgs) => Promise<TOut | undefined>;

export function getCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: boolean,
): (...args: TArgs) => Promise<TOut> | Promise<TOut | undefined> {
  return async (...args: TArgs): Promise<TOut> | Promise<TOut | undefined> => {
    const intermediate = (await chrome.runtime.sendMessage({ key, args })) as {
      success: boolean;
      result: TOut;
    };

    if (intermediate === undefined && allowNonExistent) {
      return undefined;
    }

    if (!intermediate?.success) {
      throw new Error(`Failed to execute callable '${key}'`);
    }

    return intermediate.result;
  };
}
