export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
): (tab: chrome.tabs.Tab, ...args: TArgs) => Promise<TOut> {
  return async (tab: chrome.tabs.Tab, ...args: TArgs): Promise<TOut> => {
    const intermediate = (await chrome.tabs.sendMessage(tab.id, { key, args })) as {
      success: boolean;
      result: TOut;
    };

    if (!intermediate?.success) {
      throw new Error(`Failed to execute callable '${key}' in tab with id ${tab.id}`);
    }

    return intermediate.result;
  };
}
