import { displayToast } from '@shared/dom/display-toast';
import { onMessage } from '@shared/extension/on-message';
import { sendToBackground } from '@shared/extension/send-to-background';
import { AbortableSequence, Sequence } from './requests.type';

const localListeners: Partial<Record<keyof LocalEvents, Function[]>> = {};
const remoteListeners: Partial<Record<keyof TabEvents, Function[]>> = {};

onMessage<keyof TabEvents>((event, _, ...args) => {
  if (!remoteListeners[event]) {
    return;
  }

  remoteListeners[event].forEach((listener) => listener(...args));
});

class Canceled extends Error {}

export abstract class IntegrationScript {
  protected static _nextSequence = 0;
  protected static _preparedRequests = new Map<
    number,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >();
  protected static _sequenceInitialized = false;
  protected static _initSequence(): void {
    if (IntegrationScript._sequenceInitialized) {
      return;
    }

    IntegrationScript._sequenceInitialized = true;

    onMessage<keyof Pick<TabEvents, 'sequenceAborted' | 'sequenceSuccess' | 'sequenceError'>>(
      (event, _, sequenceId: number, data: any) => {
        const request = IntegrationScript._preparedRequests.get(sequenceId);

        switch (event) {
          case 'sequenceAborted':
            request?.reject(new Canceled());

            break;
          case 'sequenceError':
            request?.reject(new Error(data as string));

            break;
          case 'sequenceSuccess':
            request?.resolve(data);

            break;
          default: /* NOP */
        }

        IntegrationScript._preparedRequests.delete(sequenceId);
      },
      (msg) => ['sequenceAborted', 'sequenceSuccess', 'sequenceError'].includes(msg.event),
    );
  }

  constructor() {
    IntegrationScript._initSequence();
  }

  protected isMainFrame = window === window.top;

  protected on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: EventFunction<LocalEvents[TEvent]>,
  ): void {
    if (!localListeners[event]) {
      localListeners[event] = [];
    }

    localListeners[event].push(listener as Function);
  }

  protected emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...LocalEvents[TEvent]]
  ): void {
    if (!localListeners[event]) {
      return;
    }

    localListeners[event].forEach((listener) => listener(...args));
  }

  protected listen<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: EventFunction<TabEvents[TEvent]>,
  ): void {
    if (!remoteListeners[event]) {
      remoteListeners[event] = [];
    }

    remoteListeners[event].push(listener as Function);
  }

  protected lookupText(text: string): void {
    if (!text?.length) {
      displayToast('error', 'No text to lookup!');

      return;
    }

    sendToBackground('lookupText', text);
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
        sendToBackground('abortRequest', sequence);
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
