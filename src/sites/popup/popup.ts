// import { jsxCreateElement } from '@lib/jsx';
// import { getCallable, requestParse } from 'src/unsorted/messaging';

import { appendElement } from '@lib/renderer';
import { showToast } from '@lib/toast';
import { requestParse } from 'src/unsorted/messaging';

chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
  tabs.forEach((tab) => {
    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: () => {
        showToast('success', 'Parsing...');
        // alert('parse ' + tab.id + ' is-foreground: ' + (isForeground() ? 'fg' : 'bg'));
        // requestParse(tab.id).then(() => window.close())
      },
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  });
});
