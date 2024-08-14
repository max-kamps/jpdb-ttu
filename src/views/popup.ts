import { appendElement } from '@lib/dom/append-element';
import { onLoaded } from '@lib/dom/on-loaded';
import { getTabs } from '@lib/extension/get-tabs';
import { openOptionsPage } from '@lib/extension/open-options-page';
import { sendToTab } from '@lib/extension/send-to-tab';

onLoaded(async () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    openOptionsPage();
  });

  for (const tab of await getTabs({ currentWindow: true })) {
    if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
      continue;
    }

    // if (await getCallable('is-disabled-on')(tab.id)) {
    //   continue;
    // }

    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        await sendToTab('parsePage', tab.id);

        window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
