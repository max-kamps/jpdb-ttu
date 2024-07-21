import { injectStyle } from '../inject-style';
import { install } from '../install';

export const prepareParse = async (tab: chrome.tabs.Tab): Promise<void> => {
  await injectStyle(tab, 'word');
  await install(tab, 'dom-parser');
};
