export function findElements(selector: string): HTMLElement[];
export function findElements<K extends keyof HTMLElementTagNameMap>(
  selector: string,
  resultTag?: K,
): HTMLElementTagNameMap[K][];
export function findElements(domElement: HTMLElement, selector: string): HTMLElement[];
export function findElements<K extends keyof HTMLElementTagNameMap>(
  domElement: HTMLElement,
  selector: string,
  resultTag?: K,
): HTMLElementTagNameMap[K][];

export function findElements(p0: string | HTMLElement, p1?: string, _?: string): HTMLElement[] {
  const root = typeof p0 === 'string' ? document : p0;
  const selector = typeof p0 === 'string' ? p0 : p1!;

  return Array.from(root.querySelectorAll(selector));
}
