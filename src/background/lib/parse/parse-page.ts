import { sendParsePageRequest } from '@background/to-foreground/parse';
import { prepareParse } from './prepare-parse';

export const parsePage = async (tab: chrome.tabs.Tab): Promise<void> => {
  await prepareParse(tab);

  await sendParsePageRequest(tab);
};
