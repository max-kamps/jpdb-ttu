/**
 * Defines events emitted from the browser to the extension
 */
export interface BackgroundEvents {
  parse: [[data: [sequenceId: number, text: string][]], void];
  lookupText: [[text: string], void];
  abortRequest: [[sequence: number], Promise<void>];
  updateCardState: [[vid: number, sid: number], void];
  addToDeck: [[vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'], void];
  removeFromDeck: [
    [vid: number, sid: number, key: 'mining' | 'blacklist' | 'neverForget'],
    Promise<void>,
  ];
}
export type BackgroundEventArgs<T extends keyof BackgroundEvents> = BackgroundEvents[T][0];
export type BackgroundEventResult<T extends keyof BackgroundEvents> = BackgroundEvents[T][1];
export type BackgroundEventFunction<T extends keyof BackgroundEvents = keyof BackgroundEvents> = (
  sender: chrome.runtime.MessageSender,
  ...args: BackgroundEventArgs<T>
) => BackgroundEventResult<T>;
