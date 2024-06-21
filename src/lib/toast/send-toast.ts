import { getTabCallable } from '@lib/messaging';

export const sendToast = (type: 'error' | 'success', message: string, timeout: number = 5000) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    getTabCallable<[type: 'error' | 'success', message: string, timeout?: number], void>('toast')(
      tab,
      type,
      message,
      timeout,
    );
  });
};
