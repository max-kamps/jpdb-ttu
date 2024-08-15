import { appendElement } from '@shared/dom/append-element';
import { onLoaded } from '@shared/dom/on-loaded';
import { getTabs } from '@shared/extension/get-tabs';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { sendToTab } from '@shared/extension/send-to-tab';

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
