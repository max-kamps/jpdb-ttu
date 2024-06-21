import { findElements } from './find-elements';

export function withElements<TResult = void>(
  selector: string,
  fn: (e: HTMLElement) => TResult,
): TResult[];
export function withElements<K extends keyof HTMLElementTagNameMap, TResult = void>(
  selector: string,
  fn: (e: HTMLElementTagNameMap[K]) => TResult,
): TResult[];
export function withElements<TResult = void>(
  domElement: HTMLElement,
  selector: string,
  fn: (e: HTMLElement) => TResult,
): TResult[];
export function withElements<K extends keyof HTMLElementTagNameMap, TResult = void>(
  domElement: HTMLElement,
  selector: string,
  fn: (e: HTMLElementTagNameMap[K]) => TResult,
): TResult[];

export function withElements(
  p0: string | HTMLElement,
  p1: string | ((e: HTMLElement) => unknown),
  p2?: (e: HTMLElement) => unknown,
): unknown {
  const e: HTMLElement[] = p2
    ? findElements(p0 as HTMLElement, p1 as string)
    : findElements(p0 as string);
  const fn = p2 ?? (p1 as (e: HTMLElement) => unknown);

  return e.map((c) => fn(c));
}
