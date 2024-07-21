import {
  getParseSelector,
  isParsingDisabled,
  onBeforeParse,
  sendParsePageRequest,
} from '@background/to-foreground/parse';
import { prepareParse } from './prepare-parse';

export const parsePage = async (tab: chrome.tabs.Tab): Promise<void> => {
  await prepareParse(tab);

  const selector = await getParseSelector(tab);
  const disabled = await isParsingDisabled(tab);

  await onBeforeParse(tab);
  await sendParsePageRequest(tab, disabled ? '.ajb-auto-parse-disable' : selector);
};
