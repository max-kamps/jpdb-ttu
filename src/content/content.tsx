import { Keybind, config } from '../config.js';
import { BackgroundBoundMessageInfo, ContentBoundMessageInfo, Message, ResponseFor } from '../message_types.js';
import { Card, Grade } from '../types.js';
import { browser } from '../webextension.js';
import { Dialog } from './dialog.js';
import { Paragraph, reverseIndex } from './parse.js';
import { Popup } from './popup.js';
import { showError } from './toast.js';
import { getSentences, JpdbWord } from './word.js';

// Background script communication

let nextAbortHandle = 0;

export function sendMessage<M extends Message<BackgroundBoundMessageInfo>>(
    message: M,
    signal?: AbortSignal,
): Promise<ResponseFor<M>> {
    if (signal === undefined) {
        return browser.runtime.sendMessage(message) as Promise<ResponseFor<M>>;
    } else {
        if (signal.aborted) return Promise.reject(signal.reason);

        const abortHandle = nextAbortHandle++;
        return new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => {
                browser.runtime.sendMessage({ type: 'abort', handle: abortHandle });
                reject(signal.reason);
            });
            (browser.runtime.sendMessage({ ...message, abortHandle }) as Promise<ResponseFor<M>>).then(
                resolve as any, // TODO why does TS not like this?
                reject,
            );
        });
    }
}

export function requestSetFlag(card: Card, flag: 'blacklist' | 'never-forget' | 'forq', state: boolean) {
    return sendMessage({ type: 'setFlag', vid: card.vid, sid: card.sid, flag, state });
}

export function requestMine(card: Card, forq: boolean, sentence?: string, translation?: string) {
    return sendMessage({
        type: 'mine',
        forq,
        vid: card.vid,
        sid: card.sid,
        sentence: sentence ?? null,
        translation: translation ?? null,
    });
}

export function requestReview(card: Card, rating: Grade) {
    return sendMessage({ type: 'review', rating, vid: card.vid, sid: card.sid });
}

export function requestParse(paragraph: Paragraph) {
    return sendMessage({
        type: 'parse',
        text: paragraph.map(fragment => fragment.node.data).join(''),
        rubies: [],
    });
}

// Chrome can't send Error objects over background ports, so we have to serialize and deserialize them...
// (To be specific, Firefox can send any structuredClone-able object, while Chrome can only send JSON-stringify-able objects)
// const deserializeError = isChrome
//     ? (err: { message: string; stack: string }) => {
//           const e = new Error(err.message);
//           e.stack = err.stack;
//           return e;
//       }
//     : (err: Error) => err;

browser.runtime.onMessage.addListener(async (rawMessage, port) => {
    const message = rawMessage as Message<ContentBoundMessageInfo>;
    console.log('message:', message, port);

    switch (message.type) {
        case 'updateWordState':
            {
                for (const [vid, sid, state] of message.words) {
                    const idx = reverseIndex.get(`${vid}/${sid}`);
                    if (idx === undefined) continue;

                    const className = `jpdb-word ${state.join(' ')}`;
                    if (idx.className === className) continue;

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

// Hotkeys

export let currentHover: [JpdbWord, number, number] | null = null;
let popupKeyHeld = false;

function matchesHotkey(event: KeyboardEvent | MouseEvent, hotkey: Keybind) {
    const code = event instanceof KeyboardEvent ? event.code : `Mouse${event.button}`;
    return hotkey && code === hotkey.code && hotkey.modifiers.every(name => event.getModifierState(name));
}

async function hotkeyListener(event: KeyboardEvent | MouseEvent) {
    try {
        // @ts-expect-error TODO config
        if (matchesHotkey(event, config.showPopupKey) && !config.showPopupOnHover) {
            event.preventDefault();
            popupKeyHeld = true;

            const popup = Popup.get();
            popup.disablePointer();

            if (!currentHover) {
                popup.fadeOut();
            }
        }

        if (currentHover) {
            const [word, x, y] = currentHover;
            const card = word.jpdbData.token.card;

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.addKey)) {
                await requestMine(
                    word.jpdbData.token.card,
                    // @ts-expect-error TODO config
                    config.forqOnMine,
                    // @ts-expect-error TODO config
                    getSentences(word.jpdbData, config.contextWidth).trim() || undefined,
                    undefined,
                );
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.dialogKey)) {
                Dialog.get().showForWord(word.jpdbData);
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.showPopupKey)) {
                event.preventDefault();
                Popup.get().showForWord(word, x, y);
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.blacklistKey)) {
                event.preventDefault();
                await requestSetFlag(card, 'blacklist', !card.state.includes('blacklisted'));
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.neverForgetKey)) {
                event.preventDefault();
                await requestSetFlag(card, 'never-forget', !card.state.includes('never-forget'));
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.nothingKey)) {
                event.preventDefault();
                await requestReview(card, 'nothing');
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.somethingKey)) {
                event.preventDefault();
                await requestReview(card, 'something');
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.hardKey)) {
                event.preventDefault();
                await requestReview(card, 'hard');
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.goodKey)) {
                event.preventDefault();
                await requestReview(card, 'good');
            }

            // @ts-expect-error TODO config
            if (matchesHotkey(event, config.easyKey)) {
                event.preventDefault();
                await requestReview(card, 'easy');
            }
        }
    } catch (error) {
        showError(error);
    }
}

window.addEventListener('keydown', hotkeyListener);
window.addEventListener('mousedown', hotkeyListener);

function hidePopupHotkeyListener(event: KeyboardEvent | MouseEvent) {
    // @ts-expect-error TODO config
    if (matchesHotkey(event, config.showPopupKey)) {
        event.preventDefault();
        popupKeyHeld = false;
        Popup.get().enablePointer();
    }
}

window.addEventListener('keyup', hidePopupHotkeyListener);
window.addEventListener('mouseup', hidePopupHotkeyListener);

document.addEventListener('mousedown', e => {
    // @ts-expect-error TODO config
    if (config.touchscreenSupport) {
        // to prevent issues with simultaneous showing and hiding
        // and to allow clicking on the popup without making it disappear.
        if (currentHover == null && !Popup.get().containsMouse(e)) {
            Popup.get().fadeOut();
        }
    } else {
        Popup.get().fadeOut();
    }
});

export function onWordHoverStart({ target, x, y }: MouseEvent) {
    if (target === null) return;
    currentHover = [target as JpdbWord, x, y];
    // @ts-expect-error TODO config
    if (popupKeyHeld || config.showPopupOnHover) {
        // On mobile devices, the position of the popup is occasionally adjusted to ensure
        // it remains on the screen. However, due to the interaction between the 'onmouseenter'
        // event and the popup, there are instances where the popup appears and at the same
        // time a (review) button is being clicked.
        // @ts-expect-error TODO config
        if (config.touchscreenSupport) {
            Popup.get().disablePointer();

            setTimeout(() => {
                Popup.get().enablePointer();
            }, 400);
        }

        Popup.get().showForWord(target as JpdbWord, x, y);
    }
}

export function onWordHoverStop() {
    currentHover = null;
}
