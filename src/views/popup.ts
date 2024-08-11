// import { getCallable } from '@lib/messaging/get-callable';
// import { appendElement } from '@lib/renderer/append-element';

import { Browser } from '@lib/browser';
import { View } from '@lib/view';

View.onLoaded(async () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    Browser.openOptionsPage();
  });

  for (const tab of await Browser.getTabs({ currentWindow: true })) {
    if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
      continue;
    }

    // if (await getCallable('is-disabled-on')(tab.id)) {
    //   continue;
    // }

    View.appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        // await getCallable('request-parse-page')(tab.id);

        window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    Browser.openOptionsPage();
  });
});
