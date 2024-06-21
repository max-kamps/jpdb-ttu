import { findElements } from './find-elements';

export function countElements(selector: string): number;
export function countElements(domElement: HTMLElement, selector: string): number;

export function countElements(p0: string | HTMLElement, p1?: string): number {
  return findElements(p0 as HTMLElement, p1!).length;
}
