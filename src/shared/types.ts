type Filter<T, TF extends T[keyof T]> = {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};

export type Empty = Record<string, never>;
export type FilterKeys<T, TF extends T[keyof T]> = keyof Filter<T, TF>;
export type PotentialPromise<T> = T | Promise<T>;
