import { appendElement, onLoaded } from '@shared/dom';
import { getTabs, openOptionsPage } from '@shared/extension';
import { isDisabled } from '@shared/host-meta';
import { sendToTab } from '@shared/messages';

onLoaded(async () => {
  document.getElementById('settings-link')?.addEventListener('click', () => {
    void openOptionsPage();
  });

  for (const tab of await getTabs({ currentWindow: true })) {
    const url = tab.url!;

    if (!tab.id || url.startsWith('about://') || url.startsWith('chrome://')) {
      continue;
    }

    if (await isDisabled(url)) {
      continue;
    }

    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: (): void => void sendToTab('parsePage', tab.id!).then(() => window.close()),
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
