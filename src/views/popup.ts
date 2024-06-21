import { requestParsePage } from '@lib/parser';
import { appendElement } from '@lib/renderer';

chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
  tabs.forEach((tab) => {
    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        await requestParsePage(tab.id);

        window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  });
});
