import { getTabs } from '@lib/extension/get-tabs';
import { broadcastToBackground } from '@lib/extension/send-to-background';
import { broadcastToTab } from '@lib/extension/send-to-tab';

export const broadcast = async <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...ArgumentsFor<BroadcastEvents[TEvent]>]
): Promise<void> => {
  const promises = [];

  promises.push(broadcastToBackground(event, ...args));

  for (const tab of await getTabs({})) {
    promises.push(broadcastToTab(event as any, tab.id, ...(args as [])));
  }

  await Promise.allSettled(promises);
};
