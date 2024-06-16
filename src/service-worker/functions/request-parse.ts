import { readLocalStorage, registerListener } from '@lib/messaging';
import { parse } from '@lib/parser/parse';
import { cssPath, integrationPath } from '@lib/paths';

registerListener('requestParse', async (tabId: number, selection?: string): Promise<void> => {
  await parse(tabId, selection);
});
