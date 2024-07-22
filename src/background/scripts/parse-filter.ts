import { registerListener, registerTabListener } from '@lib/messaging/register-listener';

const disabledOnThisPage = new Set<number>();

registerTabListener('disable-on-this-page', async (tabId) => {
  console.log('Disabling on this page', tabId);
  disabledOnThisPage.add(tabId);
});

registerListener('is-disabled-on', (tabId: number) => {
  console.log('Checking if disabled on', tabId, disabledOnThisPage.has(tabId));
  return disabledOnThisPage.has(tabId);
});
