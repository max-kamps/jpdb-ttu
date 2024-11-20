/* eslint-disable @typescript-eslint/no-namespace */
// NOTE This does not implement the entire webextensions API, only those parts I need.
// NOTE This should generally only include features available in both Firefox and Chrome.
// NOTE Many of these functions also accept callbacks instead of promises for backwards compatibility.
//      The callback versions are not included here.

// Chrome only supports JSON-serializable objects in messages
// https://issues.chromium.org/issues/40321352
import { JsonObject, JsonValue, RequireExactlyOne, RequireOneOrNone } from 'type-fest';

export declare namespace browser {
    namespace events {
        // type Rule = {
        //     id?: string,
        //     priority?: number = 100,
        //     tags?: string[],
        //     actions: any[],
        //     conditions: any[],
        // }
        type Event<F extends (...args: any) => any> = {
            addListener: (callback: F) => void;
            removeListener: (callback: F) => void;
            hasListener: (callback: F) => boolean;
            // addRules(rules: Rule<anyany>[], callback?: function) =>
        };
    }

    namespace tabs {
        type MutedInfoReason = 'user' | 'capture' | 'extension';
        type MutedInfo = {
            extensionId?: string;
            muted: boolean;
            reason?: MutedInfoReason;
        };
        type Tab = {
            active: boolean;
            audible?: boolean;
            autoDiscardable: boolean;
            discarded: boolean;
            favIconUrl?: string; // Requires the "tabs" permission
            groupId: number;
            height?: number;
            highlighted: boolean;
            id?: number;
            incognito: boolean;
            index: number;
            lastAccessed?: number;
            mutedInfo?: MutedInfo;
            openerTabId?: number;
            pendingUrl?: string; // Requires the "tabs" permission
            pinned: boolean;
        };

        // TODO
        function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<Tab[]>;
    }

    namespace runtime {
        let lastError: { message: string } | undefined;

        function getURL(path: string): string;
        function sendMessage(message: JsonObject, options?: { includeTlsChannelId?: boolean }): Promise<JsonObject>;
        function sendMessage(
            extensionId: string,
            message: JsonObject,
            options?: { includeTlsChannelId?: boolean },
        ): Promise<JsonObject>;

        type MessageSender = {
            id?: string; // Id of the extension that sent the message, if the message was sent by an extension
            nativeApplication?: string; // The native application that sent the message, if the message was sent by a native application
            tab?: browser.tabs.Tab; // Tab that sent the message, if the message was sent by a content script
            url?: string; // The URL of the page that sent the message, if the message was sent by a content script
            origin?: string; // The origin of the page that sent the message, if the message was sent by a content script
            documentId?: string; // UUID of the document that sent the message, if the message was sent by a content script
            frameId?: number; // The frame that sent the message, if the message was sent by a content script
            documentLifecycle?: string; // The lifecycle state of the document that sent the message (at the time it sent the message), if the message was sent by a content script
            tlsChannelId?: string; // Dunno
        };
        let onMessage: browser.events.Event<(message: JsonObject, sender: MessageSender) => Promise<JsonObject | void>>;
    }

    namespace storage {
        type StorageChange = {
            newValue?: JsonValue;
            oldValue?: JsonValue;
        };

        type StorageArea = {
            get(keys?: null): Promise<JsonObject>;
            get<K extends string>(keys: K): Promise<{ [key in K]: JsonValue | undefined }>;
            get<K extends string[]>(keys: K): Promise<{ [key in K[number]]: JsonValue | undefined }>;
            get<K extends JsonObject>(keys: K): Promise<{ [key in keyof K]: JsonValue | K[key] }>;
            set(items: JsonObject): Promise<void>;
            remove(keys: string | string[]): Promise<void>;
            clear: () => Promise<void>;
            getBytesInUse(keys?: null | string | string[]): Promise<number>;
            // setAccessLevel(...)
            onChanged: browser.events.Event<(changes: { [key: string]: StorageChange }) => void>;
        };

