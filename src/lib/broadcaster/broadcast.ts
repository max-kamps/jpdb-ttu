import { getTabs } from '@lib/extension/get-tabs';
import { sendToBackground } from '@lib/extension/send-to-background';
import { sendToTab } from '@lib/extension/send-to-tab';

export const broadcast = async <TEvent extends keyof BroadcastEvents>(
  event: TEvent,
  ...args: [...ArgumentsFor<BroadcastEvents[TEvent]>]
): Promise<void> => {
  const promises = [];

  promises.push(sendToBackground(event, ...args));

  for (const tab of await getTabs({})) {
    promises.push(sendToTab(event as any, tab.id, ...(args as [])));
  }

  await Promise.allSettled(promises);
};
