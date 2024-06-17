import { jsxCreateElement } from '@lib/jsx';
import { getCallable, requestParse } from 'src/unsorted/messaging';

chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
  const buttonContainer = document.querySelector('article');

  tabs.forEach((tab) => {
    buttonContainer.append(
      jsxCreateElement(
        'button',
        {
          onclick: () => requestParse(tab.id).then(() => window.close()),
        },
        `Parse "${tab.title ?? 'Untitled'}"`,
      ),
    );
  });
});