        const session: StorageArea;
        const local: StorageArea;
        const sync: StorageArea;
    }

    namespace contextMenus {
        type ItemId = string | number;

        type ContextType =
            | 'all'
            | 'page'
            | 'frame'
            | 'selection'
            | 'link'
            | 'editable'
            | 'image'
            | 'video'
            | 'audio'
            | 'launcher'
            | 'browser_action'
            | 'page_action'
            | 'action';

        type ItemType = 'normal' | 'checkbox' | 'radio' | 'separator';

        // TODO would be nice to split this into different types based on the context type
        type OnClickData = {
            menuItemId: ItemId;
            parentMenuItemId?: ItemId;

            pageUrl?: string;
            frameId?: number;
            frameUrl?: string;

            wasChecked?: boolean;
            checked?: boolean;

            editable: boolean;
            mediaType: 'image' | 'video' | 'audio';
            srcUrl?: string;
            linkUrl?: string;
            selectionText?: string;
        };

        type CreateProperties = {
            checked?: boolean;
            contexts?: [ContextType, ...ContextType[]];
            documentUrlPatterns?: string[];
            enabled?: boolean;
            id?: string;
            parentId?: ItemId;
            targetUrlPatterns?: string[];
            title?: string;
            type?: ItemType;
            visible?: boolean;
        };

        function create(createProperties: CreateProperties, callback: () => void): ItemId;

        let onClicked: browser.events.Event<(info: OnClickData, tab: tabs.Tab) => void>;
    }

    namespace scripting {
        // TODO can you actually combine documentIds and allFrames?
        type InjectionTarget = RequireOneOrNone<
            {
                tabId: number;
                frameIds?: number[];
                documentIds?: string[];
                allFrames?: boolean;
            },
            'frameIds' | 'documentIds' | 'allFrames'
        >;
        type ExecutionWorld = 'ISOLATED' | 'MAIN';
        type ScriptInjection = RequireExactlyOne<
            {
                target: InjectionTarget;
                world?: ExecutionWorld;
                injectImmediately?: boolean;
                files: string[];
                func: () => void;
                args?: JsonValue[];
            },
            'func' | 'files'
        >;
        type InjectionResult = {
            documentId: string;
            frameId: number;
            result?: JsonValue;
        };
        function executeScript(injection: ScriptInjection): Promise<InjectionResult[]>;
    }
}

const global = globalThis as { browser?: typeof browser; chrome?: typeof browser };
// This check may have to change in the future, if chrome adds the browser namespace.
// https://github.com/w3c/webextensions/issues/113
// https://github.com/w3c/webextensions/issues/532
if (global.browser !== undefined) {
    // Nothing to do
} else if (global.chrome !== undefined) {
    // https://issues.chromium.org/issues/40753031?pli=1
    // Chromium does not support the Promise version of sendMessage, only "return true and call sendResponse".
    // This is a workaround to make it work like the Promise version.
    type ChromeCallbackType = (
        message: JsonObject,
        sender: browser.runtime.MessageSender,
        sendResponse: (response: JsonObject) => void,
    ) => boolean | undefined;

    const originalOnMessage = global.chrome.runtime.onMessage;
    const originalAddListener = originalOnMessage.addListener.bind(originalOnMessage) as any as (
        callback: ChromeCallbackType,
    ) => void;
    const originalHasListener = originalOnMessage.hasListener.bind(originalOnMessage);
    const originalRemoveListener = originalOnMessage.removeListener.bind(originalOnMessage);
    global.chrome.runtime.onMessage = {
        addListener(callback) {
            originalAddListener((message, sender, sendResponse) => {
                callback(message, sender).then(sendResponse as any);
                return true;
            });
        },
        removeListener: originalRemoveListener,
        hasListener: originalHasListener,
    };
    global.browser = global.chrome;
} else {
    throw new Error(
        'No webextension namespace found. Are you trying to import webextension.js in a non-extension context?',
    );
}
