import { SetReturnType } from 'type-fest';
import { DeckId, Grade } from '../types.js';
import { PromiseHandle, sleep } from '../util.js';
import * as jpdb from './jpdb.js';

export type BackendResponse<T> = {
    ratelimitSleep: number;
    result: T;
};

type AnyBackendFunction = (...args: any) => Promise<BackendResponse<any>>;
type PendingCall<F extends AnyBackendFunction> = {
    func: F;
    args: Parameters<F>;
    resolve: (value: Awaited<ReturnType<F>>['result']) => void;
    reject: (reason: Error) => void;
    abortSignal?: AbortSignal;
};

const pendingAPICalls: PendingCall<AnyBackendFunction>[] = [];
const abortControllers = new Map<number, AbortController>();
let callerRunning = false;

async function apiCaller() {
    // If no API calls are pending, stop running
    if (callerRunning || pendingAPICalls.length === 0)
        // Only run one instance of this function at a time
        return;

    callerRunning = true;

    while (pendingAPICalls.length > 0) {
        // Get first call from queue

        // Safety: We know this can't be undefined, because we checked that the length > 0
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const call = pendingAPICalls.shift()!;

        try {
            const { ratelimitSleep: ratelimitSleep, result } = await call.func.apply(null, call.args);
            call.resolve(result);
            await sleep(ratelimitSleep);
        } catch (error) {
            call.reject(error as Error);
            // TODO implement exponential backoff
            await sleep(1500);
        }
    }

    callerRunning = false;
}

function enqueue<F extends AnyBackendFunction>(func: F, ...args: [...Parameters<F>]) {
    return new Promise((resolve, reject) => {
        pendingAPICalls.push({ func, args, resolve, reject });
        apiCaller();
    });
}

function enqueueAbortable<F extends AnyBackendFunction>(
    abortHandle: number,
    func: F,
    ...args: [...Parameters<F>]
): Promise<ReturnType<F>> {
    return new Promise((resolve, reject) => {
        const abortController = new AbortController();
        pendingAPICalls.push({ func, args, resolve, reject, abortSignal: abortController.signal });
        apiCaller();
    });
}

export async function addToDeck(vid: number, sid: number, deckId: DeckId, abortHandle?: number) {
    return enqueue(() => jpdb.addToDeck(vid, sid, deckId));
}
export async function removeFromDeck(vid: number, sid: number, deckId: DeckId, abortHandle?: number) {
    return enqueue(() => jpdb.removeFromDeck(vid, sid, deckId));
}
export async function setSentence(
    vid: number,
    sid: number,
    sentence?: string,
    translation?: string,
    abortHandle?: number,
) {
    return enqueue(() => jpdb.setSentence(vid, sid, sentence, translation));
}
export async function review(vid: number, sid: number, rating: Grade, abortHandle?: number) {
    return enqueue(() => jpdb.review(vid, sid, rating));
}
export async function getCardState(vid: number, sid: number, abortHandle?: number) {
    return enqueue(() => jpdb.getCardState(vid, sid));
}

const maxParseLength = 16384;

type PendingParagraph = PromiseHandle<Token[]> & {
    text: string;
    length: number;
};
const pendingParagraphs = new Map<number, PendingParagraph>();

async function batchParses() {
    // Greedily take as many paragraphs as can fit
    let length = 0;
    const strings: string[] = [];
    const handles: PromiseHandle<Token[]>[] = [];

    for (const [seq, paragraph] of pendingParagraphs) {
        length += paragraph.length;
        if (length > maxParseLength) break;
        strings.push(paragraph.text);
        handles.push(paragraph);
        pendingParagraphs.delete(seq);
    }

    if (strings.length === 0) return [null, 0] as [null, number];

    try {
        const [[tokenBatches, cards], timeout] = await backend.parse(strings);

        assert(tokenBatches.length === handles.length, 'Number of token batches does not match number of handles');

        for (const [i, handle] of handles.entries()) {
            handle.resolve(tokenBatches[i]!);
        }

        broadcast({ type: 'updateWordState', words: cards.map(card => [card.vid, card.sid, card.state]) });

        return [null, timeout] as [null, number];
    } catch (error) {
        for (const handle of handles) {
            handle.reject(error as Error);
        }

        throw error;
    }
}

export function enqueueParse(seq: number, text: string): Promise<Token[]> {
    return new Promise((resolve, reject) => {
        pendingParagraphs.set(seq, {
            text,
            // HACK work around the ○○ we will add later
            length: new TextEncoder().encode(text).length + 7,
            resolve,
            reject,
        });
    });
}

export function startParse() {
    pendingAPICalls.push({ func: batchParses, resolve: () => {}, reject: () => {} });
    apiCaller();
}
