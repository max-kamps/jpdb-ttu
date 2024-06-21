import { install } from '@foreground/lib/install';
import { Parser } from './parser/parser';

install('parser', () => {
  new Parser().install();
});
