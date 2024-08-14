export interface DOMElementBaseOptions {
  id?: string;
  class?: string | string[];
  attributes?: Record<string, string | boolean>;
  style?: Partial<CSSStyleDeclaration>;
  innerText?: string | number;
  innerHTML?: string;
  handler?: (ev?: MouseEvent) => void;
}

export type DOMElementOptions = DOMElementBaseOptions & {
  children?: (undefined | false | DOMElementTagOptions | HTMLElement)[];
};

export type DOMElementTagOptions<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> = DOMElementOptions & {
  tag: K;
};
