import { getCallable } from '@lib/messaging/get-callable';
import { appendElement } from '@lib/renderer/append-element';

chrome.tabs.query(
  {
    currentWindow: true,
  },
  (tabs: chrome.tabs.Tab[]) => {
    for (const tab of tabs) {
      console.log(tab.url);
      if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
        continue;
      }

      getCallable('is-disabled-on')(tab.id).then((isDisabled) => {
        if (isDisabled) {
          return;
        }

        appendElement<'a'>('.container', {
          tag: 'a',
          class: ['outline', 'parse'],
          handler: async () => {
            await getCallable('request-parse-page')(tab.id);

            window.close();
          },
          innerText: `Parse "${tab.title ?? 'Untitled'}"`,
        });
      });
    }
  },
);
