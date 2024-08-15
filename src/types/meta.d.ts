declare type VisibleObserverOptions =
  | boolean
  | {
      include?: string;
      exclude?: string;
    };

declare type AddedObserverOptions = {
  selector: string;
  initWith: string;
  fallback?: string;
  config?: MutationObserverInit;
};

declare type HostMeta = {
  host: string | string[];
  auto: boolean;
  disabled?: boolean;
  parse?: string;
  css?: string;
  visibleObserver?: VisibleObserverOptions;
  addedObserver?: AddedObserverOptions;
};
