// @reader content-script

import { paragraphsInNode, parseParagraphs } from './common.js';
import { requestParse } from '../content/background_comms.js';
import { showError } from '../content/toast.js';
import { config } from '../content/background_comms.js';

let shouldShow = false;

const toggleUnimportantElements = (forceHide = false) => {
  const should_hide = forceHide || shouldShow;

  const unimportant_info = document.getElementById('unimportant_info');
  unimportant_info!.style.display = should_hide ? 'none' : 'block';

  shouldShow = !shouldShow;
};

const removeLinksFromVocabWords = () => {
  const vocabulary = document.getElementsByClassName('vocabulary-spelling');

  for (let i = 0; i < vocabulary.length; i++) {
    const link = vocabulary[i].getElementsByTagName('a')[0];

    link.removeAttribute('href'); // Remove link
    link.style.cursor = 'default'; // Change cursor to default (just felt better imo)
    link.style.borderBottom = 'none'; // Remove link border on hover, since it's not a link anymore
  }
};

try {
  if (!config.apiToken) {
    throw new Error(
      'API Token not found, please input your JPDB API Token in the JPDBreader Settings page (found in the extension menu)',
    );
  }

  // Hide all unimportant containers and add button to show them
  const unimportant_info_elements = document.querySelectorAll<HTMLElement>('.container > *:nth-child(-n+8)');
  const unimportant_info = document.createElement('div');
  unimportant_info.id = 'unimportant_info';
  unimportant_info.append(...unimportant_info_elements);
  unimportant_info.style.display = 'none';

  document.querySelector<HTMLElement>('.container')?.prepend(unimportant_info);

  const showing_of_progress_p = document.querySelector<HTMLElement>('.container > p');
  if (showing_of_progress_p) {
    let showing_of_message = showing_of_progress_p.firstChild!.textContent || '';
    showing_of_message = showing_of_message.replace('Showing ', '');
    showing_of_message = showing_of_message.replace('..', '-');
    showing_of_message = showing_of_message.replace('from', 'of');
    showing_of_message = showing_of_message.replace(' entries', '');

    showing_of_progress_p.firstChild!.textContent = showing_of_message;
    showing_of_progress_p.style.display = 'flex';
    showing_of_progress_p.style.justifyContent = 'space-between';
    showing_of_progress_p.style.margin = '1rem 0';
    showing_of_progress_p.style.lineHeight = '34px';

    const show_hidden_elements_button = document.createElement('button');
    show_hidden_elements_button.innerHTML = 'Show/Hide';
    Object.assign(show_hidden_elements_button.style, {
      backgroundColor: 'transparent',
      border: '1px solid white',
      transform: 'none',
      boxShadow: 'none',
      padding: '0px 12px',
      fontSize: '16px',
      height: 'auto',
      borderRadius: '6px',
    });
    showing_of_progress_p.prepend(show_hidden_elements_button);

    show_hidden_elements_button.addEventListener('click', () => {
      toggleUnimportantElements();
    });
  }

  removeLinksFromVocabWords();

  const paragraphs = paragraphsInNode(document.getElementsByClassName('vocabulary-list')[0]);

  if (paragraphs.length > 0) {
    const [batches, applied] = parseParagraphs(paragraphs);
    requestParse(batches);
    Promise.allSettled(applied);
  }
} catch (error) {
  showError(error);
}
