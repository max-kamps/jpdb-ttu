import { Parser } from './parser/parser';

if (!(window as any).___PARSER_INSTALLED) {
  new Parser().install();
}

(window as any).___PARSER_INSTALLED = true;
