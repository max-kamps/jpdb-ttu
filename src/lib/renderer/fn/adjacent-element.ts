import { createElement } from './create-element';
import { resolveElement } from './resolve-element';

export function adjacentElement<TChild extends HTMLElement = HTMLElement>(
  parent: string,
  position: InsertPosition,
  element: TChild,
): TChild;
export function adjacentElement<
  TParent extends HTMLElement = HTMLElement,
  TChild extends HTMLElement = HTMLElement,
>(parent: TParent, position: InsertPosition, element: TChild): TChild;
export function adjacentElement<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
>(
  parent: string,
  position: InsertPosition,
  element: DOMElementTagOptions<K>,
): HTMLElementTagNameMap[K];
export function adjacentElement<
  TParent extends HTMLElement = HTMLElement,
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
>(
  parent: TParent,
  position: InsertPosition,
  element: DOMElementTagOptions<K>,
): HTMLElementTagNameMap[K];

export function adjacentElement(
  parent: string | HTMLElement,
  position: InsertPosition,
  child: HTMLElement | DOMElementTagOptions,
): HTMLElement {
  const e = child instanceof HTMLElement ? child : createElement(child);

  resolveElement(parent)?.insertAdjacentElement(position, e);

  return e;
}
