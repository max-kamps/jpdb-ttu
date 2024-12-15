import { receiveTabMessage, sendToTab } from '@shared/messages';
import { queueRequest } from '../queue-request';
import { Parser } from './parser';
import { Batch, Handle } from './parser.types';

const BATCH_SIZE = 16384;
const JPDB_TIMEOUT = 200;

const pendingParagraphs = new Map<number, Handle>();

const queueParagraph = (
  sequenceId: number,
  sender: chrome.runtime.MessageSender,
  text: string,
): Promise<unknown> =>
  new Promise<unknown>((resolve, reject) =>
    pendingParagraphs.set(sequenceId, {
      resolve,
      reject,
      text,
      length: new TextEncoder().encode(text).length + 7,
    }),
  )
    .then((tokens) => sendToTab('sequenceSuccess', sender.tab!.id!, sequenceId, tokens))
    .catch((e: Error) => sendToTab('sequenceError', sender.tab!.id!, sequenceId, e.message))
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

export const installParser = (): void => {
  receiveTabMessage('parse', (sender, data) => {
    // Queue all paragraphs for parsing - those can then be packed into a batch
    data.forEach(([sequenceId, text]) => void queueParagraph(sequenceId, sender, text));

    // Pack paragraphs into batches to reduce the amount of API calls.
    // Also, this improves the parsing due to the context
    const batches = createParagraphBatches();

    if (batches.length) {
      // Each batch now contains a set of paragraphs that can be parsed in one go
      // Those get parsed, then remapped to its original sequence and resolved there
      for (const batch of batches) {
        queueRequest((): Promise<void> => {
          const parser = new Parser(batch);

          return parser.parse();
        }, JPDB_TIMEOUT).catch((e: Error) => {
          for (const handle of batch.handles) {
            handle.reject(e);
          }
        });
      }
    }
  });

  receiveTabMessage('abortRequest', async (sender, sequence): Promise<void> => {
    pendingParagraphs.delete(sequence);

    await sendToTab('sequenceAborted', sender.tab!.id!, sequence);
  });
};
