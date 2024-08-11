import { resolveElement } from './resolve-element';

export function destroyElement(element: string): void;
export function destroyElement<TElement extends HTMLElement = HTMLElement>(element: TElement): void;

export function destroyElement(element: string | HTMLElement): void {
  resolveElement(element)?.remove();
}
