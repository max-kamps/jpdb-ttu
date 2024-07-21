const globalCallbacks = new Map<string, { sendTab: boolean; fn: Function }>();

chrome.runtime.onMessage.addListener(
  (
    request: { key: string; args?: unknown[] },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: { success: boolean; result: unknown }) => void,
  ): boolean => {
    if (globalCallbacks.has(request.key)) {
      const { fn, sendTab } = globalCallbacks.get(request.key);

      try {
        if (sendTab && !sender.tab) {
          throw new Error(`Did not receive tab ID from extension script: ${request.key}`);
        }

        const args = sendTab ? [...(request.args ?? []), sender.tab?.id] : request.args;
        const fnResult = fn(...args);

        if (fnResult instanceof Promise) {
          fnResult
            .then((result: unknown) => {
              sendResponse({ success: true, result });
            })
            .catch((_error) => {
              console.log('Error in extension script:', _error);

              sendResponse({ success: false, result: undefined });
            });

          return true;
        }

        sendResponse({ success: true, result: fnResult });
      } catch (error) {
        console.log('Error in extension script:', error);

        sendResponse({ success: false, result: undefined });
      }
    }

    return false;
  },
);

export function registerTabListener<TArgs extends any[], TResult = void>(
  name: string,
  fn: (...args: [...TArgs, senderTabId: number]) => TResult,
): void {
  if (!globalCallbacks.has(name)) {
    globalCallbacks.set(name, { fn, sendTab: true });
  }
}

export function registerListener<TArgs extends any[] = [], TResult = void>(
  name: string,
  fn: (...args: TArgs) => TResult,
): void {
  if (!globalCallbacks.has(name)) {
    globalCallbacks.set(name, { fn, sendTab: false });
  }
}
