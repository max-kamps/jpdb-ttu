// @reader content-script
import { paragraphsInNode, parseParagraphs } from './common.js';
import { config, callOnConfigLoad, requestParse } from '../content/background_comms.js';
import { showError } from '../content/toast.js';

// Register this script as a callback to run once config is loaded
const removeLinksFromVocabWords = () => {
  const vocabulary = document.getElementsByClassName('vocabulary-spelling');

  for (let i = 0; i < vocabulary.length; i++) {
    const link = vocabulary[i].getElementsByTagName('a')?.[0];

    // Remove link if it's there
    // TODO: YOU SHOULD TOTALLY PUT THIS LINK ON THE POPUP SOMEWHERE
    if (link) {
      link.removeAttribute('href'); // Remove link
      link.style.cursor = 'default'; // Change cursor to default (just felt better imo)
      link.style.borderBottom = 'none'; // Remove link border on hover, since it's not a link anymore
    }
  }
};

const jpdb_vocabulary_lists_main = (config: any) => {
  if (config.disableJPDBAutoParsing) {
    return;
  }

  try {
    if (config) {
      console.log('NICE, CONFIG IS ACCESSIBLE ' + config.disableFadeAnimation);
    } else {
      console.log('CONFIG IS UNDEFINED?');
      console.log(config);
    }

    const paragraphs = paragraphsInNode(document.getElementsByClassName('vocabulary-list')[0]);

    if (paragraphs.length > 0) {
      const [batches, applied] = parseParagraphs(paragraphs);
      requestParse(batches);
      Promise.allSettled(applied);
    }

    removeLinksFromVocabWords();
  } catch (error) {
    showError(error);
  }
};

// If config already loaded, run main, otherwise register main as a callback
if (config) {
  jpdb_vocabulary_lists_main(config);
} else {
  callOnConfigLoad.push(jpdb_vocabulary_lists_main);
}
