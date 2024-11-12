// @reader content-script
import { parseJpdbVocabulary, vidSidPairsInNode } from './common.js';
import { requestJpdbVocabParse, runFunctionWhenConfigLoaded } from '../content/background_comms.js';
import { showError } from '../content/toast.js';

const jpdb_vocabulary_lists_main = (config: any) => {
  if (config.disableJPDBAutoParsing) {
    return;
  }

  try {
    const vidSidPairs = vidSidPairsInNode(document.getElementsByClassName('vocabulary-list')[0]);

    if (vidSidPairs.length > 0) {
      const [batches, applied] = parseJpdbVocabulary(vidSidPairs);
      requestJpdbVocabParse(batches);
      Promise.allSettled([applied]);
    }
  } catch (error) {
    showError(error);
  }
};

runFunctionWhenConfigLoaded(jpdb_vocabulary_lists_main);
