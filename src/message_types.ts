import { JsonObject, JsonValue } from 'type-fest';
import { CardState, Grade, Ruby, Token } from './types.js';

// Messages are what the content script and background page/worker use to communicate with each other.

type MessageInfo = {
    type: string;
    direction: 'content to background' | 'background to content' | 'either';
    payload: JsonObject;
    response: JsonValue | void;
};
type NewMessageInfo<T extends MessageInfo> = T;

export type Message<I extends MessageInfo> = { type: I['type']; abortHandle?: number } & I['payload'];
export type Response<I extends MessageInfo> = I['response'];

export type InfoFor<M extends Message<AnyMessageInfo>> = Extract<AnyMessageInfo, { type: M['type'] }>;
export type ResponseFor<M extends Message<AnyMessageInfo>> = Response<InfoFor<M>>;

export type BackgroundBoundMessageInfo = Extract<AnyMessageInfo, { direction: 'content to background' | 'either' }>;
export type ContentBoundMessageInfo = Extract<AnyMessageInfo, { direction: 'background to content' | 'either' }>;

export type AnyMessageInfo =
    | AbortMessageInfo
    | ParseMessageInfo
    | SetFlagMessageInfo
    | ReviewMessageInfo
    | MineMessageInfo
    | UpdateWordStateMessageInfo;

export type AbortMessageInfo = NewMessageInfo<{
    type: 'abort';
    direction: 'content to background';
    payload: {
        handle: number;
    };
    response: void;
}>;

export type ParseMessageInfo = NewMessageInfo<{
    type: 'parse';
    direction: 'content to background';
    payload: {
        text: string;
        rubies: Ruby[];
    };
    response: {
        result: Token[];
    };
}>;

export type SetFlagMessageInfo = NewMessageInfo<{
    type: 'setFlag';
    direction: 'content to background';
    payload: {
        vid: number;
        sid: number;
        flag: 'forq' | 'blacklist' | 'never-forget';
        state: boolean;
    };
    response: void;
}>;

export type ReviewMessageInfo = NewMessageInfo<{
    type: 'review';
    direction: 'content to background';
    payload: {
        vid: number;
        sid: number;
        rating: Grade;
    };
    response: void;
}>;

export type MineMessageInfo = NewMessageInfo<{
    type: 'mine';
    direction: 'content to background';
    payload: {
        vid: number;
        sid: number;
        forq: boolean;
        sentence: string | null;
        translation: string | null;
    };
    response: void;
}>;

export type UpdateWordStateMessageInfo = NewMessageInfo<{
    type: 'updateWordState';
    direction: 'background to content';
    payload: {
        words: [number, number, CardState][];
    };
    response: void;
}>;
