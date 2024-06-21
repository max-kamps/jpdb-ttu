import { createElement } from './create-element';
import { resolveElement } from './resolve-element';

export function prependElement<TChild extends HTMLElement = HTMLElement>(
  parent: string,
  element: TChild,
): TChild;
export function prependElement<
  TParent extends HTMLElement = HTMLElement,
  TChild extends HTMLElement = HTMLElement,
>(parent: TParent, element: TChild): TChild;
export function prependElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  parent: string,
  element: DOMElementTagOptions<K>,
): HTMLElementTagNameMap[K];
export function prependElement<
  TParent extends HTMLElement = HTMLElement,
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
>(parent: TParent, element: DOMElementTagOptions<K>): HTMLElementTagNameMap[K];

export function prependElement(
  parent: string | HTMLElement,
  child: HTMLElement | DOMElementTagOptions,
): HTMLElement {
  const e = child instanceof HTMLElement ? child : createElement(child);

  resolveElement(parent)?.prepend(e);

  return e;
}
