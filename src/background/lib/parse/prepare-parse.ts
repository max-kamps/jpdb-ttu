import { injectStyle } from '../inject-style';

export const prepareParse = async (tab: chrome.tabs.Tab): Promise<void> => {
  await injectStyle(tab, 'word');
};
