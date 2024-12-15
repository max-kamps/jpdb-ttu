import { getTabs } from '@shared/extension/get-tabs';
import { broadcastToBackground } from '@shared/extension/send-to-background';
import { broadcastToTab } from '@shared/extension/send-to-tab';

export const broadcast = async <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...BroadcastEvents[TEvent]]
): Promise<void> => {
  const promises = [];

  promises.push(broadcastToBackground(event, ...args));

  for (const tab of await getTabs({})) {
    if (tab.id) {
      promises.push(broadcastToTab(event, tab.id, ...args));
    }
  }

  await Promise.allSettled(promises);
};
