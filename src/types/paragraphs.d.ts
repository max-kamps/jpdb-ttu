declare type Fragment = {
  node: Text | CDATASection;
  start: number;
  end: number;
  length: number;
  hasRuby: boolean;
};
declare type Paragraph = Fragment[];
