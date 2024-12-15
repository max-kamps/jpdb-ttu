import { displayToast } from '@shared/dom/display-toast';
import { onMessage } from '@shared/extension/on-message';
import { sendToBackground } from '@shared/extension/send-to-background';
import { AbortableSequence, Sequence } from './requests.type';

const localListeners: Partial<Record<keyof LocalEvents, EventFunctions<LocalEvents>[]>> = {};
const remoteListeners: Partial<Record<keyof TabEvents, EventFunctions<TabEvents>[]>> = {};

onMessage<TabEvents, keyof TabEvents>((event, _, ...args) => {
  if (!remoteListeners[event]) {
    return;
  }

  remoteListeners[event].forEach((listener) => void listener(...args));
});

class Canceled extends Error {}

export abstract class IntegrationScript {
  protected isMainFrame = window === window.top;

  protected static _nextSequence = 0;
  protected static _preparedRequests = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (reason: Error) => void }
  >();
  protected static _sequenceInitialized = false;
  protected static _initSequence(): void {
    if (IntegrationScript._sequenceInitialized) {
      return;
    }

    IntegrationScript._sequenceInitialized = true;

    onMessage<TabEvents, 'sequenceAborted' | 'sequenceSuccess' | 'sequenceError'>(
      (
        event,
        _,
        sequenceId: number,
        data: [
          ...ArgumentsForEvent<TabEvents, 'sequenceAborted' | 'sequenceSuccess' | 'sequenceError'>,
        ],
      ) => {
        const request = IntegrationScript._preparedRequests.get(sequenceId);

        switch (event) {
          case 'sequenceAborted':
            request?.reject(new Canceled());

            break;
          case 'sequenceError':
            request?.reject(new Error(data as unknown as string));

            break;
          case 'sequenceSuccess':
            request?.resolve(data);

            break;
          default: /* NOP */
        }

        IntegrationScript._preparedRequests.delete(sequenceId);
      },
      (msg): boolean =>
        ['sequenceAborted', 'sequenceSuccess', 'sequenceError'].includes(msg.event as string),
    );
  }

  constructor() {
    IntegrationScript._initSequence();
  }

  protected on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: EventFunction<LocalEvents, TEvent>,
  ): void {
    if (!localListeners[event]) {
      localListeners[event] = [];
    }

    localListeners[event].push(listener);
  }

  protected emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...ArgumentsForEvent<LocalEvents, TEvent>]
  ): void {
    if (!localListeners[event]) {
      return;
    }

    localListeners[event].forEach((listener: EventFunction<LocalEvents, keyof LocalEvents>) =>
      /**
       * The spread operator works fine as soon as we have multiple different parameters.
       * As of now it just happens to always resolve (ev: KeyboardEvent | MouseEvent).
       *
       * While it would be correct to parse the parameters accordingly, it would break as soon as we add another event to the local events
       */
      // @ts-expect-error: TS2556
      listener(...args),
    );
  }

  protected listen<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: EventFunction<TabEvents, TEvent>,
  ): void {
    if (!remoteListeners[event]) {
      remoteListeners[event] = [];
    }

    remoteListeners[event].push(listener);
  }

  protected async lookupText(text: string | undefined): Promise<void> {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    await sendToBackground('lookupText', text);
  }

  protected getUnabortableSequence<TData>(data: TData): Sequence<void, TData> {
    const sequence = ++IntegrationScript._nextSequence;
    const promise = new Promise<void>((resolve, reject) => {
      IntegrationScript._preparedRequests.set(sequence, { resolve, reject });
    });

    return {
      sequence,
      promise,
      data,
    };
  }

  protected getAbortableSequence<TResult = void, TData = unknown>(
    data: TData,
  ): AbortableSequence<TResult, TData> {
    const sequence = ++IntegrationScript._nextSequence;
    const abortController = new AbortController();
    const promise = new Promise<TResult>((resolve, reject) => {
      abortController.signal.addEventListener('abort', () => {
        void sendToBackground('abortRequest', sequence);
      });

      IntegrationScript._preparedRequests.set(sequence, { resolve, reject });
    });

    return {
      abort: () => abortController.abort(),
      sequence,
      promise,
      data,
    };
  }
}
