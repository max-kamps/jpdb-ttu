import { resolveElement } from './resolve-element';

export function hideElement(element: string): void;
export function hideElement<TElement extends HTMLElement = HTMLElement>(element: TElement): void;

export function hideElement(element: string | HTMLElement): void {
  resolveElement(element)?.classList.add('hidden');
}
