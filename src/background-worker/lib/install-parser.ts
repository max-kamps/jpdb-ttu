import { sendToTab } from '@shared/extension/send-to-tab';
import { Parser } from './class/parser';
import { onTabMessage } from './on-tab-message';
import { queueRequest } from './queue-request';
import { Batch } from './types/batch';
import { Handle } from './types/handle';

const BATCH_SIZE = 16384;
const JPDB_TIMEOUT = 200;

const pendingParagraphs = new Map<number, Handle>();

const queueParagraph = (sequenceId: number, sender: chrome.runtime.MessageSender, text: string) =>
  new Promise<unknown>((resolve, reject) =>
    pendingParagraphs.set(sequenceId, {
      resolve,
      reject,
      text,
      // HACK work around the ○○ we will add later
      length: new TextEncoder().encode(text).length + 7,
    }),
  )
    .then((tokens) => sendToTab('sequenceSuccess', sender.tab!.id, sequenceId, tokens))
    .catch((e) => sendToTab('sequenceError', sender.tab!.id, sequenceId, e.message))
    .finally(() => pendingParagraphs.delete(sequenceId));

const createParagraphBatches = (): Batch[] => {
  const batches: Batch[] = [];

  let currentBatch: Batch = { strings: [], handles: [] };
  let length = 0;

  for (const [seq, paragraph] of pendingParagraphs) {
    length += paragraph.length;

    if (length > BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = { strings: [], handles: [] };
      length = 0;
    }

    currentBatch.strings.push(paragraph.text);
    currentBatch.handles.push(paragraph);

    pendingParagraphs.delete(seq);
  }

  if (currentBatch.strings.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

export const installParser = () => {
  onTabMessage('parse', (sender, data) => {
    // Queue all paragraphs for parsing - those can then be packed into a batch
    data.forEach(([sequenceId, text]) => queueParagraph(sequenceId, sender, text));

    // Pack paragraphs into batches to reduce the amount of API calls.
    // Also, this improves the parsing due to the context
    const batches = createParagraphBatches();

    if (batches.length) {
      // Each batch now contains a set of paragraphs that can be parsed in one go
      // Those get parsed, then remapped to its original sequence and resolved there
      for (const batch of batches) {
        queueRequest(async () => {
          const parser = new Parser(batch);

          return parser.parse();
        }, JPDB_TIMEOUT).catch((e) => {
          for (const handle of batch.handles) {
            handle.reject(e);
          }
        });
      }
    }
  });

  onTabMessage('abortRequest', (sender, sequence) => {
    pendingParagraphs.delete(sequence);

    sendToTab('sequenceAborted', sender.tab!.id, sequence);
  });
};
