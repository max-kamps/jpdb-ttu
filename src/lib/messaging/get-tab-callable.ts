export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: false,
): (tab: chrome.tabs.Tab, ...args: TArgs) => Promise<TOut>;
export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent: true,
): (tab: chrome.tabs.Tab, ...args: TArgs) => Promise<TOut | undefined>;

export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
  allowNonExistent?: boolean,
): (tab: chrome.tabs.Tab, ...args: TArgs) => Promise<TOut> | Promise<TOut | undefined> {
  return async (
    tab: chrome.tabs.Tab,
    ...args: TArgs
  ): Promise<TOut> | Promise<TOut | undefined> => {
    const intermediate = (await chrome.tabs.sendMessage(tab.id, {
      key,
      args,
    })) as {
      success: boolean;
      result: TOut;
    };

    if (intermediate === undefined && allowNonExistent) {
      return undefined;
    }

    if (!intermediate?.success) {
      throw new Error(`Failed to execute callable '${key}' in tab with id ${tab.id}`);
    }

    return intermediate.result;
  };
}
