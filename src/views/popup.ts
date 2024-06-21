import { getCallable } from '@lib/messaging/get-callable';
import { appendElement } from '@lib/renderer/append-element';

chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
  tabs.forEach((tab) => {
    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        getCallable('t')();
        // await requestParsePage(tab.id);

        // window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  });
});
