declare type Filter<T, TF extends T[keyof T]> = {
  [K in keyof T as T[K] extends TF ? K : never]: T[K];
};
declare type FilterKeys<T, TF extends T[keyof T]> = keyof Filter<T, TF>;

declare type PotentialPromise<T> = T | Promise<T>;
