declare type VisibleObserverOptions =
  | boolean
  | {
      include?: string;
      exclude?: string;
    };

declare type AddedObserverOptions = {
  notifyFor: string;
  observeFrom: string | string[];
  config: MutationObserverInit;
};

declare type HostMeta = {
  host: string | string[];
  auto: boolean;
  allFrames: boolean;
  custom?: 'BunproParser';
  disabled?: boolean;
  parse?: string;
  css?: string;
  parseVisibleObserver?: VisibleObserverOptions;
  addedObserver?: AddedObserverOptions;
};
