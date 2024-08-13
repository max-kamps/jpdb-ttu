// import { getCallable } from '@lib/messaging/get-callable';

import { browser } from '@lib/browser';
import { view } from '@lib/view';

view.onLoaded(async () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    browser.openOptionsPage();
  });

  for (const tab of await browser.getTabs({ currentWindow: true })) {
    if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
      continue;
    }

    // if (await getCallable('is-disabled-on')(tab.id)) {
    //   continue;
    // }

    view.appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        await browser.sendToTab(tab.id, 'parsePage', false);

        window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    browser.openOptionsPage();
  });
});
