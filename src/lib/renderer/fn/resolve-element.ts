export function resolveElement<TResult extends HTMLElement = HTMLElement>(
  element: string | TResult,
): TResult | null {
  return typeof element === 'string' ? document.querySelector(element) : element;
}
