import { displayToast } from '@shared/dom';
import {
  receiveBackgroundMessage,
  sendToBackground,
  LocalEventArgs,
  LocalEventFunction,
  LocalEvents,
  TabEventFunction,
  TabEvents,
} from '@shared/messages';
import { AbortableSequence, Sequence, PreparedRequest } from './types';
import { EventCollection } from './utils/event-collection';

const localListeners = new EventCollection();

class Canceled extends Error {}

export abstract class IntegrationScript {
  protected isMainFrame = window === window.top;

  protected static _nextSequence = 0;
  protected static _preparedRequests = new Map<number, PreparedRequest>();
  protected static _sequenceInitialized = false;
  protected static _initSequence(): void {
    if (IntegrationScript._sequenceInitialized) {
      return;
    }

    IntegrationScript._sequenceInitialized = true;

    const withSequence = (sequenceId: number, cb: (request: PreparedRequest) => void): void => {
      const request = IntegrationScript._preparedRequests.get(sequenceId);

      if (!request) {
        return;
      }

      cb(request);

      IntegrationScript._preparedRequests.delete(sequenceId);
    };

    receiveBackgroundMessage('sequenceAborted', (sequenceId: number) =>
      withSequence(sequenceId, (request) => request.reject(new Canceled())),
    );
    receiveBackgroundMessage('sequenceError', (sequenceId: number, error: string) =>
      withSequence(sequenceId, (request) => request.reject(new Error(error))),
    );
    receiveBackgroundMessage('sequenceSuccess', (sequenceId: number, ...parameters: unknown[]) =>
      withSequence(sequenceId, (request) => request.resolve(parameters)),
    );
  }

  constructor() {
    IntegrationScript._initSequence();
  }

  protected on<TEvent extends keyof LocalEvents>(
    event: TEvent,
    listener: LocalEventFunction<TEvent>,
  ): void {
    localListeners.register(event, listener);
  }

  protected emit<TEvent extends keyof LocalEvents>(
    event: TEvent,
    ...args: [...LocalEventArgs<TEvent>]
  ): void {
    localListeners.run(event, ...args);
  }

  protected listen<TEvent extends keyof TabEvents>(
    event: TEvent,
    listener: TabEventFunction<TEvent>,
  ): void {
    receiveBackgroundMessage(event, listener);
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
