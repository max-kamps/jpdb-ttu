export const [browser, isChrome] = (() => {
    if (globalThis.browser !== undefined) {
        return [globalThis.browser, false];
    }
    else {
        return [chrome, true];
    }
})();
export function assert(condition, message) {
    if (!condition) {
        debugger;
        throw Error(`Failed assertion: ${message}`);
    }
}
export function assertNonNull(obj) {
    if (obj === null || obj === undefined) {
        debugger;
        throw Error(`Failed assertion: expected object to not be null/undefined`);
    }
}
export function nonNull(obj) {
    if (obj === null || obj === undefined) {
        debugger;
        throw Error(`Failed assertion: expected object to not be null/undefined`);
    }
    return obj;
}
/** Convenient wrapper to turn object-with-callbacks APIs like IndexedDB or XMLHttpRequest into promises. */
export function wrap(obj, func) {
    return new Promise((resolve, reject) => {
        func(obj, resolve, reject);
    });
}
/** Sleep for the specified number of milliseconds, then resolve */
export function sleep(timeMs) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, timeMs);
    });
}
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
/** Read from an extension-relative file */
export async function readExtFile(path) {
    try {
        const resp = await fetch(browser.runtime.getURL(path));
        return await resp.text();
    }
    catch (error) {
        throw new Error(`Could not read file ${path}: ${error.message}`, { cause: error });
    }
}
export function snakeToCamel(string) {
    return string.replaceAll(/(?<!^_*)_(.)/g, (m, p1) => p1.toUpperCase());
}
export function truncate(string, maxLength) {
    return string.length <= maxLength ? string : string.slice(0, maxLength - 1) + '…';
}
export class Canceled extends Error {
}
