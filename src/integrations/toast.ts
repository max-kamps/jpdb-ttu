import { registerListener } from '@lib/messaging';
import { createElement, findElement } from '@lib/renderer';

const getOrCreateToastContainer = (): HTMLDivElement => {
  let shadowRoot: ShadowRoot = findElement<'div'>('#ajb-toast-container')?.shadowRoot;

  if (!shadowRoot) {
    const toastContainer = createElement('div', {
      id: 'ajb-toast-container',
    });
    shadowRoot = toastContainer.attachShadow({ mode: 'open' });

    shadowRoot.append(
      createElement('link', {
        attributes: { rel: 'stylesheet', href: chrome.runtime.getURL('styles/toast.css') },
      }),
      createElement('ul', { id: 'ajb-toast-item-container', class: 'notifications' }),
    );

    document.body.appendChild(toastContainer);
  }

  return shadowRoot.getElementById('ajb-toast-item-container') as HTMLDivElement;
};

const displayToast = (type: 'error' | 'success', message: string, timeoutDuration?: number) => {
  const container = getOrCreateToastContainer();
  const toast: HTMLLIElement = createElement('li', {
    class: ['toast', 'outline', type],
    handler: () => toast.classList.add('hide'),
    children: [
      {
        tag: 'div',
        class: ['column'],
        children: [
          {
            tag: 'span',
            innerHTML: message,
          },
          type === 'error'
            ? {
                tag: 'span',
                innerText: '⎘',
                handler(e) {
                  e.stopPropagation();

                  navigator.clipboard.writeText(message);
                },
              }
            : null,
        ],
      },
    ],
  });

  container.appendChild(toast);

  let timeout: NodeJS.Timeout | undefined;
  const startTimeout = (t: number = timeoutDuration): void => {
    if (timeout) {
      return;
    }

    timeout = setTimeout(() => {
      toast.classList.add('hide');

      stopTimeout();
      setTimeout(() => toast.remove(), 500);
    }, t);
  };
  const stopTimeout = (): void => {
    if (timeout) {
      clearTimeout(timeout);

      timeout = undefined;
    }
  };

  startTimeout();

  toast.addEventListener('mouseover', () => stopTimeout());
  toast.addEventListener('mouseout', () => startTimeout(500));
};

registerListener('toast', displayToast);
