import { loadConfig } from './config.js';
import { browser, isChrome, sleep } from '../util.js';
import * as backend from './backend.js';
export let config = loadConfig();
const pendingAPICalls = [];
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
        const call = pendingAPICalls.shift();
        try {
            const [result, wait] = await call.func();
            call.resolve(result);
            await sleep(wait);
        }
        catch (error) {
            call.reject(error);
            // TODO implement exponential backoff
            await sleep(1500);
        }
    }
    callerRunning = false;
}
function enqueue(func) {
    return new Promise((resolve, reject) => {
        pendingAPICalls.push({ func, resolve, reject });
        apiCaller();
    });
}
export async function addToDeck(vid, sid, deckId) {
    return enqueue(() => backend.addToDeck(vid, sid, deckId));
}
export async function removeFromDeck(vid, sid, deckId) {
    return enqueue(() => backend.removeFromDeck(vid, sid, deckId));
}
export async function setSentence(vid, sid, sentence, translation) {
    return enqueue(() => backend.setSentence(vid, sid, sentence, translation));
}
export async function review(vid, sid, rating) {
    return enqueue(() => backend.review(vid, sid, rating));
}
export async function getCardState(vid, sid) {
    return enqueue(() => backend.getCardState(vid, sid));
}
const maxParseLength = 16384;
const pendingParagraphs = new Map();
function createBatches() {
    const batches = [];
    let currentBatch = { strings: [], handles: [] };
    let length = 0;
    for (const [seq, paragraph] of pendingParagraphs) {
        length += paragraph.length;
        if (length > maxParseLength) {
            batches.push(currentBatch);
            currentBatch = { strings: [], handles: [] };
            length = 0;
        }
        currentBatch.strings.push(paragraph.text);
        currentBatch.handles.push(paragraph);
        pendingParagraphs.delete(seq);
    }
    if (currentBatch.strings.length > 0) {
        batches.push(currentBatch);
    }
    return batches;
}
async function parseBatch(batch) {
    try {
        const [[tokens, cards], timeout] = await backend.parse(batch.strings);
        for (const [i, handle] of batch.handles.entries()) {
            handle.resolve(tokens[i]);
        }
        broadcast({ type: 'updateWordState', words: cards.map(card => [card.vid, card.sid, card.state]) });
        return [null, timeout];
    }
    catch (error) {
        for (const handle of batch.handles) {
            handle.reject(error);
        }
        throw error;
    }
}
export function enqueueParse(seq, text) {
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
    const batches = createBatches();
    if (batches.length > 0) {
        for (const batch of batches) {
            pendingAPICalls.push({ func: () => parseBatch(batch), resolve: () => { }, reject: () => { } });
        }
        apiCaller();
    }
}
// Content script communication
const ports = new Set();
function post(port, message) {
    port.postMessage(message);
}
function broadcast(message) {
    for (const port of ports)
        port.postMessage(message);
}
function postResponse(port, request, result) {
    port.postMessage({ type: 'success', seq: request.seq, result });
}
function onPortDisconnect(port) {
    console.log('disconnect:', port);
    ports.delete(port);
}
async function broadcastNewWordState(vid, sid) {
    broadcast({ type: 'updateWordState', words: [[vid, sid, await getCardState(vid, sid)]] });
}
// Chrome can't send Error objects over background ports, so we have to serialize and deserialize them...
// (To be specific, Firefox can send any structuredClone-able object, while Chrome can only send JSON-stringify-able objects)
const serializeError = isChrome ? (err) => ({ message: err.message, stack: err.stack }) : (err) => err;
const messageHandlers = {
    async cancel(request, port) {
        // Right now, only parse requests can actually be canceled
        pendingParagraphs.delete(request.seq);
        post(port, { type: 'canceled', seq: request.seq });
    },
    async updateConfig(request, port) {
        const oldCSS = config.customWordCSS;
        config = loadConfig();
        if (config.customWordCSS !== oldCSS) {
            for (const port of ports) {
                browser.tabs.insertCSS(port.sender.tab.id, { code: config.customWordCSS, cssOrigin: 'author' });
                browser.tabs.removeCSS(port.sender.tab.id, { code: oldCSS });
            }
        }
        postResponse(port, request, null);
        broadcast({ type: 'updateConfig', config });
    },
    async parse(request, port) {
        for (const [seq, text] of request.texts) {
            enqueueParse(seq, text)
                .then(tokens => post(port, { type: 'success', seq: seq, result: tokens }))
                .catch(error => post(port, { type: 'error', seq: seq, error: serializeError(error) }));
        }
        startParse();
    },
    async setFlag(request, port) {
        const deckId = request.flag === 'blacklist' ? config.blacklistDeckId : config.neverForgetDeckId;
        if (deckId === null) {
            throw Error(`No deck ID set for ${request.flag}, check the settings page`);
        }
        if (request.state === true) {
            await addToDeck(request.vid, request.sid, deckId);
        }
        else {
            await removeFromDeck(request.vid, request.sid, deckId);
        }
        postResponse(port, request, null);
        await broadcastNewWordState(request.vid, request.sid);
    },
    async review(request, port) {
        await review(request.vid, request.sid, request.rating);
        postResponse(port, request, null);
        await broadcastNewWordState(request.vid, request.sid);
    },
    async mine(request, port) {
        if (config.miningDeckId === null) {
            throw Error(`No mining deck ID set, check the settings page`);
        }
        if (request.forq && config.forqDeckId === null) {
            throw Error(`No forq deck ID set, check the settings page`);
        }
        // Safety: This is safe, because we early-errored for this condition
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await addToDeck(request.vid, request.sid, config.miningDeckId);
        if (request.sentence || request.translation) {
            await setSentence(request.vid, request.sid, request.sentence ?? undefined, request.translation ?? undefined);
        }
        if (request.forq) {
            // Safety: This is safe, because we early-errored for this condition
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await addToDeck(request.vid, request.sid, config.forqDeckId);
        }
        if (request.review) {
            await review(request.vid, request.sid, request.review);
        }
        postResponse(port, request, null);
        await broadcastNewWordState(request.vid, request.sid);
    },
};
async function onPortMessage(message, port) {
    console.log('message:', message, port);
    try {
        await messageHandlers[message.type](message, port);
    }
    catch (error) {
        post(port, { type: 'error', seq: message.seq ?? null, error: serializeError(error) });
    }
}
browser.runtime.onConnect.addListener(port => {
    console.log('connect:', port);
    if (port.sender.tab === undefined) {
        // Connection was not from a content script
        port.disconnect();
        return;
    }
    ports.add(port);
    port.onDisconnect.addListener(onPortDisconnect);
    port.onMessage.addListener(onPortMessage);
    // TODO filter to only url-relevant config options
    post(port, { type: 'updateConfig', config });
    browser.tabs.insertCSS(port.sender.tab.id, { code: config.customWordCSS, cssOrigin: 'author' });
});
// Context menu (Parse with jpdb)
function portForTab(tabId) {
    for (const port of ports)
        if (port.sender.tab.id === tabId)
            return port;
    return undefined;
}
const parseSelection = browser.contextMenus.create({
    id: 'parse-selection',
    title: 'Parse 「%s」with jpdb',
    contexts: ['selection'],
});
async function insertCSS(tabId) {
    // We need to await here, because ordering is significant.
    // The custom styles should load after the default styles, so they can overwrite them
    await browser.tabs.insertCSS(tabId, { file: '/content/word.css', cssOrigin: 'author' });
    if (config.customWordCSS)
        await browser.tabs.insertCSS(tabId, { code: config.customWordCSS, cssOrigin: 'author' });
}
browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === parseSelection) {
        const port = portForTab(tab.id);
        if (port === undefined) {
            // New tab, inject css
            await insertCSS(tab.id);
        }
        await browser.tabs.executeScript(tab.id, { file: '/integrations/contextmenu.js' });
    }
});
