export function closestElement(domElement: HTMLElement, selector: string): HTMLElement;
export function closestElement<K extends keyof HTMLElementTagNameMap>(
  domElement: HTMLElement,
  selector: string,
): HTMLElementTagNameMap[K];

export function closestElement(root: HTMLElement, selector: string): HTMLElement {
  return root.closest(selector) as unknown as HTMLElement;
}
