export type Fragment = {
  node: Text | CDATASection;
  start: number;
  end: number;
  length: number;
  hasRuby: boolean;
};
export type Paragraph = Fragment[];
