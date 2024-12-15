/**
 * Defines events emitted from the extension to the browser tab
 */
export interface TabEvents {
  sequenceAborted: [[sequence: number], void];
  sequenceSuccess: [[sequence: number, data: unknown], void];
  sequenceError: [[sequence: number, data: string], void];
  parsePage: [[], void];
  parseSelection: [[], void];
  toast: [[type: 'error' | 'success', message: string, timeoutDuration?: number], void];
}
export type TabEventArgs<T extends keyof TabEvents> = TabEvents[T][0];
export type TabEventResult<T extends keyof TabEvents> = TabEvents[T][1];
export type TabEventFunction<T extends keyof TabEvents = keyof TabEvents> = (
  ...args: TabEventArgs<T>
) => TabEventResult<T>;
