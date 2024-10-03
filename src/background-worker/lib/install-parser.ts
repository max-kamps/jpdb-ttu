import { sendToTab } from '@shared/extension/send-to-tab';
import { onTabMessage } from './on-tab-message';

const pendingParagraphs = new Map<
  number,
  { text: string; resolve: (tokens: unknown) => void; reject: () => void }
>();

export const installParser = () => {
  onTabMessage('parse', (sender, data) => {
    data.forEach(([sequenceId, text]) =>
      new Promise<unknown>((resolve, reject) =>
        pendingParagraphs.set(sequenceId, { text, resolve, reject }),
      )
        .then((tokens) => sendToTab('sequenceSuccess', sender.tab!.id, sequenceId, tokens))
        .catch((e) => sendToTab('sequenceError', sender.tab!.id, sequenceId, e.message)),
    );
    console.log('Parsing data', data);
  });

  onTabMessage('abortRequest', (sender, sequence) => {
    pendingParagraphs.delete(sequence);

    sendToTab('sequenceAborted', sender.tab!.id, sequence);
  });
};
