import { registerListener, registerTabListener } from '@lib/messaging/register-listener';

export class AbortableController {
  public readonly abortedSet = new Set<number>();
  private _abortedStates = new Map<number, AbortedState>();

  private static instance: AbortableController;

  public static getInstance() {
    if (!AbortableController.instance) {
      AbortableController.instance = new AbortableController();
    }

    return AbortableController.instance;
  }

  private constructor() {
    registerListener('abort-request', (sequence: number) => {
      this.abortedSet.add(sequence);

      if (this._abortedStates.has(sequence)) {
        this._abortedStates.get(sequence)!.aborted = true;
      }
    });
  }

  public registerAbortableListener<T extends any[], R>(
    listenerName: string,
    listener: (
      ...args: [abortedState: AbortedState, sequence: number, ...T, senderTabId: number]
    ) => R,
  ) {
    registerTabListener<[sequence: number, ...T]>(
      listenerName,
      async (sequence: number, ...args: [...T, senderTabId: number]) => {
        if (this.abortedSet.has(sequence)) {
          this.abortedSet.delete(sequence);

          return;
        }

        const abortedState = { aborted: false };

        this._abortedStates.set(sequence, abortedState);

        const result = await listener(abortedState, sequence, ...args);

        this._abortedStates.delete(sequence);

        return result;
      },
    );
  }
}
