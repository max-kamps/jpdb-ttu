export function findElement(selector: string): HTMLElement;
export function findElement<K extends keyof HTMLElementTagNameMap>(
  selector: string,
  resultTag?: K,
): HTMLElementTagNameMap[K];
export function findElement(domElement: HTMLElement, selector: string): HTMLElement;
export function findElement<K extends keyof HTMLElementTagNameMap>(
  domElement: HTMLElement,
  selector: string,
  resultTag?: K,
): HTMLElementTagNameMap[K];

export function findElement(p0: string | HTMLElement, p1?: string, _?: string): HTMLElement | null {
  const root = typeof p0 === 'string' ? document : p0;
  const selector = typeof p0 === 'string' ? p0 : p1!;

  return root.querySelector(selector);
}
