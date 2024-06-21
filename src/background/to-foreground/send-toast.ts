import { getTabCallable } from '@lib/messaging/get-tab-callable';
import { install } from '../lib/install';

export const sendToast = async (
  type: 'error' | 'success',
  message: string,
  timeout: number = 5000,
) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];

    await install(tab, 'toaster');
    await getTabCallable<[type: 'error' | 'success', message: string, timeout?: number], void>(
      'toast',
    )(tab, type, message, timeout);
  });
};
