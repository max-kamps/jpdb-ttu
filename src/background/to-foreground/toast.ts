import { getTabCallable } from '@lib/messaging/get-tab-callable';

export const sendToastRequest = async (
  type: 'error' | 'success',
  message: string,
  timeout: number = 5000,
) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];

    await getTabCallable<[type: 'error' | 'success', message: string, timeout?: number], void>(
      'toast',
    )(tab, type, message, timeout);
  });
};
