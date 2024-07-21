import { onBeforeParse, sendParseSelectionRequest } from '@background/to-foreground/parse';
import { prepareParse } from './prepare-parse';

export const parseSelection = async (tab: chrome.tabs.Tab): Promise<void> => {
  await prepareParse(tab);
  await onBeforeParse(tab);
  await sendParseSelectionRequest(tab);
};
