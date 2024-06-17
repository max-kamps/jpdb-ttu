import { resolveElement } from './resolve-element';

export function showElement(element: string): void;
export function showElement<TElement extends HTMLElement = HTMLElement>(element: TElement): void;

export function showElement(element: string | HTMLElement): void {
  resolveElement(element)?.classList.remove('hidden');
}
