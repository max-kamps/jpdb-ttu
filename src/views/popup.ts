import { Browser } from '@lib/browser';
import { View } from '@lib/view';

View.getInstance().onLoaded(async () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    Browser.getInstance().openOptionsPage();
  });

  for (const tab of await Browser.getInstance().getTabs({ currentWindow: true })) {
    if (tab.url.startsWith('about://') || tab.url.startsWith('chrome://')) {
      continue;
    }

    // if (await getCallable('is-disabled-on')(tab.id)) {
    //   continue;
    // }

    View.getInstance().appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: async () => {
        await Browser.getInstance().sendToTab('parsePage', tab.id);

        window.close();
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('settings-link').addEventListener('click', () => {
    Browser.getInstance().openOptionsPage();
  });
});
