export function getTabCallable<TArgs extends any[], TOut>(
  key: string,
): (tab: chrome.tabs.Tab, ...args: TArgs) => Promise<TOut> {
  return async (tab: chrome.tabs.Tab, ...args: TArgs): Promise<TOut> => {
    const { result, success } = (await chrome.tabs.sendMessage(tab.id, { key, args })) as {
      success: boolean;
      result: TOut;
    };

    if (!success) {
      throw new Error(`Failed to execute callable '${key}' in tab with id ${tab.id}`);
    }

    return result;
  };
}
