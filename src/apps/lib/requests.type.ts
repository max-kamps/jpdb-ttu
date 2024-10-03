export type Sequence<TPromise = void, TData = unknown> = {
  sequence: number;
  promise: Promise<TPromise>;
  data: TData;
};

export type AbortableSequence<TPromise = void, TData = unknown> = Sequence<TPromise, TData> & {
  abort: () => void;
};
