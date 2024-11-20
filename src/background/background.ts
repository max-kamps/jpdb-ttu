import { BackgroundBoundMessageInfo, ContentBoundMessageInfo, Message, Response } from '../message_types.js';
import { DeckId, Grade, Token } from '../types.js';
import { PromiseHandle, assert } from '../util.js';
import { browser } from '../webextension.js';

// NOTE Do not use top level await in this file. As Chromium uses a service worker to run the background script, top level await is not supported.

// Content script communication

function broadcast(message: ContentBoundMessageInfo) {
    // TODO
    browser.tabs.query({}).then(tabs => {
        for (const tab of tabs) {
            // @ts-expect-error TODO XXX
            browser.tabs.sendMessage(tab.id!, message);
        }
    });
}

// async function broadcastNewWordState(vid: number, sid: number) {
//     broadcast({ type: 'updateWordState', words: [[vid, sid, await getCardState(vid, sid)]] });
// }

// // Chrome can't send Error objects over background ports, so we have to serialize and deserialize them...
// // (To be specific, Firefox can send any structuredClone-able object, while Chrome can only send JSON-stringify-able objects)
// const serializeError = isChrome ? (err: Error) => ({ message: err.message, stack: err.stack }) : (err: Error) => err;

// @ts-expect-error TODO XXX
const messageHandlers: {
    [I in BackgroundBoundMessageInfo as Message<I>['type']]: (request: Message<I>) => Promise<Response<I>>;
} = {
    async abort(payload) {
        pendingParagraphs.delete(payload.handle);
    },
    // async parse(payload) {
    //     for (const [seq, text] of payload.texts) {
    //         enqueueParse(seq, text)
    //             .then(tokens => post(port, { type: 'success', seq: seq, result: tokens }))
    //             .catch(error => post(port, { type: 'error', seq: seq, error: serializeError(error) }));
    //     }
    //     startParse();
    // },
    // async setFlag(request) {
    //     const deckId = request.flag === 'blacklist' ? config.blacklistDeckId : config.neverForgetDeckId;
    //     if (deckId === null) {
    //         throw Error(`No deck ID set for ${request.flag}, check the settings page`);
    //     }
    //     if (request.state === true) {
    //         await addToDeck(request.vid, request.sid, deckId);
    //     } else {
    //         await removeFromDeck(request.vid, request.sid, deckId);
    //     }
    //     postResponse(port, request, null);
    //     await broadcastNewWordState(request.vid, request.sid);
    // },
    // async review(request) {
    //     await review(request.vid, request.sid, request.rating);
    //     postResponse(port, request, null);
    //     await broadcastNewWordState(request.vid, request.sid);
    // },
    // async mine(request) {
    //     if (config.miningDeckId === null) {
    //         throw Error(`No mining deck ID set, check the settings page`);
    //     }
    //     if (request.forq && config.forqDeckId === null) {
    //         throw Error(`No forq deck ID set, check the settings page`);
    //     }
    //     // Safety: This is safe, because we early-errored for this condition
    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     await addToDeck(request.vid, request.sid, config.miningDeckId!);
    //     if (request.sentence || request.translation) {
    //         await setSentence(
    //             request.vid,
    //             request.sid,
    //             request.sentence ?? undefined,
    //             request.translation ?? undefined,
    //         );
    //     }
    //     if (request.forq) {
    //         // Safety: This is safe, because we early-errored for this condition
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         await addToDeck(request.vid, request.sid, config.forqDeckId!);
    //     }
    //     if (request.review) {
    //         await review(request.vid, request.sid, request.review);
    //     }
    //     await broadcastNewWordState(request.vid, request.sid);
    //     return null;
    // },
};

browser.runtime.onMessage.addListener(async (rawMessage, sender) => {
    // TODO checking this might be better, but also annoying without pulling in an external library
    // Just assume all messages are well-formed for now
    const message = rawMessage as Message<BackgroundBoundMessageInfo>;
    console.log('message:', message, sender);

    await messageHandlers[message.type](message as any);
    return { response: 'received', echo: message };
});

//     try {
//
//     } catch (error) {
//         post(port, { type: 'error', seq: (message as any).seq ?? null, error: serializeError(error as Error) });
//     }
// }

// browser.runtime.onConnect.addListener(port => {
//     console.log('connect:', port);

//     if (port.sender.tab === undefined) {
//         // Connection was not from a content script
//         port.disconnect();
//         return;
//     }

//     ports.add(port);

//     port.onDisconnect.addListener(onPortDisconnect);
//     port.onMessage.addListener(onPortMessage);

//     // TODO filter to only url-relevant config options
//     post(port, { type: 'updateConfig', config });
//     browser.tabs.insertCSS(port.sender.tab.id, { code: config.customWordCSS, cssOrigin: 'author' });
// });

// Context menu (parse selection)

// async function insertCSS(tabId?: number) {
//     // We need to await here, because ordering is significant.
//     // The custom styles should load after the default styles, so they can overwrite them
//     await browser.tabs.insertCSS(tabId, { file: '/content/word.css', cssOrigin: 'author' });
//     if (config.customWordCSS) await browser.tabs.insertCSS(tabId, { code: config.customWordCSS, cssOrigin: 'author' });
// }

const parseSelection = browser.contextMenus.create(
    {
        id: 'parse-selection',
        title: 'Parse 「%s」with jpdb',
        contexts: ['selection'],
    },
    () => {
        // Not sure what to do here
        if (browser.runtime.lastError) {
            throw Error(browser.runtime.lastError.message);
        }
    },
);

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === parseSelection) {
        console.log('Context menu action: parse selection:', info.selectionText);
        if (tab.id === undefined) {
            console.error('Could not parse selection: No tab ID');
            return;
        }
        await browser.scripting.executeScript({
            target: { tabId: tab.id, frameIds: [info.frameId ?? 0] },
            files: ['/integrations/contextmenu.js'],
        });
        // const port = portForTab(tab.id);
        // if (port === undefined) {
        //     // New tab, inject css
        //     await insertCSS(tab.id);
        // }
        // await browser.tabs.executeScript(tab.id, { file: '/integrations/contextmenu.js' });
    }
});
