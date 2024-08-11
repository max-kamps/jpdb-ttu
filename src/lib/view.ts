import { Browser } from './browser';

interface DOMElementBaseOptions {
  id?: string;
  class?: string | string[];
  attributes?: Record<string, string | boolean>;
  style?: Partial<CSSStyleDeclaration>;
  innerText?: string | number;
  innerHTML?: string;
  handler?: (ev?: MouseEvent) => void;
}

type DOMElementOptions = DOMElementBaseOptions & {
  children?: (undefined | false | DOMElementTagOptions | HTMLElement)[];
};

type DOMElementTagOptions<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> =
  DOMElementOptions & {
    tag: K;
  };

export class View {
  public static onLoaded(listener: () => void | Promise<void>): void {
    this.on('DOMContentLoaded', listener);
  }

  public static on(event: string, listener: (event: Event) => void | Promise<void>): void {
    document.addEventListener(event, listener);
  }

  public static displayToast(
    type: 'error' | 'success',
    message: string,
    timeoutDuration: number = 5000,
  ): void {
    const container = this.getOrCreateToastContainer();
    const toast: HTMLLIElement = this.createElement('li', {
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
                  handler(e: Event) {
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
  }

  //#region View Manipulation

  //#region appendElement

  public static appendElement<TChild extends HTMLElement = HTMLElement>(
    parent: string,
    element: TChild,
  ): TChild;
  public static appendElement<
    TParent extends HTMLElement = HTMLElement,
    TChild extends HTMLElement = HTMLElement,
  >(parent: TParent, element: TChild): TChild;
  public static appendElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
    parent: string,
    element: DOMElementTagOptions<K>,
  ): HTMLElementTagNameMap[K];
  public static appendElement<
    TParent extends HTMLElement = HTMLElement,
    K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  >(parent: TParent, element: DOMElementTagOptions<K>): HTMLElementTagNameMap[K];

  public static appendElement(
    parent: string | HTMLElement,
    child: HTMLElement | DOMElementTagOptions,
  ): HTMLElement {
    const e = child instanceof HTMLElement ? child : this.createElement(child);

    this.resolveElement(parent)?.append(e);

    return e;
  }

  //#endregion appendElement
  //#region createElement

  public static createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: DOMElementOptions,
  ): HTMLElementTagNameMap[K];
  public static createElement<K extends keyof HTMLElementTagNameMap>(
    options: DOMElementTagOptions<K>,
  ): HTMLElementTagNameMap[K];

  public static createElement(
    p0: string | DOMElementTagOptions,
    p1?: DOMElementOptions,
  ): HTMLElement {
    if (!('ajb' in document)) {
      Object.assign(document, { ajb: { id: 0 } });
    }

    (document as any).ajb.id++;

    const tag = typeof p0 === 'string' ? p0 : p0.tag;
    const options = (p1 ?? p0 ?? {}) as DOMElementOptions;

    const e = document.createElement(tag);
    const id = options.id ?? `${tag}-${(document as any).ajb.id}`;

    e.setAttribute('id', id);

    if (options.innerText !== undefined) {
      e.innerText = String(options.innerText);
    }

    if (options.innerHTML) {
      e.innerHTML = options.innerHTML;
    }

    if (options.handler) {
      e.onclick = options.handler;
    }

    if (options.attributes) {
      for (const key of Object.keys(options.attributes)) {
        const value = options.attributes[key];

        if (value !== false) {
          e.setAttribute(key, value as string);
        }
      }
    }

    if (options.style) {
      for (const key of Object.keys(options.style)) {
        const style = options.style[key as keyof CSSStyleDeclaration];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (e.style as any)[key] = style;
      }
    }

    if (options.class) {
      options.class = Array.isArray(options.class) ? options.class : [options.class];
      e.classList.add(...options.class.filter(Boolean));
    }

    (options.children ?? [])
      .filter((ch) => ch)
      .forEach((ch: HTMLElement | DOMElementTagOptions<keyof HTMLElementTagNameMap>) =>
        this.appendElement(e, ch instanceof HTMLElement ? ch : this.createElement(ch)),
      );

    return e;
  }

  //#endregion createElement
  //#region findElement

  public static findElement(selector: string): HTMLElement;
  public static findElement<K extends keyof HTMLElementTagNameMap>(
    selector: string,
    resultTag?: K,
  ): HTMLElementTagNameMap[K];
  public static findElement(domElement: HTMLElement, selector: string): HTMLElement;
  public static findElement<K extends keyof HTMLElementTagNameMap>(
    domElement: HTMLElement,
    selector: string,
    resultTag?: K,
  ): HTMLElementTagNameMap[K];

  public static findElement(p0: string | HTMLElement, p1?: string, _?: string): HTMLElement | null {
    const root = typeof p0 === 'string' ? document : p0;
    const selector = typeof p0 === 'string' ? p0 : p1!;

    return root.querySelector(selector);
  }

  //#endregion findElement
  //#region findElements

  public static findElements(selector: string): HTMLElement[];
  public static findElements<K extends keyof HTMLElementTagNameMap>(
    selector: string,
    resultTag?: K,
  ): HTMLElementTagNameMap[K][];
  public static findElements(domElement: HTMLElement, selector: string): HTMLElement[];
  public static findElements<K extends keyof HTMLElementTagNameMap>(
    domElement: HTMLElement,
    selector: string,
    resultTag?: K,
  ): HTMLElementTagNameMap[K][];

  public static findElements(p0: string | HTMLElement, p1?: string, _?: string): HTMLElement[] {
    const root = typeof p0 === 'string' ? document : p0;
    const selector = typeof p0 === 'string' ? p0 : p1!;

    return Array.from(root.querySelectorAll(selector));
  }

  //#endregion findElements
  //#region resolveElement

  public static resolveElement<TResult extends HTMLElement = HTMLElement>(
    element: string | TResult,
  ): TResult | null {
    return typeof element === 'string' ? document.querySelector(element) : element;
  }

  //#endregion resolveElement
  //#region withElement

  public static withElement<TResult = void>(
    selector: string,
    fn: (e: HTMLElement) => TResult,
  ): TResult;
  public static withElement<K extends keyof HTMLElementTagNameMap, TResult = void>(
    selector: string,
    fn: (e: HTMLElementTagNameMap[K]) => TResult,
  ): TResult;
  public static withElement<TResult = void>(
    domElement: HTMLElement,
    selector: string,
    fn: (e: HTMLElement) => TResult,
  ): TResult;
  public static withElement<K extends keyof HTMLElementTagNameMap, TResult = void>(
    domElement: HTMLElement,
    selector: string,
    fn: (e: HTMLElementTagNameMap[K]) => TResult,
  ): TResult;

  public static withElement(
    p0: string | HTMLElement,
    p1: string | ((e: HTMLElement) => void),
    p2?: (e: HTMLElement) => unknown,
  ): unknown {
    const e: HTMLElement = p2
      ? this.findElement(p0 as HTMLElement, p1 as string)
      : this.findElement(p0 as string);
    const fn = p2 ?? (p1 as (e: HTMLElement) => unknown);

    if (e) {
      return fn(e);
    }
  }

  //#endregion withElement
  //#region withElements

  public static withElements<TResult = void>(
    selector: string,
    fn: (e: HTMLElement) => TResult,
  ): TResult[];
  public static withElements<K extends keyof HTMLElementTagNameMap, TResult = void>(
    selector: string,
    fn: (e: HTMLElementTagNameMap[K]) => TResult,
  ): TResult[];
  public static withElements<TResult = void>(
    domElement: HTMLElement,
    selector: string,
    fn: (e: HTMLElement) => TResult,
  ): TResult[];
  public static withElements<K extends keyof HTMLElementTagNameMap, TResult = void>(
    domElement: HTMLElement,
    selector: string,
    fn: (e: HTMLElementTagNameMap[K]) => TResult,
  ): TResult[];

  public static withElements(
    p0: string | HTMLElement,
    p1: string | ((e: HTMLElement) => unknown),
    p2?: (e: HTMLElement) => unknown,
  ): unknown {
    const e: HTMLElement[] = p2
      ? this.findElements(p0 as HTMLElement, p1 as string)
      : this.findElements(p0 as string);
    const fn = p2 ?? (p1 as (e: HTMLElement) => unknown);

    return e.map((c) => fn(c));
  }

  //#endregion withElements

  //#endregion

  private static getOrCreateToastContainer(): HTMLDivElement {
    let shadowRoot: ShadowRoot = this.findElement<'div'>('#ajb-toast-container')?.shadowRoot;

    if (!shadowRoot) {
      const toastContainer = this.createElement('div', {
        id: 'ajb-toast-container',
      });
      shadowRoot = toastContainer.attachShadow({ mode: 'open' });

      shadowRoot.append(
        this.createElement('link', {
          attributes: { rel: 'stylesheet', href: Browser.styleUrl('styles/toast') },
        }),
        this.createElement('ul', { id: 'ajb-toast-item-container', class: 'notifications' }),
      );

      document.body.appendChild(toastContainer);
    }

    return shadowRoot.getElementById('ajb-toast-item-container') as HTMLDivElement;
  }
}
