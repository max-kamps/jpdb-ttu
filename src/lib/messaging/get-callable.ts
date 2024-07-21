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
    try {
      const intermediate = (await chrome.runtime.sendMessage({ key, args })) as {
        success: boolean;
        result: TOut;
      };

      if (!intermediate && allowNonExistent) {
        return undefined;
      }

      if (!intermediate?.success) {
        throw new Error(`Failed to execute callable '${key}'`);
      }

      return intermediate.result;
    } catch (error) {
      if (
        (error.message as string).includes(
          'Could not establish connection. Receiving end does not exist',
        )
      ) {
        if (allowNonExistent) {
          return undefined;
        }
      }

      console.error(`Failed to execute callable '${key}'`);
      throw error;
    }
  };
}
