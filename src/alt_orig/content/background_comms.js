import { browser, Canceled, isChrome } from '../util.js';
import { reverseIndex } from './parse.js';
import { Popup } from './popup.js';
import { showError } from './toast.js';
// Background script communication
export let config;
const waitingPromises = new Map();
let nextSeq = 0;
function preregisterUnabortableRequest() {
    const seq = nextSeq++;
    const promise = new Promise((resolve, reject) => {
        waitingPromises.set(seq, { resolve, reject });
    });
    return [seq, promise];
}
function preregisterAbortableRequest() {
    const seq = nextSeq++;
    const abort = new AbortController();
    const promise = new Promise((resolve, reject) => {
        waitingPromises.set(seq, { resolve, reject });
        abort.signal.addEventListener('abort', () => {
            port.postMessage({ type: 'cancel', seq });
        });
    });
    return [seq, promise, abort];
}
// Avoid repetition for most common use case
function requestUnabortable(message) {
    const [seq, promise] = preregisterUnabortableRequest();
    port.postMessage({ ...message, seq });
    return promise;
}
export function requestSetFlag(card, flag, state) {
    return requestUnabortable({ type: 'setFlag', vid: card.vid, sid: card.sid, flag, state });
}
export function requestMine(card, forq, sentence, translation) {
    return requestUnabortable({ type: 'mine', forq, vid: card.vid, sid: card.sid, sentence, translation });
}
export function requestReview(card, rating) {
    return requestUnabortable({ type: 'review', rating, vid: card.vid, sid: card.sid });
}
export function requestUpdateConfig() {
    return requestUnabortable({ type: 'updateConfig' });
}
export function createParseBatch(paragraph) {
    const [seq, promise, abort] = preregisterAbortableRequest();
    return { paragraph, promise, abort, seq };
}
// Takes multiple ParseBatches to save on communications overhead between content script and background page
export function requestParse(batches) {
    const texts = batches.map(batch => [batch.seq, batch.paragraph.map(fragment => fragment.node.data).join('')]);
    return requestUnabortable({ type: 'parse', texts });
}
// Chrome can't send Error objects over background ports, so we have to serialize and deserialize them...
// (To be specific, Firefox can send any structuredClone-able object, while Chrome can only send JSON-stringify-able objects)
const deserializeError = isChrome
    ? (err) => {
        const e = new Error(err.message);
        e.stack = err.stack;
        return e;
    }
    : (err) => err;
export const port = browser.runtime.connect();
port.onDisconnect.addListener(() => {
    console.error('disconnect:', port);
});
port.onMessage.addListener((message, port) => {
    console.log('message:', message, port);
    switch (message.type) {
        case 'success':
            {
                const promise = waitingPromises.get(message.seq);
                waitingPromises.delete(message.seq);
                if (promise) {
                    promise.resolve(message.result);
                }
                else {
                    console.warn(`No promise with seq ${message.seq}, result dropped`);
                }
            }
            break;
        case 'error':
            {
                const promise = waitingPromises.get(message.seq);
                waitingPromises.delete(message.seq);
                if (promise) {
                    promise.reject(deserializeError(message.error));
                }
                else {
                    showError(message.error);
                }
            }
            break;
        case 'canceled':
            {
                const promise = waitingPromises.get(message.seq);
                waitingPromises.delete(message.seq);
                if (promise) {
                    promise.reject(new Canceled('Canceled'));
                }
            }
            break;
        case 'updateConfig':
            {
                config = message.config;
                Popup.get().updateStyle();
            }
            break;
        case 'updateWordState':
            {
                for (const [vid, sid, state] of message.words) {
                    const idx = reverseIndex.get(`${vid}/${sid}`);
                    if (idx === undefined)
                        continue;
                    const className = `jpdb-word ${state.join(' ')}`;
                    if (idx.className === className)
                        continue;
                    for (const element of idx.elements) {
                        element.className = className;
                        element.jpdbData.token.card.state = state;
                    }
                    idx.className = className;
                }
                Popup.get().render();
            }
            break;
    }
});
