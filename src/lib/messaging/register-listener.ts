const globalCallbacks = new Map<string, Function>();

chrome.runtime.onMessage.addListener(
  (
    request: { key: string; args?: unknown[] },
    _sender,
    sendResponse: (response: { success: boolean; result: unknown }) => void,
  ): boolean => {
    if (globalCallbacks.has(request.key)) {
      const fn = globalCallbacks.get(request.key) as (...args: unknown[]) => unknown;

      try {
        const fnResult = fn(...(request.args ?? []));

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

export function registerListener(name: string, fn: Function): void {
  globalCallbacks.set(name, fn);
}
