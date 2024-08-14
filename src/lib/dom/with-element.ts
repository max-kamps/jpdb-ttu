import { findElement } from './find-element';

export function withElement<TResult = void>(
  selector: string,
  fn: (e: HTMLElement) => TResult,
): TResult;
export function withElement<K extends keyof HTMLElementTagNameMap, TResult = void>(
  selector: string,
  fn: (e: HTMLElementTagNameMap[K]) => TResult,
): TResult;
export function withElement<TResult = void>(
  domElement: HTMLElement,
  selector: string,
  fn: (e: HTMLElement) => TResult,
): TResult;
export function withElement<K extends keyof HTMLElementTagNameMap, TResult = void>(
  domElement: HTMLElement,
  selector: string,
  fn: (e: HTMLElementTagNameMap[K]) => TResult,
): TResult;

export function withElement(
  p0: string | HTMLElement,
  p1: string | ((e: HTMLElement) => void),
  p2?: (e: HTMLElement) => unknown,
): unknown {
  const e: HTMLElement = p2
    ? findElement(p0 as HTMLElement, p1 as string)
    : findElement(p0 as string);
  const fn = p2 ?? (p1 as (e: HTMLElement) => unknown);

  if (e) {
    return fn(e);
  }
}
