import { getCallable } from './get-callable';

export function getSequenceCallable<TArgs extends any[], TOut>(
  key: string,
): (sequence: number, ...args: TArgs) => Promise<TOut> {
  return getCallable(key);
}
