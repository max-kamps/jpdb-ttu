import { resolveElement } from './resolve-element';

export function textFromNode(element: string): string;
export function textFromNode<TElement extends HTMLElement = HTMLElement>(element: TElement): string;

export function textFromNode(element: string | HTMLElement): string | undefined {
  const el = resolveElement(element);

  if (!el) {
    return;
  }

  const texts = [];
  let child = el.firstChild;

  while (child) {
    if (child.nodeType == 3) {
      texts.push((child as unknown as { data: string }).data);
    }
    child = child.nextSibling;
  }

  return texts.join('');
}
