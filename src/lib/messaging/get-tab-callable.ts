export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: false,
): (tab: chrome.tabs.Tab | number, ...args: TArgs) => Promise<TOut>;
export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent: true,
): (tab: chrome.tabs.Tab | number, ...args: TArgs) => Promise<TOut | undefined>;

export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: boolean,
): (tab: chrome.tabs.Tab | number, ...args: TArgs) => Promise<TOut> | Promise<TOut | undefined> {
  return async (
    tab: chrome.tabs.Tab | number,
    ...args: TArgs
  ): Promise<TOut> | Promise<TOut | undefined> => {
    const tabId = typeof tab === 'number' ? tab : tab.id;

    try {
      const intermediate = (await chrome.tabs.sendMessage(tabId, {
        key,
        args,
      })) as {
        success: boolean;
        result: TOut;
      };

      if (!intermediate && allowNonExistent) {
        return undefined;
      }

      if (!intermediate?.success) {
        throw new Error(`Failed to execute callable '${key}' in tab with id ${tabId}`);
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

      console.error(`Failed to execute callable '${key}' in tab with id ${tabId}`);
      throw error;
    }
  };
}
