import { browser } from '../util.js';
import { jsxCreateElement } from '../jsx.js';
const toastContainer = jsxCreateElement("div", null);
const shadow = toastContainer.attachShadow({ mode: 'closed' });
shadow.append(jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/themes.css') }), jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/common.css') }), jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/content/toast.css') }));
document.body.append(toastContainer);
export function showToast(kind, message, options = {}) {
    const toast = (jsxCreateElement("div", { class: 'toast' },
        jsxCreateElement("span", { class: 'kind' },
            kind,
            ":"),
        jsxCreateElement("span", { class: 'message' }, message),
        jsxCreateElement("span", { class: 'buttons' },
            options.action ? (jsxCreateElement("button", { class: 'action', onclick: options.action }, options.actionIcon ?? 'o')) : (''),
            jsxCreateElement("button", { class: 'close', onclick: () => {
                    shadow.removeChild(toast);
                    clearTimeout(timeout);
                } }, "\u2715"))));
    const timeout = options.timeout != Infinity
        ? setTimeout(() => {
            shadow.removeChild(toast);
        }, options.timeout ?? 3000)
        : undefined;
    shadow.append(toast);
}
export function showError(error) {
    console.error(error);
    showToast('Error', error.message, {
        timeout: 5000,
        actionIcon: '⎘',
        action() {
            navigator.clipboard.writeText(`Error: ${error.message}\n${error.stack}`);
            showToast('Info', 'Error copied to clipboard!', { timeout: 1000 });
        },
    });
}
