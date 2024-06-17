export * from './fn/adjacent-element';
export * from './fn/append-element';
export * from './fn/closest-element';
export * from './fn/count-elements';
export * from './fn/create-element';
export * from './fn/destroy-element';
export * from './fn/find-element';
export * from './fn/find-elements';
export * from './fn/hide-element';
export * from './fn/prepend-element';
export * from './fn/resolve-element';
export * from './fn/show-element';
export * from './fn/text-from-node';
export * from './fn/with-element';
export * from './fn/with-elements';

declare global {
  interface Document {
    ajb: {
      id: number;
    };
  }
}

document.ajb = { id: 0 };
