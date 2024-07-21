import { registerListener } from '@lib/messaging/register-listener';
import { parsePage } from './lib/parse/parse-page';
import { parseSelection } from './lib/parse/parse-selection';
import { parseJPDBText } from '@lib/jpdb/parse-jpdb-text';
import { AbortableController } from './lib/abortable-controller';
import { ParagraphParser } from './lib/parse/paragraph-parser';

registerListener('request-parse-page', async (targetTabId: number) => {
  const tab = await chrome.tabs.get(targetTabId);

  await parsePage(tab);
});

registerListener('request-parse-selection', async (targetTabId: number) => {
  const tab = await chrome.tabs.get(targetTabId);

  await parseSelection(tab);
});

AbortableController.getInstance().registerAbortableListener<
  [paragraphs: IdentifyableText[]],
  Promise<unknown>
>(
  'parse-paragraphs',
  async (
    abortedState: AbortedState,
    sequence: number,
    paragraphs: IdentifyableText[],
    senderTabId: number,
  ) => await new ParagraphParser(abortedState, senderTabId, sequence, paragraphs).parse(),
);
