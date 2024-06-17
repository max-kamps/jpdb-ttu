import { readLocalStorage, registerListener } from 'src/unsorted/messaging';
import { parse } from 'src/unsorted/parser/parse';
import { cssPath, integrationPath } from 'src/unsorted/paths';

registerListener('requestParse', async (tabId: number, selection?: string): Promise<void> => {
  await parse(tabId, selection);
});
