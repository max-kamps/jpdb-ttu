// @reader content-script

import { runFunctionWhenConfigLoaded, runFunctionWhenReviewDone } from '../content/background_comms.js';
import { showError } from '../content/toast.js';

let shouldShow = false;
let initial_reviews_count = Number(
  document.querySelector<HTMLElement>('.nav > .nav-item:first-of-type > span')?.innerText ?? 0,
);

// I know this is gross! I'll fix it...someday
const showing_cards = window.location.href
  .split('&')
  .filter(part => part.startsWith('show_only'))[0]
  .replace('show_only=', '')
  .split(',');

const in_review_mode =
  showing_cards.length == 2 && showing_cards.includes('overdue') && showing_cards.includes('failed');

const toggleUnimportantElements = (forceHide = false) => {
  const should_hide = forceHide || shouldShow;

  const unimportant_info = document.getElementById('unimportant_info');
  unimportant_info!.style.display = should_hide ? 'none' : 'block';

  shouldShow = !shouldShow;
};

const updateReviewsDoneCount = (reviewsDone: number) => {
  document.getElementById('reviews_done')!.innerText = `${reviewsDone}`;
  document.getElementById('total_reviews')!.innerText = `${initial_reviews_count - reviewsDone}`;
};
runFunctionWhenReviewDone(updateReviewsDoneCount);

const prepareTopSection = (config: any) => {
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

    initial_reviews_count = Number(showing_of_message.split(' ')[showing_of_message.split(' ').length - 1]);

    showing_of_progress_p.firstChild!.textContent = showing_of_message;
    showing_of_progress_p.style.display = 'flex';
    showing_of_progress_p.style.justifyContent = 'space-between';
    showing_of_progress_p.style.margin = '1rem 0';
    showing_of_progress_p.style.lineHeight = '34px';

    // Only add spacer if enabled and on due/failed only
    if (!config.disableExtraSpace && in_review_mode) {
      const spacer = document.createElement('div');
      Object.assign(spacer.style, {
        padding: '0px',
        margin: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 'calc(100dvh - 234px)',
      });

      const hide_space_button = document.createElement('button');
      hide_space_button.innerText = 'Hide Blank Space';
      Object.assign(hide_space_button.style, {
        padding: '0px 18px',
        margin: '0px',
        color: 'var(--text-color)',
        opacity: '0.4',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '7px',
        textAlign: 'center',
        boxShadow: 'none',
        transform: 'none',
        height: 'auto',
        width: 'auto',
      });

      spacer.appendChild(hide_space_button);

      showing_of_progress_p.insertAdjacentElement('afterend', spacer);

      hide_space_button.addEventListener('click', () => {
        spacer.style.display = 'none';
      });
    }

    const show_hidden_elements_button = document.createElement('input');
    show_hidden_elements_button.setAttribute('type', 'button');
    show_hidden_elements_button.setAttribute('value', 'Show/Hide');
    show_hidden_elements_button.classList.add('outline');

    Object.assign(show_hidden_elements_button.style, {
      padding: '0px 12px',
      height: 'auto',
      color: 'var(--text-color)',
      borderColor: 'var(--text-color)',
      textDecoration: 'none',
      margin: 0,
    });
    showing_of_progress_p.prepend(show_hidden_elements_button);

    show_hidden_elements_button.addEventListener('click', () => {
      toggleUnimportantElements();
    });
  }

  const progress_report = document.createElement('span');
  progress_report.innerHTML = `<span id="reviews_done">0</span> / <span id="total_reviews">${initial_reviews_count}</span>`;

  let pagination_div = document.querySelector<HTMLElement>('.pagination');
  if (pagination_div) {
    pagination_div.classList.remove(...['without-prev', 'without-next']);

    if (pagination_div.childElementCount === 1) {
      const existing_pagination_link_wrapper = document.createElement('div');
      existing_pagination_link_wrapper.appendChild(pagination_div.firstChild!);
      pagination_div.appendChild(existing_pagination_link_wrapper);
      const missing_pagination_link_wrapper = document.createElement('div');
      const missing_pagination_link = document.createElement('a');
      missing_pagination_link_wrapper.appendChild(missing_pagination_link);

      if (existing_pagination_link_wrapper.firstElementChild?.innerHTML.trim().toLowerCase() === 'next page') {
        pagination_div.prepend(missing_pagination_link_wrapper);
      } else if (
        existing_pagination_link_wrapper.firstElementChild?.innerHTML.trim().toLowerCase() === 'previous page'
      ) {
        existing_pagination_link_wrapper.firstElementChild.innerHTML = 'Prev page'; // Shorten this lol
        pagination_div.appendChild(missing_pagination_link_wrapper);
      }
    } else if (pagination_div.childElementCount === 2) {
      pagination_div.firstElementChild!.innerHTML = 'Prev page'; // Shorten this lol
    }

    pagination_div.insertBefore(progress_report, pagination_div.childNodes[1]);
  } else {
    const vocabulary_list = document.getElementsByClassName('vocabulary-list')[0];
    pagination_div = document.createElement('div');
    pagination_div.classList.add('pagination');
    vocabulary_list.insertAdjacentElement('beforebegin', pagination_div);
    pagination_div.style.justifyContent = 'center';
    pagination_div.appendChild(progress_report);
  }
};

const jpdb_global_deck_main = (config: any) => {
  if (config.disable2DReviewing) {
    return;
  }

  if (!config.apiToken) {
    showError(new Error('API Token not found, please input it in the JPDBreader settings'));
    return;
  }

  try {
    prepareTopSection(config);

    if (in_review_mode && config.hideVocabOSuccessfulGrade) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = '.entry.overdue:has(.known), .entry.overdue:has(.learning) { display: none; }';
      document.head.insertAdjacentElement('beforeend', styleTag);
    }

    document.head.innerHTML +=
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">';
  } catch (error) {
    showError(error);
  }
};

runFunctionWhenConfigLoaded(jpdb_global_deck_main);
