import { appendElement } from '@shared/dom/append-element';
import { onLoaded } from '@shared/dom/on-loaded';
import { getTabs } from '@shared/extension/get-tabs';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { sendToTab } from '@shared/extension/send-to-tab';
import { isDisabled } from '@shared/host/is-disabled';

onLoaded(async () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    openOptionsPage();
  });

  for (const tab of await getTabs({ currentWindow: true })) {
    if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
      continue;
    }

    if (await isDisabled(tab.url)) {
      continue;
    }

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
