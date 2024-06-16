import { browser } from '../util.js';
import { jsxCreateElement } from './jsx.js';

class Toast {
  private static _shadow: ShadowRoot;

  public static show(
    kind: string,
    message: string,
    options: { action?: () => void; actionIcon?: string; timeout?: number } = {},
  ) {
    console.log('Toast.show', kind, message, options);
    const timeout =
      options.timeout != Infinity
        ? setTimeout(() => {
            this._getShadow().removeChild(toast);
          }, options.timeout ?? 3000)
        : undefined;

    const toast = jsxCreateElement(
      'div',
      { class: 'toast' },
      jsxCreateElement('span', { class: 'kind' }, kind, ':'),
      jsxCreateElement('span', { class: 'message' }, message),
      jsxCreateElement(
        'span',
        { class: 'buttons' },
        options.action
          ? jsxCreateElement(
              'button',
              { class: 'action', onclick: options.action },
              options.actionIcon ?? 'o',
            )
          : '',
        jsxCreateElement(
          'button',
          {
            class: 'close',
            onclick: () => {
              this._getShadow().removeChild(toast);

              clearTimeout(timeout);
            },
          },
          '\u2715',
        ),
      ),
    );

    this._shadow.append(toast);
  }

  private static _getShadow(): ShadowRoot {
    if (!this._shadow) {
      const toastContainer = jsxCreateElement('div', null);

      this._shadow = toastContainer.attachShadow({ mode: 'closed' });
      this._shadow.append(
        jsxCreateElement('link', {
          rel: 'stylesheet',
          href: browser.runtime.getURL('styles/themes.css'),
        }),
        jsxCreateElement('link', {
          rel: 'stylesheet',
          href: browser.runtime.getURL('styles/common.css'),
        }),
        jsxCreateElement('link', {
          rel: 'stylesheet',
          href: browser.runtime.getURL('styles/toast.css'),
        }),
      );

      document.body.append(toastContainer);
    }

    return this._shadow;
  }
}

export function showToast(
  kind: string,
  message: string,
  options: { action?: () => void; actionIcon?: string; timeout?: number } = {},
) {
  Toast.show(kind, message, options);
}

export function showError(error: Error) {
  Toast.show('Error', error.message, {
    timeout: 5000,
    actionIcon: '⎘',
    action() {
      navigator.clipboard.writeText(`Error: ${error.message}\n${error.stack}`);

      Toast.show('Info', 'Error copied to clipboard!', { timeout: 1000 });
    },
  });
}
